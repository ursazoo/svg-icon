# SVG 图标库

基于 Vue 3 + Vite + TypeScript + Sass 的 SVG 图标组件库。

## 功能特点

- 使用 Vue 3 Composition API 和 TypeScript
- Vite 构建工具提供快速开发体验
- Vitest 测试框架确保组件质量
- 可定制的 SVG 图标组件
- Sass 样式预处理器，提供更强大的样式管理
- ESLint 和 Prettier 代码规范和格式化
- Husky 和 lint-staged 提交前代码检查
- Commitlint 提交消息规范

## 安装和使用

### 克隆和安装

```bash
git clone https://github.com/ursazoo/svg-icon.git
cd svg-icon
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 运行测试

```bash
# 运行测试并监视文件变化
npm run test

# 运行所有测试
npm run test:run

# 运行测试并生成覆盖率报告
npm run test:coverage
```

### 代码质量和格式化

```bash
# 运行 ESLint 检查并修复
npm run lint

# 运行 Prettier 格式化
npm run format
```

## 使用 SvgIcon 组件

```vue
<template>
  <SvgIcon name="icon-name" color="#42b883" size="32">
    <!-- SVG 路径内容 -->
    <path d="..." fill="currentColor" />
  </SvgIcon>
</template>

<script setup>
import SvgIcon from './components/SvgIcon.vue';
</script>
```

### 组件属性

| 属性 | 类型 | 默认值 | 描述 |
|------|------|-------|------|
| name | string | - | 图标名称（必填） |
| color | string | currentColor | 图标颜色 |
| size | string/number | 24 | 图标尺寸 |

## Sass 样式系统

项目使用 Sass 预处理器来增强 CSS 开发体验。样式文件组织如下：

```
src/styles/
  ├── variables.scss  # 全局变量定义（颜色、尺寸等）
  ├── mixins.scss    # 混合器定义（可复用的样式片段）
  └── main.scss      # 主样式文件
```

### 使用方法

在组件中使用 Sass：

```vue
<style lang="scss" scoped>
@import '../styles/variables.scss';
@import '../styles/mixins.scss';

.my-component {
  color: $primary-color;
  @include flex(row, center, center);
  @include transition();
  
  &:hover {
    color: darken($primary-color, 10%);
  }
}
</style>
```

## 代码提交规范

本项目使用 [Conventional Commits 规范](https://www.conventionalcommits.org/zh-hans/) 进行 Git 提交消息的格式化。详细规则请参考 [COMMIT_CONVENTION.md](./COMMIT_CONVENTION.md)。

提交示例：

```
feat(components): 添加新图标组件
fix(utils): 修复 SVG 加载器中的问题
docs(readme): 更新组件使用文档
```

## 许可证

ISC
