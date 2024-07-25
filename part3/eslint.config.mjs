import globals from 'globals'
import js from '@eslint/js'


export default [
  js.configs.recommended,
  {
    ignores: ['node_modules/**', 'dist/**']
  },
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.es2021,
        ...globals.commonjs
      }
    },
    files: ["**/*.js"],
    plugins: {
      '@stylistic/js':{
        rules:{
          indent: ['error', 2],
          'linebreak-style': ['error', 'unix'],
          quotes: ['error', 'single'],
          semi: ['error', 'never'],
          'no-trailing-spaces': ['error'],
          'object-curly-spacing': ['error', 'always'],
          'arrow-spacing': ['error', {'before': true, 'after': true}]
        }
      }
    },
    rules: {
      'indent': ['error', 2],
      'quotes': ['error', 'single'],
      'semi': ['error', 'never'],
      'no-trailing-spaces': ['error'],
      'object-curly-spacing': ['error', 'always'],
      'arrow-spacing': ['error', {'before': true, 'after': true}],
      'no-console': 0
    }
  },
];