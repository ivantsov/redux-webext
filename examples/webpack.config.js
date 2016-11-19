const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlPlugin = require('html-webpack-plugin');

const PAGES_PATH = './src/pages';

function generateHtmlPlugins(items) {
    return items.map(name => new HtmlPlugin({
        filename: `./${name}.html`,
        chunks: [name]
    }));
}

module.exports = {
    entry: {
        background: `${PAGES_PATH}/background`,
        popup: `${PAGES_PATH}/popup`
    },
    output: {
        path: path.resolve('dist/pages'),
        filename: '[name].js'
    },
    module: {
        loaders: [{
            test: /\.js$/,
            loader: 'babel-loader'
        }]
    },
    plugins: [
        new CopyPlugin([{
            from: 'src',
            to: path.resolve('dist'),
            ignore: ['pages/**/*']
        }]),
        ...generateHtmlPlugins([
            'background',
            'popup'
        ])
    ]
};
