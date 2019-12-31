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

    // sonfig
    _config: {
        mode: 'prod',   // options: "prod" (no output)  | "dev" (output debugging comments)
        https: true,    // options: 'true' (runs on https)  | 'false' (runs on http)
    },


    // services
    _app: null,
    _http: null,
    _io: null,

    // data
    _aPairs: [],
    _aSockets: [],

    // utils
    _timerGarbageCollection: null,
    _aPairsMarkedForRemoval: [],
    _nGarbageMaxAge: 3 * 60 * 1000,



    // ----------------------------------------------------------------------------
    // --- Constructor ------------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Constructor
     */
    __construct: function(config)
    {
        // 1. store
        if (config.mode && config.mode === 'prod' || config.mode === 'dev') this._config.mode = config.mode;
        if (config.https === true || config.https === false) this._config.https = config.https;

        // 2. init
        this._app = Module_Express();
        this._http = Module_HTTP.createServer(this.app);
        this._io = Module_SocketIO(this._http);

        // 3. configure
        this._io.on('connection', this._onUserConnect.bind(this));

        // 4. listen
        this._http.listen(3000, function()
        {
            // a. cleanup
            console.clear();

            // b. prepare
            let aLines = ['', 'CopyPaste.me', 'listening on *:3000 ' + JSON.stringify(this._config), ''];

            // c. find max length
            let nMaxLength = 0;
            for (let nLineIndex = 0; nLineIndex < aLines.length; nLineIndex++)
            {
                // I. calculate
                if (aLines[nLineIndex].length > nMaxLength) nMaxLength = aLines[nLineIndex].length;
            }

            // d. build and output lines
            for (let nLineIndex = 0; nLineIndex < aLines.length; nLineIndex++)
            {
                // I. build
                if (aLines[nLineIndex].length === 0)
                {
                    while(aLines[nLineIndex].length < nMaxLength) aLines[nLineIndex] += '-';
                    aLines[nLineIndex] = '----' + aLines[nLineIndex] + '----';
                }
                else
                {
                    while(aLines[nLineIndex].length < nMaxLength) aLines[nLineIndex] += ' ';
                    aLines[nLineIndex] = '--- ' + aLines[nLineIndex] + ' ---';
                }

                // III. output
                console.log(aLines[nLineIndex]);
            }

            // e. output extra line
            console.log();

        }.bind(this));

        // 5. setup
        // x. disable
        //this._timerGarbageCollection = setInterval(this._collectGarbage.bind(this), 2000);

    },

    _onUserConnect: function(socket)
    {
        // 1. verify
        if (this._aSockets['' + socket.id]) { this._log('Existing user reconnected (p.s. This should not be happening!)'); return; }

        // 2. build
        let socketData = {
            socket: socket,
            sToken: ''
        };

        // 3. store
        this._aSockets['' + socket.id] = socketData;

        // 4. configure
        socket.on('disconnect', this._onUserDisconnect.bind(this, socket));
        socket.on('receiver_request_token', this._onReceiverRequestToken.bind(this, socket));
        socket.on('receiver_reconnect_to_token', this._onReceiverReconnectToToken.bind(this, socket));
        socket.on('sender_connect_to_token', this._onSenderConnectToToken.bind(this, socket, false));
        socket.on('sender_reconnect_to_token', this._onSenderConnectToToken.bind(this, socket, true));
        socket.on('data', this._onData.bind(this));

        // 5. debug
        this._log('New user connected - ' + socket.id);
    },

    _onReceiverRequestToken: function(receiverSocket)
    {
        // 1. create
        let sToken = Module_GenerateUniqueID({ length: 32 });

        // 2. output
        this._log('Socket.id = ' + receiverSocket.id + ' requests token = ' + sToken);

        // 3. verify
        if (this._aPairs['' + sToken] || !this._aSockets['' + receiverSocket.id]) return;

        // 4. build
        let pair = {
            receiver: receiverSocket,
            sender: null
        };

        // 5. store
        this._aPairs['' + sToken] = pair;

        // 6. update
        this._aSockets['' + receiverSocket.id].sToken = sToken;

        // 7. broadcast
        receiverSocket.emit('token', sToken);

        // 8. output
        this._logUsers('After `_onReceiverRequestToken` by socket.id = ' + receiverSocket.id);
    },

    _onReceiverReconnectToToken: function(receiverSocket, sToken)
    {
        // 1. output
        this._log('Receiver wants to reconnect to token ' + sToken);

        // 2. validate
        if (!this._aPairs['' + sToken])
        {
            // a. output
            this._log('Token = ' + sToken + ' not found for reconnecting receiver');

            // b. broadcast
            receiverSocket.emit('token_not_found');

            // c. exit
            return;
        }


        // ---


        // 3. load
        let pair = this._aPairs['' + sToken];

        // 4. validate
        if (pair.receiver)
        {
            // 1. output
            this._log('Pair already has a `receiver` connected. sToken = ' + sToken);

            // 2. warn
            this._broadcastSecurityWarning(receiverSocket, pair, sToken);
            return;
        }


        // ---


        // 5. store
        this._aPairs['' + sToken].receiver = receiverSocket;

        // 6. broadcast
        receiverSocket.emit('token_reconnected');

        // 7. save from garbage collection
        this._saveFromRemoval(sToken);

        // 8. broadcast
        if (pair.sender) pair.sender.emit('receiver_reconnected');

        // 9. output
        this._logUsers('After `_onReceiverRequestToken` by socket.id = ' + receiverSocket.id);
    },

    _onSenderConnectToToken: function(senderSocket, bReconnect, sToken)
    {
        // 0. output
        this._log('Sender wants to reconnect to token ' + sToken);

        // 1. validate
        if (!this._aPairs['' + sToken])
        {
            // a. broadcast
            senderSocket.emit('token_not_found');

            // b. exit
            return;
        }


        // ---


        // 2. load
        let pair = this._aPairs['' + sToken];

        // 3. validate
        if (pair.sender)
        {
            // 1. output
            this._log('Pair already has a sender connected. sToken = ' + sToken);

            // 2. warn
            this._broadcastSecurityWarning(senderSocket, pair, sToken);
            return;
        }


        // ---


        // 4. store
        this._aPairs['' + sToken].sender = senderSocket;

        // 5. update
        this._aSockets['' + senderSocket.id].sToken = sToken;

        // 6. broadcast
        senderSocket.emit((bReconnect) ? 'token_reconnected' : 'token_connected');

        // 7. save from garbage collection
        this._saveFromRemoval(sToken);

        // 8. broadcast
        if (pair.receiver) pair.receiver.emit((bReconnect) ? 'sender_reconnected' : 'sender_connected');
    },

    _onUserDisconnect: function(socket)
    {
        // 0. output
        this._log('Socket.id = ' + socket.id + ' has disconnected');

        // 1. validate
        if (!this._aSockets['' + socket.id]) return;

        // 2. load
        let registeredSocket = this._aSockets['' + socket.id];

        // 3. register
        let sToken = registeredSocket.sToken;

        // 4. validate
        if (!sToken) return;

        // 5. cleanup
        delete this._aSockets['' + socket.id];

        // 6. load
        let pair = this._aPairs['' + sToken];

        // 7. validate
        if (pair.receiver && pair.receiver.id === socket.id)
        {
            // a. cleanup
            pair.receiver = null;

            // b. mark
            this._markForRemoval(sToken);

            // c. broadcast
            if (pair.sender) pair.sender.emit('receiver_disconnected');
        }

        // 8. validate
        if (pair.sender && pair.sender.id === socket.id)
        {
            // a. cleanup
            pair.sender = null;

            // b. mark
            this._markForRemoval(sToken);

            // c. broadcast
            if (pair.receiver) pair.receiver.emit('sender_disconnected');
        }
    },

    _onData: function(data)
    {
        // 1. validate
        if (!this._aPairs['' + data.sToken]) return;

        // 2. broadcast
        this._aPairs['' + data.sToken].receiver.emit('data', { sType:data.sType, value:data.value });
    },

    _broadcastSecurityWarning: function(requestingSocket, pair, sToken)
    {
        // 1. broadcast breach to current user
        requestingSocket.emit('security_compromised');

        // 2. cleanup
        delete this._aSockets['' + requestingSocket.id];

        // 3. verify
        if (pair.receiver)
        {
            // a. broadcast
            pair.receiver.emit('security_compromised');

            // b. cleanup
            delete this._aSockets['' + pair.receiver.id];
        }

        // 4. verify
        if (pair.sender)
        {
            // a. broadcast
            pair.sender.emit('security_compromised');

            // b. cleanup
            delete this._aSockets['' + pair.sender.id];
        }

        // 5. clear
        delete this._aPairs['' + sToken];
    },

    _markForRemoval: function(sToken)
    {
        // x. disable
        return;


        // 1. skip if already marked
        if (this._aPairsMarkedForRemoval['' + sToken]) return;

        // 2. store
        this._aPairsMarkedForRemoval['' + sToken] = {
            sToken: sToken,
            nMomentItGotMarked: new Date().getTime()
        };
    },

    _saveFromRemoval: function(sToken)
    {
        // x. disable
        return;


        // 1. verify
        if (!this._aPairs['' + sToken]) return;

        // 2. load
        let pair = this._aPairs['' + sToken];

        // 3. validate
        if (pair.receiver && pair.sender)
        {
            if (this._aPairsMarkedForRemoval['' + sToken]) delete this._aPairsMarkedForRemoval['' + sToken];
        }
    },

    _collectGarbage: function()
    {
        // x. disable
        return;


        // 1. verify all garbage items
        for (let sKey in this._aPairsMarkedForRemoval)
        {
            // a. register
            let itemInGarbage = this._aPairsMarkedForRemoval[sKey];

            // I. check expiration
            if (new Date().getTime() - itemInGarbage.nMomentItGotMarked > this._nGarbageMaxAge)
            {
                // 1. validate [ possibly not necessary ] todo
                if (!this._aPairs['' + itemInGarbage.sToken]) continue;

                // 2. register
                let pair = this._aPairs['' + itemInGarbage.sToken];

                // 3. check if pair is obsolete
                if (!pair.sender && !pair.receiver)
                {
                    // a. remove
                    delete this._aPairs['' + itemInGarbage.sToken];

                    // b. remove
                    delete this._aPairsMarkedForRemoval[sKey];
                }

                // 4. check if pair is perfectly fine, and if so, remove from garbage
                if (pair.sender && pair.receiver) delete this._aPairsMarkedForRemoval[sKey];
            }
        }
    },

    _log: function()
    {
        // 1. output when in dev mode
        if (this._config.mode === 'dev') if (console) console.log.apply(this, arguments);
    },

    _logUsers: function(sTitle)
    {
        // 1. verify
        if (this._config.mode !== 'dev') return;

        // 2. output
        console.log('');
        console.log('Users: ' + sTitle);
        console.log('Sockets');
        console.log('=========================');
        console.log(this._aSockets);
        console.log('');
        console.log('Pairs');
        console.log('-------------------------');
        console.log(this._aPairs);
        console.log('');
        console.log('');
    }

};

// init
this.Mimoto = {};
this.Mimoto.config = {};

// read
process.argv.forEach((value, index) => {
    if (value.substr(0, 5) === 'mode=')
    {
        this.Mimoto.config.mode = (value.substr(5) === 'dev') ? 'dev' : 'prod';
    }
    if (value.substr(0, 6) === 'https=')
    {
        this.Mimoto.config.https = (value.substr(6) === 'false') ? false : true;
    }
});

// auto-start
module.exports.__construct(this.Mimoto.config);
