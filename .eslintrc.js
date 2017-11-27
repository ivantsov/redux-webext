module.exports = {
    parser: 'babel-eslint',
    extends: [
        'airbnb-base',
        'plugin:flowtype/recommended'
    ],
    plugins: [
        'flowtype'
    ],
    env: {
        browser: true,
        webextensions: true,
        jasmine: true,
        jest: true
    },
    globals: {
        safari: true
    },
    rules: {
        indent: ['error', 4],
        'one-var': ['error', {
            initialized: 'never'
        }],
        'one-var-declaration-per-line': ['error', 'initializations'],
        'comma-dangle': ['error', 'never'],
        'object-curly-spacing': ['error', 'never'],
        'brace-style': ['error', 'stroustrup', {
            'allowSingleLine': false
        }],
        'linebreak-style': 'off',
        'no-prototype-builtins': 'off',
        'arrow-parens': 'off',
        'max-len': 'off',
        'no-bitwise': 'off',
        'import/no-mutable-exports': 'off',
        'generator-star-spacing': 0 // TODO: babel-eslint bug https://github.com/babel/babel-eslint/issues/350
    }
};
