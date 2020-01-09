/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';


// import
const QRCodeGenerator = require('qrcode-generator');
const ReceivedData = require('./ReceivedData/ReceivedData');
const QRCode = require('./QRCode/QRCode');
const Module_Crypto = require('asymmetric-crypto');


module.exports = function(socket)
{
    // start
    this.__construct(socket);
};

module.exports.prototype = {

    // connection
    _socket: null,
    _sToken: null,
    _elDataContainer: null,
    _elWaiting: null,
    _elClearClipboard: null,
    _elClearClipboardButton: null,
    _aReceivedData: [],
    _qrcode: null,

    // security
    _myKeyPair: null,
    _sTheirPublicKey: '',


    // ----------------------------------------------------------------------------
    // --- Constructor ------------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Constructor
     */
    __construct: function (socket)
    {
        // 1. create
        this._myKeyPair = Module_Crypto.keyPair();

        // 2. store
        this._socket = socket;

        // 3. register
        this._elDataContainer = document.getElementById('receiver_data_container');
        this._elWaiting = document.getElementById('waiting');
        this._elClearClipboard = document.querySelector('receiver_clipboard_clear');
        this._elClearClipboardButton = document.querySelector('receiver_clipboard_clear_button');

        // 4. configure
        this._socket.on('token', this._setupToken.bind(this));
        this._socket.on('token_not_found', this._onTokenNotFound.bind(this));
        this._socket.on('data', this._onData.bind(this));
        this._socket.on('sender_connected', this._onSenderConnected.bind(this));
        this._socket.on('sender_disconnected', this._onSenderDisconnected.bind(this));
        this._socket.on('sender_reconnected', this._onSenderReconnected.bind(this));

        this._socket.on('connect_error', function(err) {
            // handle server error here
            if (console) console.log('Error connecting to server');//, err);
        });

        // 5. show
        document.querySelector('[data-mimoto-id="interface-receiver"]').style.display = 'inline-block';
    },



    // ----------------------------------------------------------------------------
    // --- Public methods ---------------------------------------------------------
    // ----------------------------------------------------------------------------


    connect: function()
    {
        // 1. validate
        if (!this._sToken)
        {
            //if (console) console.log('Receiver: request token');

            // a. request
            this._socket.emit('receiver_request_token', this._myKeyPair.publicKey);
        }
        else
        {
            //if (console) console.log('Receiver: reconnect to request sToken = ' + this._sToken);

            // a. request
            this._socket.emit('receiver_reconnect_to_token', this._sToken);
        }
    },



    // ----------------------------------------------------------------------------
    // --- Private methods --------------------------------------------------------
    // ----------------------------------------------------------------------------


    _setupToken: function (sToken)
    {
        // 1. store
        this._sToken = sToken;

        //console.log('Received sToken = ' + sToken);

        // 2. create
        this._qrcode = new QRCode(window.location.protocol + '//' + window.location.hostname + '/' + this._sToken);
    },

    _onTokenNotFound: function()
    {
        this._showAlertMessage('This session expired. <a href="/">Reload</a> page to make new connection.', true);
    },

    _onSenderConnected: function(sSenderPublicKey)
    {
        // 1. store
        this._sTheirPublicKey = sSenderPublicKey;

        // 2. reset
        this._hideAlertMessage();

        // 3. toggle interface
        document.getElementById('QR-holder').style.display = 'none';
        if (this._elDataContainer.children.length === 0) document.getElementById('waiting').style.display = 'block';
    },

    _onSenderDisconnected: function()
    {
        this._showAlertMessage("The other device has been disconnected.");

        // 1. toggle interface
        document.getElementById('waiting').style.display = 'none';
    },

    _onSenderReconnected: function()
    {
        this._hideAlertMessage();

        // 1. toggle interface
        document.getElementById('QR-holder').style.display = 'none';
        if (this._elDataContainer.children.length > 0)
        {
            document.getElementById('waiting').style.display = 'none';
        }
        else
        {
            document.getElementById('waiting').style.display = 'block';
        }
    },

    _onData: function(encryptedData)
    {
        // 1. toggle interface
        this._elWaiting.style.display = 'none';
        this._elDataContainer.style.display = 'block';

        // 2. copy
        let data = encryptedData;

        // 3. verify
        if (encryptedData.sType === 'password' || encryptedData.sType === 'text')
        {
            // a. clone
            data = JSON.parse(JSON.stringify(encryptedData));

            // d. decrypt
            data.value = Module_Crypto.decrypt(encryptedData.value.data, encryptedData.value.nonce, this._sTheirPublicKey, this._myKeyPair.secretKey);
        }

        // 4. create
        let receivedData = new ReceivedData(this._elDataContainer, data);

        // 5. configure
        receivedData.addEventListener(receivedData.CLEARED, function(receivedData)
        {
            // a. verify and show
            if (this._elDataContainer.children.length === 0) this._elWaiting.style.display = 'block'; // #todo - move to css class

            // b. find
            for (let nIndex = 0; nIndex < this._aReceivedData.length; nIndex++)
            {
                if (this._aReceivedData[nIndex] === receivedData)
                {
                    this._aReceivedData.splice(nIndex, 1);
                }
            }

        }.bind(this, receivedData));

        // 6. store
        this._aReceivedData.push(receivedData);
    },

    _showAlertMessage(sMessage, bDisableInterface)
    {
        // 1. register
        let elAlertMessage = document.querySelector('[data-mimoto-id="alertmessage"]');

        // 2. show
        elAlertMessage.style.display = 'inline-block';

        // 3. output
        elAlertMessage.innerHTML = sMessage;

        // 4. hide
        if (bDisableInterface) document.querySelector('[data-mimoto-id="interface-receiver"]').style.display = 'none';
    },

    _hideAlertMessage()
    {
        let elAlertMessage = document.querySelector('[data-mimoto-id="alertmessage"]');

        // 2. show
        elAlertMessage.style.display = 'none';
    }

};
