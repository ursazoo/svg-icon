import { defineConfig } from 'vitepress';
import fs from 'fs';
import path from 'path';

// 动态获取组件文档列表
const getComponentSidebar = () => {
  const componentsDir = path.resolve(__dirname, '../components');
  const files = fs.existsSync(componentsDir)
    ? fs.readdirSync(componentsDir).filter(file => file.endsWith('.md'))
    : [];
    
  return files.map(file => {
    const name = path.basename(file, '.md');
    return {
      text: name,
      link: `/components/${name}`
    };
  });
};

export default defineConfig({
  title: 'SVG 图标组件库',
  description: '基于 Vue 3 的 SVG 图标组件库文档',
  lang: 'zh-CN',
  
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: '指南', link: '/' },
      { text: '组件', link: '/components/' }
    ],
    
    sidebar: {
      '/': [
        {
          text: '介绍',
          items: [
            { text: '开始使用', link: '/' }
          ]
        },
        {
          text: '组件',
          items: getComponentSidebar()
        }
      ]
    },
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com/ursazoo/svg-icon' }
    ],
    
    footer: {
      message: '基于 MIT 许可发布',
      copyright: 'Copyright © 2023-present'
    },
    
    search: {
      provider: 'local'
    }
  }
}); 