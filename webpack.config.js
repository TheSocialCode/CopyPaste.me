const path = require('path');

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
};
