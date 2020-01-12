const path = require('path');
const webpack = require('webpack');


module.exports = {

    // --- Javascript ---

    entry: './app/client/CopyPaste.client.js',
    output: {
        path: path.resolve(__dirname, 'web/static/js'),
        filename: 'CopyPaste.js'
    },
    watch: true,
    mode: "production",


    // --- CSS ---

    module: {
        rules: [
            {
                test: /\.s[ac]ss$/i,
                use: [
                    // Creates `style` nodes from JS strings
                    'style-loader',
                    // Translates CSS into CommonJS
                    'css-loader',
                    // Compiles Sass to CSS
                    'sass-loader',
                ],
            },
        ],
    },


    // --- output

    plugins: [
        new webpack.BannerPlugin('CopyPaste.me - Frictionless sharing between devices\nCreated by The Social Code\n\n@author  Sebastian Kersten\n@license MIT\n\nPlease help keeping the service free by donating: https://paypal.me/thesocialcode\n')
    ]
};
