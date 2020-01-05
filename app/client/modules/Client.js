/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';


// import
const SocketIO = require('socket.io-client');
const Receiver = require('./Receiver/Receiver');
const Sender = require('./Sender/Sender');


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
        //console.warn('sGateway = ' + sGateway);

        // 2. connect
        this._socket = new SocketIO(sGateway, {secure: true }).connect();//, {secure: true, rejectUnauthorized: false });

        // 2. configure
        this._socket.on('connect', this._socketOnConnect.bind(this));
        this._socket.on('reconnect', this._socketOnReconnect.bind(this));
        this._socket.on('connect_failed', this._socketConnectFailed.bind(this));
        this._socket.on('disconnect', this._socketOnDisconnect.bind(this));
        this._socket.on('security_compromised', this._onSecurityCompromised.bind(this));

        // 3. register
        let sToken = window.location.href.substr(window.location.href.lastIndexOf('/') + 1);

        // 4. init
        this._client = (!sToken || sToken.length === 0) ? new Receiver(this._socket) : new Sender(this._socket, sToken);
    },

    _socketOnConnect: function ()
    {
        //console.log('Client: connected');

        this._client.connect();
    },

    _socketOnReconnect: function ()
    {
        this._client.reconnect();
    },

    _socketConnectFailed: function()
    {
        if (console) console.log('You are logged off .. trying to connect ...');
    },

    _socketOnDisconnect: function()
    {
        if (console) console.warn('Connection with server was lost .. reconnecting ..');
    },

    _onSecurityCompromised: function()
    {
        // 1. clear
        delete this._socket;

        // 2. disable interface
        document.querySelector('[data-mimoto-id="interface-receiver"]').remove();
        document.querySelector('[data-mimoto-id="interface-sender"]').remove();

        // 2. show warning
        document.body.classList.add('security_compromised');

    }

};
