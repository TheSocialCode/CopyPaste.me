const path = require('path');

module.exports = {
    entry: './app/client/CopyPaste.client.js',
    output: {
        path: path.resolve(__dirname, 'web/static/js'),
        filename: 'CopyPaste.js'
    },
    watch: true,
    mode: "production"
};