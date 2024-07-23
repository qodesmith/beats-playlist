module.exports = {
  root: true,
  env: {browser: true, es2020: true},
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh', '@typescript-eslint', 'import'],
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        vars: 'all',
        args: 'after-used',
        ignoreRestSiblings: true,
        varsIgnorePattern: '^_', // Ignore variables starting with _
        argsIgnorePattern: '^_', // Ignore function arguments starting with _
        caughtErrorsIgnorePattern: '^_', // Ignore caught errors starting with _
        destructuredArrayIgnorePattern: '^_', // Ignore destructured array items starting with _
      },
    ],
    'react-refresh/only-export-components': [
      'warn',
      {allowConstantExport: true},
    ],
    'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
    'import/order': [
      'error',
      {
        'newlines-between': 'always',
        groups: [
          'type',
          'builtin',
          'external',
          'internal',
          ['sibling', 'parent'],
          'index',
          'object',
        ],
        alphabetize: {order: 'asc', caseInsensitive: true},
      },
    ],
    '@typescript-eslint/consistent-type-imports': [
      'error',
      {
        prefer: 'type-imports',
        disallowTypeAnnotations: false,
      },
    ],
  },
}
