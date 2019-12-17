/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';


// import
const SocketIO = require('socket.io-client');
const Receiver = require('./Receiver');
const Sender = require('./Sender');


module.exports = function(sGateway)
{
    // start
    this.__construct(sGateway);
};

module.exports.prototype = {

    // connection
    _socket: null,
    _sToken: '',
    _client: null,


    // ----------------------------------------------------------------------------
    // --- Constructor ------------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Constructor
     */
    __construct: function (sGateway)
    {
        // log
        if (console) console.log('Connecting user');

        // setup
        this._socket = new SocketIO.connect(sGateway);

        // register
        let classRoot = this;

        // configure
        this._socket.on('connect', function() { classRoot._socketOnConnect(); });
        this._socket.on('connect_failed', function() { classRoot._socketConnectFailed(); });
        this._socket.on('disconnect', function() { classRoot._socketOnDisconnect(); });

        // register
        let sURL = window.location.href; // ------------------------> move to Utils
        let sToken = sURL.substr(sURL.lastIndexOf('/') + 1);

        // init
        this._client = (!sToken || sToken.length === 0) ? new Receiver(this._socket, sToken) : new Sender(this._socket, sToken);



        // 4. open url (also show URL)
        // 6. show version in bottom/footer
        // 7. onConnect remove QR code -> you are now connected -> check 4 character code
    },

    _socketOnConnect: function ()
    {
        // 1. logon with php
        if (console) console.log('User connected'); // (socket id = ' + this._socket.id + ')');

        if (!this._sToken) this._socket.emit('request_token');

    },

    _socketConnectFailed: function()
    {
        if (console) console.log('You are logged off .. trying to connect ...');
    },

    _socketOnDisconnect: function()
    {
        if (console) console.warn('Connection with server was lost .. reconnecting ..');
    }

};
