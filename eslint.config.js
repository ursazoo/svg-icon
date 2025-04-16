import js from '@eslint/js';
import eslintPluginVue from 'eslint-plugin-vue';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import vueParser from 'vue-eslint-parser';
import eslintConfigPrettier from 'eslint-config-prettier';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 直接定义 Vue 和 TypeScript 相关规则
const vueRules = {
  'vue/multi-word-component-names': 'off',
  'vue/no-v-html': 'off',
  'vue/require-default-prop': 'off',
  'vue/component-name-in-template-casing': ['error', 'PascalCase'],
  'vue/html-closing-bracket-newline': ['error', {
    'singleline': 'never',
    'multiline': 'always'
  }],
  'vue/html-indent': ['error', 2],
  'vue/max-attributes-per-line': ['error', {
    'singleline': 3,
    'multiline': 1
  }],
  'vue/no-unused-components': 'error',
  'vue/no-unused-vars': 'error',
  'vue/no-multiple-template-root': 'off'
};

const tsRules = {
  '@typescript-eslint/no-explicit-any': 'warn',
  '@typescript-eslint/no-unused-vars': ['error', { 'ignoreRestSiblings': true }],
  '@typescript-eslint/explicit-function-return-type': 'off',
  '@typescript-eslint/explicit-module-boundary-types': 'off',
  '@typescript-eslint/no-empty-function': 'warn',
  '@typescript-eslint/no-non-null-assertion': 'off',
  '@typescript-eslint/ban-ts-comment': 'warn',
  '@typescript-eslint/type-annotation-spacing': 'error'
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
      ...vueRules,
      ...tsRules,
      'quotes': ['error', 'single'],
      'semi': ['error', 'always']
    }
  },
  
  // 文件忽略配置
  {
    ignores: ['node_modules/**', 'dist/**', 'public/**', 'coverage/**', '*.d.ts']
  },
  
  // Prettier 配置（必须放在最后以覆盖之前的规则）
  eslintConfigPrettier
]; 