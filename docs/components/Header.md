# Header

页面头部组件，用于显示页面标题，支持点击交互和自定义样式。

## 示例

```vue
<Header />
```

## 模板

```vue
<template>
  <div class="header">
          <h1 @click="handleClick">{{ title || '默认的title' }}</h1>
      </div>
</template>
```

## 样式

组件使用 scoped 样式。

```css
.header {
    background-color: #f0f0f0;
}
```
