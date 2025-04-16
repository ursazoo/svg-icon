/**
 * Vue组件解析器
 * 
 * 用于提取Vue组件的相关信息，包括组件名称、描述、属性、例子和样式
 */

const fs = require('fs');
const path = require('path');
const compiler = require('vue-template-compiler');

/**
 * 解析Vue组件
 */
class Parser {
  /**
   * 解析Vue组件文件
   * @param {string} filePath - 组件文件路径
   * @returns {Promise<Object>} 组件信息
   */
  async parseComponent(filePath) {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    const parsedComponent = compiler.parseComponent(content);
    
    // 提取基本信息
    const componentName = this.extractComponentName(filePath, parsedComponent);
    const componentDescription = this.extractComponentDescription(parsedComponent.script ? parsedComponent.script.content : '');
    
    // 提取属性
    const props = this.extractProps(parsedComponent.script ? parsedComponent.script.content : '');
    
    // 提取模板示例
    const template = this.extractTemplate(parsedComponent.template ? parsedComponent.template.content : '');
    
    // 提取样式
    const styles = this.extractStyles(parsedComponent.styles);
    
    return {
      name: componentName,
      filePath,
      description: componentDescription,
      props,
      template,
      styles
    };
  }
  
  /**
   * 提取组件名称
   * @param {string} filePath - 组件文件路径
   * @param {Object} parsedComponent - 解析后的组件对象
   * @returns {string} 组件名称
   */
  extractComponentName(filePath, parsedComponent) {
    // 首先尝试从脚本中获取名称
    if (parsedComponent.script) {
      const nameMatch = parsedComponent.script.content.match(/name:\s*['"]([^'"]+)['"]/);
      if (nameMatch && nameMatch[1]) {
        return nameMatch[1];
      }
    }
    
    // 如果脚本中没有定义名称，则使用文件名
    return path.basename(filePath, '.vue');
  }
  
  /**
   * 提取组件描述
   * @param {string} scriptContent - 脚本内容
   * @returns {string} 组件描述
   */
  extractComponentDescription(scriptContent) {
    // 尝试从组件上方的JSDoc注释中提取描述
    const jsDocMatch = scriptContent.match(/\/\*\*\s*\n([^@]*?)(\s*\*\s*@|\s*\*\/)/s);
    if (jsDocMatch && jsDocMatch[1]) {
      return this.cleanJSDocText(jsDocMatch[1]);
    }
    
    return '';
  }
  
  /**
   * 清理JSDoc文本
   * @param {string} text - JSDoc文本
   * @returns {string} 清理后的文本
   */
  cleanJSDocText(text) {
    return text
      .replace(/^\s*\*\s*/gm, '') // 移除每行开头的 * 
      .trim();
  }
  
  /**
   * 提取组件属性
   * @param {string} scriptContent - 脚本内容
   * @returns {Array<Object>} 属性数组
   */
  extractProps(scriptContent) {
    const props = [];
    
    // 尝试匹配props对象
    const propsMatch = scriptContent.match(/props:\s*{([^}]+)}/s);
    if (propsMatch && propsMatch[1]) {
      const propsContent = propsMatch[1];
      
      // 匹配每个属性定义
      const propRegex = /(\w+):\s*{([^}]+)}/g;
      let match;
      
      while ((match = propRegex.exec(propsContent)) !== null) {
        const propName = match[1];
        const propDef = match[2];
        
        // 提取类型
        const typeMatch = propDef.match(/type:\s*([^,\s]+)/);
        const type = typeMatch ? typeMatch[1] : 'Any';
        
        // 提取默认值
        const defaultMatch = propDef.match(/default:\s+(?:(['"])([^'"]*?)\1|([^,\s]+))/);
        const defaultValue = defaultMatch ? (defaultMatch[2] || defaultMatch[3] || '') : undefined;
        
        // 提取是否必须
        const requiredMatch = propDef.match(/required:\s*(true|false)/);
        const required = requiredMatch ? requiredMatch[1] === 'true' : false;
        
        // 尝试在属性上方找到JSDoc注释
        const propPos = scriptContent.indexOf(match[0]);
        const lineStart = scriptContent.lastIndexOf('\n', propPos);
        const commentStart = scriptContent.lastIndexOf('/**', propPos);
        const commentEnd = scriptContent.lastIndexOf('*/', propPos);
        
        let description = '';
        if (commentStart > lineStart && commentEnd > commentStart) {
          const comment = scriptContent.substring(commentStart, commentEnd + 2);
          const descMatch = comment.match(/\/\*\*\s*\n([^@]*?)(\s*\*\s*@|\s*\*\/)/s);
          if (descMatch && descMatch[1]) {
            description = this.cleanJSDocText(descMatch[1]);
          }
        }
        
        props.push({
          name: propName,
          type,
          required,
          default: defaultValue,
          description
        });
      }
    }
    
    // 尝试匹配接口定义
    const interfaceMatch = scriptContent.match(/interface\s+Props\s*{([^}]+)}/s);
    if (interfaceMatch && interfaceMatch[1]) {
      const interfaceContent = interfaceMatch[1];
      
      // 匹配每个属性定义
      const propRegex = /(\w+)(\?)?:\s*([^;\n]+);(?:\s*\/\/\s*(.+))?/g;
      let match;
      
      while ((match = propRegex.exec(interfaceContent)) !== null) {
        const propName = match[1];
        const optional = match[2] === '?';
        const type = match[3].trim();
        const inlineDesc = match[4] ? match[4].trim() : '';
        
        // 尝试在属性上方找到JSDoc注释
        const propPos = interfaceContent.indexOf(match[0]);
        const lineStart = interfaceContent.lastIndexOf('\n', propPos);
        const commentStart = interfaceContent.lastIndexOf('/**', propPos);
        const commentEnd = interfaceContent.lastIndexOf('*/', propPos);
        
        let description = inlineDesc;
        if (commentStart > lineStart && commentEnd > commentStart) {
          const comment = interfaceContent.substring(commentStart, commentEnd + 2);
          const descMatch = comment.match(/\/\*\*\s*\n([^@]*?)(\s*\*\s*@|\s*\*\/)/s);
          if (descMatch && descMatch[1]) {
            description = this.cleanJSDocText(descMatch[1]);
          }
        }
        
        // 尝试提取默认值（从接口外部）
        const defaultMatch = scriptContent.match(new RegExp(`${propName}:\\s+(?:(['"])([^'"]*?)\\1|([^,\\\\s]+))`, 'i'));
        const defaultValue = defaultMatch ? (defaultMatch[2] || defaultMatch[3] || '') : undefined;
        
        props.push({
          name: propName,
          type,
          required: !optional,
          default: defaultValue,
          description
        });
      }
    }
    
    return props;
  }
  
  /**
   * 提取模板示例
   * @param {string} templateContent - 模板内容
   * @returns {string} 模板示例
   */
  extractTemplate(templateContent) {
    // 简单返回模板内容的一部分作为示例
    // 移除行数过多的嵌套内容
    return templateContent
      .replace(/\n\s*<[\w-]+[^>]*>[\s\S]{100,}<\/[\w-]+>\s*\n/g, '\n  <!-- 嵌套内容已省略 -->\n')
      .trim();
  }
  
  /**
   * 提取样式
   * @param {Array<Object>} stylesBlocks - 样式块数组
   * @returns {Array<{content: string, lang: string}>} 样式数组
   */
  extractStyles(stylesBlocks) {
    return stylesBlocks.map(style => ({
      content: style.content.trim(),
      lang: style.lang || 'css'
    }));
  }
}

module.exports = Parser; 