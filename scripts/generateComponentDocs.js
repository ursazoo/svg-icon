#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const docsDir = path.join(rootDir, 'docs/components');

// 确保文档目录存在
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

// 获取暂存的文件
const getStagedFiles = () => {
  return new Promise((resolve, reject) => {
    exec('git diff --staged --name-only', (error, stdout) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout.trim().split('\n'));
    });
  });
};

// 从JSDoc中清除多余内容
const cleanJSDocText = (text) => {
  return text
    .replace(/\s*\*\s*/g, ' ')
    .replace(/@example[\s\S]*?(?=@|$)/g, '')
    .replace(/@.*$/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * 自动生成组件示例代码
 * 基于MCP (Model Context Protocol)，为组件生成示例代码
 */
const generateExampleCode = (componentName, props) => {
  // 如果没有props，返回简单示例
  if (!props || props.length === 0) {
    return `<${componentName} />`;
  }
  
  // 为每个prop生成示例值
  const propExamples = props.map(prop => {
    const { name, type, default: defaultValue, required } = prop;
    
    // 如果有默认值且不是必填，可以跳过
    if (defaultValue && !required) {
      return null;
    }
    
    // 根据类型生成示例值
    let exampleValue = '';
    
    if (type.includes('string')) {
      // 字符串类型
      if (name.includes('color')) {
        exampleValue = '"#42b883"'; // Vue绿色
      } else if (name.includes('name') || name.includes('title')) {
        exampleValue = '"示例' + name + '"';
      } else if (name.includes('msg') || name.includes('message')) {
        exampleValue = '"这是一条消息"';
      } else {
        exampleValue = '"' + name + '内容"';
      }
    } else if (type.includes('number')) {
      // 数字类型
      if (name.includes('size')) {
        exampleValue = '24';
      } else if (name.includes('max')) {
        exampleValue = '100';
      } else if (name.includes('min')) {
        exampleValue = '0';
      } else {
        exampleValue = '42';
      }
    } else if (type.includes('boolean')) {
      // 布尔类型
      exampleValue = 'true';
    } else if (type.includes('Array') || type.includes('[]')) {
      // 数组类型
      exampleValue = '[]';
    } else if (type.includes('object') || type.includes('Object')) {
      // 对象类型
      exampleValue = '{}';
    } else {
      // 其他类型
      exampleValue = '"' + name + '值"';
    }
    
    return `${name}=${exampleValue}`;
  }).filter(Boolean); // 过滤掉null值
  
  // 生成组件标签
  if (propExamples.length === 0) {
    return `<${componentName} />`;
  } else if (propExamples.length <= 3) {
    // 简单内联形式
    return `<${componentName} ${propExamples.join(' ')} />`;
  } else {
    // 多行形式
    return `<${componentName}\n  ${propExamples.join('\n  ')}\n/>`;
  }
};

/**
 * 生成组件完整示例，包括子元素
 */
const generateFullExample = (componentName, props, templateContent) => {
  const baseExample = generateExampleCode(componentName, props);
  
  // 根据组件名称添加特殊处理
  if (componentName === 'SvgIcon') {
    // SvgIcon组件需要添加路径元素
    return baseExample.replace(' />', '>\n  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.272.098-2.65 0 0 .84-.269 2.75 1.022A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.291 2.747-1.022 2.747-1.022.546 1.378.202 2.397.1 2.65.64.699 1.026 1.592 1.026 2.683 0 3.842-2.339 4.687-4.566 4.933.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" fill="currentColor" />\n</SvgIcon>');
  }
  
  // 如果模板中包含slot，添加一些内容
  if (templateContent && templateContent.includes('<slot') && !baseExample.includes('>')) {
    return baseExample.replace(' />', '>\n  内容\n</' + componentName + '>');
  }
  
  return baseExample;
};

// 解析组件文件并生成文档
const generateComponentDoc = (filePath) => {
  try {
    // 读取组件文件内容
    const content = fs.readFileSync(filePath, 'utf-8');
    const componentName = path.basename(filePath, '.vue');
    const docFilePath = path.join(docsDir, `${componentName}.md`);
    
    // 检查文档是否已存在
    let existingDoc = '';
    let existingDescription = '';
    
    if (fs.existsSync(docFilePath)) {
      existingDoc = fs.readFileSync(docFilePath, 'utf-8');
      
      // 提取现有文档的描述
      const lines = existingDoc.split('\n');
      let titleIndex = -1;
      let sectionIndex = -1;
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('# ')) {
          titleIndex = i;
        } else if (lines[i].startsWith('## ') && titleIndex !== -1) {
          sectionIndex = i;
          break;
        }
      }
      
      if (titleIndex !== -1 && sectionIndex !== -1 && sectionIndex > titleIndex + 1) {
        // 提取标题和第一个章节之间的内容作为描述
        existingDescription = lines.slice(titleIndex + 1, sectionIndex)
          .filter(line => line.trim())
          .join('\n');
      }
    }
    
    // 从组件内容中提取信息
    const scriptContent = content.match(/<script[\s\S]*?>([\s\S]*?)<\/script>/)?.[1] || '';
    const templateContent = content.match(/<template[\s\S]*?>([\s\S]*?)<\/template>/)?.[1] || '';
    const styleMatch = content.match(/<style[\s\S]*?>([\s\S]*?)<\/style>/);
    
    // 提取组件描述
    const descriptionMatch = scriptContent.match(/\/\*\*\s*([\s\S]*?)\s*\*\//);
    let description = '';
    
    if (descriptionMatch && descriptionMatch[1]) {
      description = cleanJSDocText(descriptionMatch[1]);
    }
    
    // 如果现有文档中有描述，优先使用现有的
    if (existingDescription) {
      description = existingDescription;
    }
    
    // 手动提取 Props
    const props = [];
    
    // 找到 interface Props
    const propsInterfaceMatch = scriptContent.match(/interface\s+Props\s*{([^}]*)}/);
    
    if (propsInterfaceMatch && propsInterfaceMatch[1]) {
      const propsInterface = propsInterfaceMatch[1];
      
      // 提取每个属性的注释和定义
      const propBlocks = propsInterface.split(/\n\s*\n/).filter(block => block.trim());
      
      for (const block of propBlocks) {
        // 提取属性注释
        const commentMatch = block.match(/\/\*\*\s*([\s\S]*?)\s*\*\//);
        let propComment = '';
        
        if (commentMatch && commentMatch[1]) {
          propComment = cleanJSDocText(commentMatch[1]);
        }
        
        // 提取属性定义
        const propDefMatch = block.match(/([a-zA-Z0-9_]+)(\??):\s*([^;\n]*)/);
        
        if (propDefMatch) {
          const propName = propDefMatch[1];
          const isOptional = propDefMatch[2] === '?';
          const propType = propDefMatch[3].trim();
          
          // 查找默认值
          const withDefaultsMatch = scriptContent.match(/withDefaults\s*\(\s*defineProps[\s\S]*?,\s*{([^}]*)}\s*\)/);
          let defaultValue = '';
          
          if (withDefaultsMatch && withDefaultsMatch[1]) {
            const defaultsBlock = withDefaultsMatch[1];
            const defaultMatch = defaultsBlock.match(new RegExp(`${propName}:\\s*['"]?([^'",}]*)['"]?`));
            
            if (defaultMatch) {
              defaultValue = defaultMatch[1].trim();
            }
          }
          
          props.push({
            name: propName,
            type: propType,
            required: !isOptional,
            description: propComment,
            default: defaultValue
          });
        }
      }
    }
    
    // 生成 Markdown 文档
    let markdownContent = `# ${componentName}\n\n`;
    
    if (description) {
      markdownContent += `${description}\n\n`;
    }
    
    // 提取示例代码
    const exampleMatch = scriptContent.match(/@example\s*```vue\s*([\s\S]*?)```/);
    
    // 使用自定义示例或生成示例
    let exampleCode = '';
    if (exampleMatch && exampleMatch[1]) {
      exampleCode = exampleMatch[1].trim();
    } else {
      // 自动生成示例代码
      exampleCode = generateFullExample(componentName, props, templateContent);
    }
    
    // 添加示例部分
    markdownContent += `## 示例\n\n\`\`\`vue\n${exampleCode}\n\`\`\`\n\n`;
    
    if (props.length > 0) {
      markdownContent += `## Props\n\n`;
      markdownContent += `| 名称 | 类型 | 必填 | 默认值 | 描述 |\n`;
      markdownContent += `|------|------|:------:|------|------|\n`;
      
      props.forEach(prop => {
        markdownContent += `| ${prop.name} | \`${prop.type}\` | ${prop.required ? '✓' : ''} | ${prop.default || '-'} | ${prop.description || '-'} |\n`;
      });
      
      markdownContent += `\n`;
    }
    
    if (templateContent) {
      markdownContent += `## 模板\n\n`;
      markdownContent += "```vue\n";
      markdownContent += `<template>\n  ${templateContent.trim().split('\n').join('\n  ')}\n</template>\n`;
      markdownContent += "```\n\n";
    }
    
    if (styleMatch && styleMatch[1]) {
      const styleType = styleMatch[0].match(/<style\s+([^>]*)>/);
      const styleTypeStr = styleType ? styleType[1] : '';
      
      markdownContent += `## 样式\n\n`;
      markdownContent += `组件使用 ${styleTypeStr || 'CSS'} 样式。\n\n`;
      
      markdownContent += "```" + (styleTypeStr.includes('scss') ? 'scss' : 'css') + "\n";
      markdownContent += styleMatch[1].trim();
      markdownContent += "\n```\n";
    }
    
    // 写入文档文件
    fs.writeFileSync(docFilePath, markdownContent);
    
    console.log(`✅ 组件文档已生成: ${docFilePath}`);
    return true;
  } catch (error) {
    console.error(`❌ 为 ${filePath} 生成文档时出错:`, error);
    console.error(error.stack);
    return false;
  }
};

/**
 * 更新组件目录索引
 * 该函数扫描 docs/components 目录下的所有 .md 文件，
 * 并按照组件类型更新 index.md 文件中的组件列表
 */
const updateComponentIndex = () => {
  try {
    console.log('📑 更新组件文档索引...');
    
    // 获取所有组件文档文件
    const docFiles = fs.readdirSync(docsDir)
      .filter(file => file.endsWith('.md') && file !== 'index.md');
    
    // 组件分类
    const componentsByCategory = {
      '基础组件': [],
      '导航组件': [],
      '表单组件': [],
      '数据展示': [],
      '反馈组件': [],
      '布局组件': [],
      '示例组件': []
    };
    
    // 读取每个组件文档，提取组件名称和描述
    for (const docFile of docFiles) {
      const componentName = path.basename(docFile, '.md');
      const docContent = fs.readFileSync(path.join(docsDir, docFile), 'utf-8');
      
      // 提取组件描述
      let description = '';
      
      // 先找到标题行的位置
      const lines = docContent.split('\n');
      let titleLineIndex = -1;
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('# ')) {
          titleLineIndex = i;
          break;
        }
      }
      
      if (titleLineIndex !== -1) {
        // 从标题行后开始，寻找第一个非空行作为描述开始
        let startIndex = -1;
        
        for (let i = titleLineIndex + 1; i < lines.length; i++) {
          if (lines[i].trim() !== '') {
            startIndex = i;
            break;
          }
        }
        
        if (startIndex !== -1) {
          // 从描述开始，一直到遇到下一个标题或代码块
          let endIndex = -1;
          
          for (let i = startIndex; i < lines.length; i++) {
            if (lines[i].startsWith('## ') || lines[i].startsWith('```')) {
              endIndex = i;
              break;
            }
          }
          
          if (endIndex !== -1) {
            // 提取描述文本并清理
            description = lines.slice(startIndex, endIndex).join(' ').trim();
          }
        }
      }
      
      // 根据组件名称或描述进行分类
      let category = '示例组件'; // 默认分类
      
      if (componentName.includes('Icon') || componentName.includes('Button') || 
          componentName === 'SvgIcon') {
        category = '基础组件';
      } else if (componentName.includes('Nav') || componentName.includes('Menu') || 
                componentName.includes('Header') || componentName.includes('Footer')) {
        category = '导航组件';
      } else if (componentName.includes('Form') || componentName.includes('Input') || 
                componentName.includes('Select') || componentName.includes('Checkbox')) {
        category = '表单组件';
      } else if (componentName.includes('Table') || componentName.includes('List') || 
                componentName.includes('Card')) {
        category = '数据展示';
      } else if (componentName.includes('Modal') || componentName.includes('Toast') || 
                componentName.includes('Alert')) {
        category = '反馈组件';
      } else if (componentName.includes('Layout') || componentName.includes('Grid') || 
                componentName.includes('Container')) {
        category = '布局组件';
      }
      
      // 添加到对应分类
      componentsByCategory[category].push({
        name: componentName,
        description: description.trim()
      });
    }
    
    // 生成索引文件内容
    let indexContent = '# 组件\n\n';
    indexContent += 'SVG 图标组件库提供了以下组件：\n\n';
    
    // 添加各分类的组件
    Object.keys(componentsByCategory).forEach(category => {
      const components = componentsByCategory[category];
      
      if (components.length > 0) {
        indexContent += `## ${category}\n\n`;
        
        components.forEach(component => {
          const description = component.description 
            ? ` - ${component.description}` 
            : '';
          indexContent += `- [${component.name}](./${component.name}.md)${description}\n`;
        });
        
        indexContent += '\n';
      }
    });
    
    // 添加组件设计原则
    indexContent += `## 组件设计原则\n\n`;
    indexContent += `1. **直观易用**：API 设计简单明了，参数命名直观\n`;
    indexContent += `2. **功能聚焦**：每个组件专注于解决特定问题\n`;
    indexContent += `3. **可定制性**：提供足够的自定义选项\n`;
    indexContent += `4. **高性能**：组件实现考虑性能优化\n`;
    indexContent += `5. **可访问性**：符合 WAI-ARIA 规范和最佳实践\n`;
    
    // 写入索引文件
    const indexPath = path.join(docsDir, 'index.md');
    fs.writeFileSync(indexPath, indexContent);
    
    console.log(`✅ 组件索引已更新: ${indexPath}`);
    return true;
  } catch (error) {
    console.error('❌ 更新组件索引时出错:', error);
    console.error(error.stack);
    return false;
  }
};

// 主函数
const main = async () => {
  try {
    // 检查是否有 --force 参数
    const forceGeneration = process.argv.includes('--force');
    
    let componentFiles = [];
    
    if (forceGeneration) {
      // 强制模式：处理 src/components 目录下的所有 .vue 文件
      console.log('🔄 强制模式：处理所有组件文件');
      const componentsDir = path.join(rootDir, 'src/components');
      
      const getAllFiles = (dir) => {
        const files = fs.readdirSync(dir, { withFileTypes: true });
        let vueFiles = [];
        
        for (const file of files) {
          const fullPath = path.join(dir, file.name);
          if (file.isDirectory()) {
            vueFiles = vueFiles.concat(getAllFiles(fullPath));
          } else if (file.name.endsWith('.vue')) {
            vueFiles.push(fullPath);
          }
        }
        
        return vueFiles;
      };
      
      componentFiles = getAllFiles(componentsDir);
    } else {
      // 正常模式：只处理暂存区中的文件
      const stagedFiles = await getStagedFiles();
      
      // 筛选出组件目录下的 .vue 文件
      componentFiles = stagedFiles
        .filter(file => file.startsWith('src/components/') && file.endsWith('.vue'))
        .map(file => path.join(rootDir, file));
    }
    
    if (componentFiles.length === 0) {
      console.log('📝 没有组件文件被' + (forceGeneration ? '找到' : '修改') + '，跳过文档生成');
      process.exit(0);
    }
    
    console.log(`🔍 检测到 ${componentFiles.length} 个组件文件` + (forceGeneration ? '' : '变更'));
    
    // 为每个组件文件生成文档
    let success = true;
    for (const fullPath of componentFiles) {
      if (fs.existsSync(fullPath)) {
        const result = generateComponentDoc(fullPath);
        success = success && result;
      }
    }
    
    if (success) {
      // 更新组件索引
      const indexUpdated = updateComponentIndex();
      success = success && indexUpdated;
      
      // 将生成的文档添加到暂存区
      exec('git add docs/components/*.md', (error) => {
        if (error) {
          console.error('❌ 无法将文档添加到暂存区:', error);
          process.exit(1);
        }
        console.log('✅ 所有组件文档已生成并添加到暂存区');
        process.exit(0);
      });
    } else {
      console.error('❌ 部分组件文档生成失败');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ 执行脚本时出错:', error);
    console.error(error.stack);
    process.exit(1);
  }
};

main(); 