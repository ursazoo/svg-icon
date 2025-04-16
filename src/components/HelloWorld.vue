<script setup lang="ts">
import { ref } from 'vue'

/**
 * HelloWorld 组件
 * 
 * 这是一个基础的示例组件，用于展示Vue 3和Vite的基本功能。
 * 包含一个动态计数器和一些链接。
 */

interface Props {
  /**
   * 要显示的消息文本
   */
  msg: string;
}

defineProps<Props>()

const count = ref(0)
</script>

<template>
  <h1>你好！</h1>
  <h1>{{ msg }}</h1>

  <div class="card">
    <button type="button" @click="count++">count is {{ count }}</button>
    <p>
      Edit
      <code>components/HelloWorld.vue</code> to test HMR
    </p>
  </div>

  <p>
    Check out
    <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank"
      >create-vue</a
    >, the official Vue + Vite starter
  </p>
  <p>
    Learn more about IDE Support for Vue in the
    <a
      href="https://vuejs.org/guide/scaling-up/tooling.html#ide-support"
      target="_blank"
      >Vue Docs Scaling up Guide</a
    >.
  </p>
  <p class="read-the-docs">Click on the Vite and Vue logos to learn more</p>
</template>

<style lang="scss" scoped>
@import '../styles/variables.scss';
@import '../styles/mixins.scss';

$text-color: #888;
$hover-color: #666;

.read-the-docs {
  color: $text-color;
  
  &:hover {
    color: $hover-color;
    cursor: pointer;
  }
}

.card {
  padding: $spacing-md;
  border-radius: $border-radius-md;
  background-color: #f9f9f9;
  @include card-shadow(true);
  @include transition();
  
  @include responsive(md) {
    padding: $spacing-lg;
  }
  
  button {
    @include button-style($primary-color);
    
    &:hover {
      transform: translateY(-2px);
    }
  }
  
  p {
    margin-top: $spacing-sm;
    
    code {
      background-color: $light-gray;
      padding: 2px 4px;
      border-radius: 3px;
    }
  }
}
</style>
