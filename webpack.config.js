const path = require('path');
const webpack = require('webpack');
const ManifestPlugin = require('webpack-manifest-plugin');
const RemovePlugin = require('remove-files-webpack-plugin');


module.exports = {

    // --- Javascript ---

    entry: './app/client/CopyPaste.client.js',
    output: {
        path: path.resolve(__dirname, 'web/static/js'),
        filename: 'CopyPaste.[chunkhash].js'
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
            }
        ],
    },


    // --- output

    plugins: [
        new webpack.BannerPlugin('CopyPaste.me - Frictionless sharing between devices\nCreated by The Social Code\n\n@author  Sebastian Kersten\n@license UNLICENSED\n\nPlease help keeping the service free by donating: https://paypal.me/thesocialcode\n'),
        new ManifestPlugin(),
        new RemovePlugin({
            // Before compilation removes entire `./web/static/js` folder to trash
            before: {
                include: [
                    path.resolve(__dirname, 'web/static/js')
                ]
            }
        })
    ]
};
