module.exports = {
    extends: 'airbnb-base',
    env: {
        webextensions: true
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
        'no-prototype-builtins': 'off'
    }
};
