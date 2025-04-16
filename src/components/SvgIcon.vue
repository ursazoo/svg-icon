<script setup lang="ts">
import { computed } from 'vue';

/**
 * SVG 图标组件
 * 
 * 该组件用于展示 SVG 图标，支持自定义大小、颜色，并可通过插槽传入 SVG 路径内容。
 * 组件通过 slot 方式接收 SVG 内容，使其高度可定制化。
 * 
 * @example
 * ```vue
 * <SvgIcon name="github" size="32" color="#333">
 *   <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.272.098-2.65 0 0 .84-.269 2.75 1.022A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.291 2.747-1.022 2.747-1.022.546 1.378.202 2.397.1 2.65.64.699 1.026 1.592 1.026 2.683 0 3.842-2.339 4.687-4.566 4.933.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" fill="currentColor" />
 * </SvgIcon>
 * ```
 */

interface Props {
  /**
   * 图标的唯一名称，用于标识图标
   */
  name: string;
  
  /**
   * 图标的颜色，可以是任何有效的 CSS 颜色值
   * @default 'currentColor'
   */
  color?: string;
  
  /**
   * 图标的尺寸，可以是数字（将转换为像素）或任何有效的 CSS 尺寸值
   * @default '24'
   */
  size?: string | number;
}

const props = withDefaults(defineProps<Props>(), {
  color: 'currentColor',
  size: '24'
});

/**
 * 计算尺寸样式，如果是数字则转换为像素值
 */
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
    role="img"
    :aria-label="`${name} icon`"
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