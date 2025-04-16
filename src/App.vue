<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
import SvgIcon from './components/SvgIcon.vue'
</script>

<template>
  <div class="container">
    <div class="logo-container">
      <SvgIcon name="vue" color="#42b883" size="100">
        <path 
          d="M24,1.61H14.06L12,5.16,9.94,1.61H0L12,22.39ZM12,14.08,5.16,2.23H9.59L12,6.41l2.41-4.18h4.43Z"
          fill="currentColor"
        />
      </SvgIcon>
    </div>
    <HelloWorld msg="SVG 图标库" />
  </div>
</template>

<style lang="scss" scoped>
@import './styles/variables.scss';
@import './styles/mixins.scss';

.container {
  @include flex(column, center, center);
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: $spacing-xl;
}

.logo-container {
  @include flex(row, center, center);
  margin: $spacing-xl 0;
  @include transition(transform, 0.3s, ease);
  
  &:hover {
    transform: scale(1.05);
  }
}
</style>
