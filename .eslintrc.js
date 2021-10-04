// Use the default moovweb eslint style guide by running
// `npm install eslint-config-moov; npm install eslint-plugin-react-storefront`,
// or use your own style guide.
//
module.exports = {
  parserOptions: {
    ecmaFeatures: {
      legacyDecorators: true,
    },
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  globals: {
    fetch: 'readonly',
    env: 'readonly',
    sendResponse: 'readonly',
    fns: 'readonly',
    $: 'readonly',
  },
  rules: {
    'sort-imports': 'off',
    'no-console': 'off',
    'react/no-unused-prop-types': 'off',
    'react/require-default-props': 'off',
    'react/jsx-one-expression-per-line': 'off',
    'react/forbid-prop-types': 'off',
    'quote-props': ['error', 'as-needed'],
    'no-alert': 'off',
    'operator-linebreak': ['error', 'before'],
    'object-curly-newline': [
      'error',
      {
        ObjectExpression: { multiline: true, minProperties: 5 },
        ObjectPattern: { multiline: true, minProperties: 5 },
        ImportDeclaration: { multiline: true, minProperties: 6 },
        ExportDeclaration: { multiline: true, minProperties: 6 },
      },
    ],
    'func-names': ['error', 'as-needed'],
    semi: 'off',
    'react/react-in-jsx-scope': 'off',
  },
}
