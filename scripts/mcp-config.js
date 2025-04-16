/**
 * MCP (Markdown Component Processor) 配置文件
 * 用于自动生成组件文档
 */

module.exports = {
  // 源文件目录
  sourceDir: 'src/components',
  
  // 输出目录
  outputDir: 'docs/components',
  
  // 要处理的文件模式
  filePattern: '**/*.vue',
  
  // 文档模板（可选，使用默认模板）
  template: {
    component: ({ name, description, props, events, slots, methods }) => `
# ${name}

${description || ''}

${props && props.length ? `
## Props

| 名称 | 类型 | 必填 | 默认值 | 描述 |
|------|------|:------:|------|------|
${props.map(prop => `| ${prop.name} | \`${prop.type}\` | ${prop.required ? '✓' : ''} | ${prop.default || '-'} | ${prop.description || '-'} |`).join('\n')}
` : ''}

${slots && slots.length ? `
## 插槽

| 名称 | 描述 |
|------|------|
${slots.map(slot => `| ${slot.name || 'default'} | ${slot.description || '-'} |`).join('\n')}
` : ''}

${events && events.length ? `
## 事件

| 名称 | 参数 | 描述 |
|------|------|------|
${events.map(event => `| ${event.name} | ${event.params} | ${event.description || '-'} |`).join('\n')}
` : ''}

${methods && methods.length ? `
## 方法

| 名称 | 参数 | 返回值 | 描述 |
|------|------|------|------|
${methods.map(method => `| ${method.name} | ${method.params} | ${method.returns} | ${method.description || '-'} |`).join('\n')}
` : ''}
    `,
  },
  
  // 组件解析配置
  parser: {
    // 从注释中提取描述信息
    description: {
      fromJSDoc: true,
      fromComponentOptions: false,
    },
    
    // 提取属性信息
    props: {
      fromInterface: true,
      fromDefineProps: true,
    },
    
    // 自定义解析器，用于扩展基本功能
    custom: (content, componentInfo) => {
      // 可以在这里添加额外的解析逻辑
      return componentInfo;
    },
  },
  
  // 后处理钩子
  hooks: {
    afterGenerate: (files) => {
      console.log(`文档已生成: ${files.length} 个文件`);
    }
  }
}; 