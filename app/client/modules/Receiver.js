/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';


// import
const QRCodeGenerator = require('qrcode-generator');
const ReceivedData = require('./ReceivedData');
const QRCode = require('./QRCode');


module.exports = function(socket, sToken)
{
    // start
    this.__construct(socket, sToken);
};

module.exports.prototype = {

    // connection
    _socket: null,
    _sToken: '',
    _elDataContainer: null,
    _elWaiting: null,
    _aReceivedData: [],
    _qrcode: null,


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
        this._elDataContainer = document.getElementById('receiver_data_container');
        this._elWaiting = document.getElementById('waiting');

        // configure
        this._socket.on('token', function(sToken) { classRoot._setupToken(sToken); });
        this._socket.on('data', function(data) { classRoot._onData(data); });
        this._socket.on('sender_connected', function() { classRoot._onSenderConnected(); });

        this._socket.on('connect_error', function(err) {
            // handle server error here
            console.log('Error connecting to server');
        });

        // show
        document.getElementById('interface-receiver').style.display = 'inline-block';
    },

    _setupToken: function (sToken)
    {
        // create
        this._qrcode = new QRCode(window.location.protocol + '//' + window.location.hostname + '/' + sToken);
    },


    _onSenderConnected: function()
    {
        // 1. toggle interface
        document.getElementById('QR-holder').style.display = 'none';
        document.getElementById('waiting').style.display = 'block';
    },

    _onData: function(data)
    {
        // 1. toggle interface
        this._elWaiting.style.display = 'none';
        this._elDataContainer.style.display = 'block';

        // 2. create
        let receivedData = new ReceivedData(this._elDataContainer, data);

        // 3. configure
        receivedData.addEventListener(receivedData.CLEARED, function(receivedData)
        {
            // a. verify and show
            if (this._elDataContainer.children.length === 0) this._elWaiting.style.display = 'block';

            // b. find
            for (let nIndex = 0; nIndex < this._aReceivedData.length; nIndex++)
            {
                if (this._aReceivedData[nIndex] === receivedData)
                {
                    this._aReceivedData.splice(nIndex, 1);
                }
            }

        }.bind(this, receivedData));

        // 4. store
        this._aReceivedData.push(receivedData);
    }

};
