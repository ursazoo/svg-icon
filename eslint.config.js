import js from '@eslint/js';
import eslintPluginVue from 'eslint-plugin-vue';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import vueParser from 'vue-eslint-parser';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Vue3 推荐配置
const vue3RecommendedRules = {
  ...eslintPluginVue.configs['vue3-recommended'].rules
};

// TypeScript 推荐配置
const tsRecommendedRules = {
  ...tseslint.configs.recommended.rules
};

export default [
  // 基础 JavaScript 规则
  js.configs.recommended,
  
  // 全局配置
  {
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        parser: {
          ts: tsparser,
          '<template>': vueParser
        },
        extraFileExtensions: ['.vue']
      }
    },
    plugins: {
      vue: eslintPluginVue,
      '@typescript-eslint': tseslint
    },
    // 合并规则
    rules: {
      ...vue3RecommendedRules,
      ...tsRecommendedRules,
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'off',
      'vue/require-default-prop': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { 'ignoreRestSiblings': true }],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always']
    }
  },
  
  // 文件忽略配置
  {
    ignores: ['node_modules/**', 'dist/**', 'public/**', 'coverage/**', '*.d.ts']
  }
]; 