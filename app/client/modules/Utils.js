/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';


// import
const QRCodeGenerator = require('qrcode-generator');
const SocketIO = require('socket.io-client');


module.exports = function(socket, sToken)
{
    // start
    this.__construct(socket, sToken);
};

module.exports.prototype = {

    // connection
    _socket: null,
    _sToken: '',


    // ----------------------------------------------------------------------------
    // --- Constructor ------------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Constructor
     */
    __construct: function (socket, sToken)
    {
        // store
        this._socket = socket;
        this._sToken = sToken;

        // register
        let classRoot = this;

        // validate
        if (!new RegExp(/^[0-9a-z]{32}$/g).test(sToken))
        {
            window.open('/', '_self');
            return;
        }
        else
        {
            // store
            this._sToken = sToken;

            // configure
            this._socket.on('token_not_found', function() { classRoot._onTokenNotFound(); });
            this._socket.on('token_connected', function() { classRoot._onTokenConnected(); });

            // connect
            this._socket.emit('connect_token', sToken);

            // show
            document.getElementById('interface-sender').style.display = 'inline-block';


            document.getElementById('button_input_password').addEventListener('click', function(){

                console.log('Value password', document.getElementById('data_input_password').value);

                let sPassword = document.getElementById('data_input_password').value;

                // connect
                this._socket.emit('data-password', { sPassword:sPassword, sToken:sToken });

            }.bind(this));

            document.getElementById('button_input').addEventListener('click', function(){

                console.log('Value URL', document.getElementById('data_input_url').value);

                let sPassword = document.getElementById('data_input_url').value;

                // connect
                this._socket.emit('data-password_url', { sURL:sURL, sToken:sToken });

            }.bind(this));

        }


        // 4. open url (also show URL)
        // 6. show version in bottom/footer
        // 7. onConnect remove QR code -> you are now connected -> check 4 character code
        // 8. change URL to token
        // 10. register token in server
    },

    _onTokenNotFound: function()
    {
        console.log('Sender: Token not found');
    },

    _onTokenConnected: function()
    {
        console.log('Sender: Token connected');
    },

};
