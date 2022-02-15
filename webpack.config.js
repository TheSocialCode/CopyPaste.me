const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require('terser-webpack-plugin');
const WebpackDoneNotification = require('@thesocialcode/mimoto/compiler/WebpackDoneNotification');


module.exports = {

    // --- Javascript ---

    // entry: './app/client/CopyPaste.client.js',
    entry: [
        './app/client/CopyPaste.client.js',
        './app/client/CopyPaste.client.scss',
    ],
    output: {
        path: path.resolve(__dirname, 'web/static/dist'),
        filename: 'CopyPaste.[chunkhash].js'
    },
    watch: true,
    mode: "production",


    // --- CSS ---

    module: {
        rules : [
            {
                test: /\.s?[ac]ss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    { loader: 'css-loader', options: { url: false, sourceMap: true } },
                    { loader: 'sass-loader', options: { sourceMap: true } }
                ],
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: "babel-loader"
            },
            {
                test: /\.html$/i,
                loader: 'html-loader',
                options: {
                    // Disables attributes processing
                    sources: false,
                    esModule: false
                },
            }
        ]
    },

    optimization: {
        minimizer: [new TerserPlugin({
            extractComments: false,
        })],
    },


    // --- output

    plugins: [
        new CleanWebpackPlugin(),
        new webpack.BannerPlugin('CopyPaste.me - Frictionless sharing between devices\nCreated by The Social Code\n\n@author  Sebastian Kersten\n\nPlease help keeping the service free by donating: https://paypal.me/thesocialcode\n'),
        new WebpackManifestPlugin( { publicPath: "" } ),
        new MiniCssExtractPlugin({
            filename: 'CopyPaste.[chunkhash].css'
        }),
        new WebpackDoneNotification()
    ]
};
