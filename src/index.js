/**
 * MCP-Vue-Docs-Generator
 * 
 * 此模块用于生成Vue组件的文档
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { execSync } = require('child_process');
const express = require('express');
const chokidar = require('chokidar');
const Parser = require('./parser');
const Generator = require('./generator');

/**
 * 文档生成器类
 */
class DocsGenerator {
  /**
   * 创建DocsGenerator实例
   * @param {Object} options - 配置选项
   * @param {string} options.componentsDir - 组件目录，默认为'src/components'
   * @param {string} options.outputDir - 文档输出目录，默认为'docs/components'
   * @param {number} options.port - 文档服务器端口，默认为3333
   */
  constructor(options = {}) {
    this.options = {
      componentsDir: options.componentsDir || 'src/components',
      outputDir: options.outputDir || 'docs/components',
      port: options.port || 3333
    };
    
    this.parser = new Parser();
    this.generator = new Generator(this.options.outputDir);
    
    // 确保输出目录存在
    if (!fs.existsSync(this.options.outputDir)) {
      fs.mkdirSync(this.options.outputDir, { recursive: true });
    }
  }
  
  /**
   * 获取所有组件文件
   * @returns {string[]} 组件文件路径数组
   */
  getComponentFiles() {
    const pattern = path.join(this.options.componentsDir, '**/*.vue');
    return glob.sync(pattern);
  }
  
  /**
   * 获取已暂存的组件文件
   * @returns {string[]} 已暂存的组件文件路径数组
   */
  getStagedComponentFiles() {
    try {
      const result = execSync('git diff --cached --name-only').toString();
      return result
        .split('\n')
        .filter(file => file.endsWith('.vue') && file.includes(this.options.componentsDir));
    } catch (error) {
      console.error('获取已暂存组件文件失败:', error.message);
      return [];
    }
  }
  
  /**
   * 生成特定组件的文档
   * @param {string} componentName - 组件名称
   * @returns {Promise<void>}
   */
  async generateComponentDoc(componentName) {
    const pattern = path.join(this.options.componentsDir, `**/${componentName}.vue`);
    const files = glob.sync(pattern);
    
    if (files.length === 0) {
      throw new Error(`找不到组件: ${componentName}`);
    }
    
    return this.generateDocs(files);
  }
  
  /**
   * 生成所有组件文档
   * @returns {Promise<void>}
   */
  async generateAllDocs() {
    const files = this.getComponentFiles();
    console.log(`找到 ${files.length} 个组件文件`);
    return this.generateDocs(files);
  }
  
  /**
   * 生成已暂存组件文档
   * @returns {Promise<void>}
   */
  async generateStagedDocs() {
    const files = this.getStagedComponentFiles();
    console.log(`找到 ${files.length} 个已暂存组件文件`);
    return this.generateDocs(files);
  }
  
  /**
   * 生成文档
   * @param {string[]} files - 组件文件路径数组
   * @returns {Promise<void>}
   */
  async generateDocs(files) {
    if (files.length === 0) {
      console.log('没有找到组件文件');
      return;
    }
    
    for (const file of files) {
      try {
        console.log(`处理文件: ${file}`);
        const componentInfo = await this.parser.parseComponent(file);
        await this.generator.generateMarkdown(componentInfo);
        console.log(`生成文档: ${path.join(this.options.outputDir, componentInfo.name + '.md')}`);
      } catch (error) {
        console.error(`处理文件 ${file} 时出错:`, error.message);
      }
    }
    
    console.log('文档生成完成');
  }
  
  /**
   * 启动文档服务器
   * @returns {Promise<void>}
   */
  async startServer() {
    const app = express();
    const port = this.options.port;
    
    // 先生成所有文档
    await this.generateAllDocs();
    
    // 设置静态文件服务
    app.use(express.static(path.dirname(this.options.outputDir)));
    
    // 监听组件变化
    const watcher = chokidar.watch(path.join(this.options.componentsDir, '**/*.vue'), {
      persistent: true
    });
    
    watcher.on('change', async (filePath) => {
      console.log(`文件已更改: ${filePath}`);
      try {
        const componentInfo = await this.parser.parseComponent(filePath);
        await this.generator.generateMarkdown(componentInfo);
        console.log(`更新文档: ${path.join(this.options.outputDir, componentInfo.name + '.md')}`);
      } catch (error) {
        console.error(`更新文档时出错:`, error.message);
      }
    });
    
    // 启动服务器
    app.listen(port, () => {
      console.log(`文档服务器运行在 http://localhost:${port}`);
      console.log(`查看组件文档: http://localhost:${port}/${path.basename(this.options.outputDir)}`);
    });
  }
}

module.exports = {
  DocsGenerator,
  Parser,
  Generator
}; 