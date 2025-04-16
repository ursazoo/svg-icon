import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import path from 'path';
import { fileURLToPath } from 'url';
import eslintPluginVue from 'eslint-plugin-vue';
import typescriptEslint from '@typescript-eslint/eslint-plugin';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 创建兼容层以使用传统配置
const compat = new FlatCompat({
  baseDirectory: __dirname
});

export default [
  js.configs.recommended,
  {
    // 直接声明插件
    plugins: {
      vue: eslintPluginVue,
      '@typescript-eslint': typescriptEslint
    }
  },
  ...compat.config({
    extends: [
      'plugin:vue/vue3-recommended',
      'plugin:@typescript-eslint/recommended',
      'prettier'
    ],
    parser: 'vue-eslint-parser',
    parserOptions: {
      ecmaVersion: 'latest',
      parser: '@typescript-eslint/parser',
      sourceType: 'module'
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'off',
      'vue/require-default-prop': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { 'ignoreRestSiblings': true }],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always']
    }
  }),
  {
    ignores: ['node_modules/**', 'dist/**', 'public/**', 'coverage/**', '*.d.ts']
  }
]; 