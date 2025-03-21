import pluginJs from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import prettier from 'eslint-plugin-prettier';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      '@stylistic': stylistic,
      'simple-import-sort': simpleImportSort,
      'unused-imports': unusedImports,
      prettier,
    },
    rules: {
      'prettier/prettier': ['error', { printWidth: 200, singleQuote: true, trailingComma: 'all' }],
      '@stylistic/arrow-spacing': 'error',
      '@stylistic/comma-spacing': ['error', { before: false, after: true }],
      '@stylistic/indent': ['error', 2],
      '@stylistic/no-multi-spaces': 'error',
      '@stylistic/semi': 'error',
      '@stylistic/semi-spacing': 'error',
      '@stylistic/space-in-parens': ['error', 'never'],
      '@stylistic/object-curly-spacing': ['error', 'always'],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'max-lines': ['error', 400],
      'max-len': [
        'error',
        160,
        2,
        {
          ignoreComments: true,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreRegExpLiterals: true,
        },
      ],
      'no-multiple-empty-lines': ['error', { max: 1 }],
      'no-undef': 'warn',
      'no-unused-vars': 'warn',
      'simple-import-sort/imports': [
        'error',
        {
          groups: [['^\\u0000'], ['^@?\\w'], ['^\\./(?=.*/)', '^\\.'], ['^.+\\.s?css$']],
        },
      ],
      'simple-import-sort/exports': 'error',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
    },
  },
];
