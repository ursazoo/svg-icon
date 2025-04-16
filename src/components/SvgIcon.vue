<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  name: string;
  color?: string;
  size?: string | number;
}

const props = withDefaults(defineProps<Props>(), {
  color: 'currentColor',
  size: '24'
});

const sizeStyle = computed(() => {
  return typeof props.size === 'number' ? `${props.size}px` : props.size;
});
</script>

<template>
  <svg
    :width="sizeStyle"
    :height="sizeStyle"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :style="{ color: color }"
    class="svg-icon"
  >
    <slot></slot>
  </svg>
</template>

<style lang="scss" scoped>
@import '../styles/variables.scss';
@import '../styles/mixins.scss';

.svg-icon {
  display: inline-block;
  vertical-align: middle;
  @include transition(transform, 0.2s, ease-in-out);
  
  &:hover {
    opacity: 0.9;
    transform: scale(1.05);
  }
}
</style> 