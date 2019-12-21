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
        // 1. setup
        this._socket = new SocketIO.connect(sGateway);

        // 2. register
        let classRoot = this;

        // 3. configure
        this._socket.on('connect', function() { classRoot._socketOnConnect(); });
        this._socket.on('connect_failed', function() { classRoot._socketConnectFailed(); });
        this._socket.on('disconnect', function() { classRoot._socketOnDisconnect(); });

        // 4. register
        let sToken = window.location.href.substr(window.location.href.lastIndexOf('/') + 1);

        // 5. init
        this._client = (!sToken || sToken.length === 0) ? new Receiver(this._socket, sToken) : new Sender(this._socket, sToken);
    },

    _socketOnConnect: function ()
    {
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
