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

// 解析组件文件并生成文档
const generateComponentDoc = (filePath) => {
  try {
    // 读取组件文件内容
    const content = fs.readFileSync(filePath, 'utf-8');
    const componentName = path.basename(filePath, '.vue');
    
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
    
    if (exampleMatch && exampleMatch[1]) {
      const exampleCode = exampleMatch[1].trim();
      markdownContent += `## 示例\n\n\`\`\`vue\n${exampleCode}\n\`\`\`\n\n`;
    }
    
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
    const docFilePath = path.join(docsDir, `${componentName}.md`);
    fs.writeFileSync(docFilePath, markdownContent);
    
    console.log(`✅ 组件文档已生成: ${docFilePath}`);
    return true;
  } catch (error) {
    console.error(`❌ 为 ${filePath} 生成文档时出错:`, error);
    console.error(error.stack);
    return false;
  }
};

// 主函数
const main = async () => {
  try {
    const stagedFiles = await getStagedFiles();
    
    // 筛选出组件目录下的 .vue 文件
    const componentFiles = stagedFiles.filter(file => 
      file.startsWith('src/components/') && file.endsWith('.vue')
    );
    
    if (componentFiles.length === 0) {
      console.log('📝 没有组件文件被修改，跳过文档生成');
      process.exit(0);
    }
    
    console.log(`🔍 检测到 ${componentFiles.length} 个组件文件变更`);
    
    // 为每个组件文件生成文档
    let success = true;
    for (const file of componentFiles) {
      const fullPath = path.join(rootDir, file);
      if (fs.existsSync(fullPath)) {
        const result = generateComponentDoc(fullPath);
        success = success && result;
      }
    }
    
    if (success) {
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