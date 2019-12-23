/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';


// import
const Module_HTTP = require('http');
const Module_SocketIO = require('socket.io');
const Module_Express = require('express');
const Module_GenerateUniqueID = require('generate-unique-id');



module.exports = {

    // init
    _app: null,
    _http: null,
    _io: null,

    // init
    _aTokens: [],
    _aSockets: [],


    // ----------------------------------------------------------------------------
    // --- Constructor ------------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Constructor
     */
    __construct: function (sGateway)
    {
        // 1. init
        this._app = Module_Express();
        this._http = Module_HTTP.createServer(this.app);
        this._io = Module_SocketIO(this._http);

        // 2. configure
        this._io.on('connection', this._onUserConnect.bind(this));

        // 3. listen
        this._http.listen(3000, function(){
            console.log('listening on *:3000');
        });
    },

    _onUserConnect: function(socket)
    {

        if (!this._aSockets['' + socket.id])
        {
            console.log('New user connected', socket.id);

            // init and store
            this._aSockets['' + socket.id] = {
                 socket,
                 aTokens: []
            }
        }
        else
        {
            console.log('------------------- Existing user reconnected');
        }

        // configure
        socket.on('disconnect', this._onUserDisconnect.bind(this, socket));
        socket.on('request_token', this._onRequestToken.bind(this, socket));
        socket.on('connect_token', this._onConnectToken.bind(this, socket));
        socket.on('data', this._onData.bind(this));

    },

    _onUserDisconnect: function(socket)
    {
        console.log('User disconnected ...', socket.id);


        if (this._aSockets['' + socket.id])
        {
            if (this._aSockets['' + socket.id].socket.id === socket.id)
            {
                console.log('=== User found');
            }
        }

        // find token connected to user


        //socket.emit('receiver_disconnected')


        if (this._aSockets[socket.id])
        {
            console.log('[    ] --- User is registered!');
        }
    },

    _onRequestToken: function(socket)
    {
        // 1. create
        let sToken = Module_GenerateUniqueID({ length: 32 });

        // 2. init and store
        this._aTokens['' + sToken] = {
            receiver: socket
        };

        // 3. broadcast
        socket.emit('token', sToken);
    },

    _onConnectToken: function(socket, sToken)
    {
        if (this._aTokens['' + sToken])
        {
            this._aTokens['' + sToken].sender = socket;


            // store list of connections per client (sender or receiver)

            socket.emit('token_connected');

            this._aTokens['' + sToken].receiver.emit('sender_connected')
        }
        else
        {
            socket.emit('token_not_found');
        }

        console.log('Connecting to token', sToken);
    },

    _onData: function(data)
    {
        // #todo - valaidate existance

        this._aTokens['' + data.sToken].receiver.emit('data', { sType:data.sType, value:data.value });
    }

};

// auto-start
module.exports.__construct();
