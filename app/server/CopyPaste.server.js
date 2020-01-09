/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';


// import
const Module_HTTP = require('http');
const Module_FS = require('fs');
const Module_HTTPS = require('https');
const Module_SocketIO = require('socket.io');
const Module_Express = require('express');
const Module_GenerateUniqueID = require('generate-unique-id');
const CoreModule_Util = require('util');


module.exports = {

    // sonfig
    _config: {
        mode: 'prod',   // options: "prod" (no output)  | "dev" (output debugging comments)
        https: true,    // options: 'true' (runs on https)  | 'false' (runs on http)
    },


    // services
    _app: null,
    _server: null,
    _io: null,

    // data
    _aActivePairs: [],
    _aInactivePairs: [],
    _aSockets: [],

    // logs
    _aConnectedPairs: [],       // which pairs actually had two devices connected at one point
    _aUsedPairs: [],            // which pairs where actually used to share data

    // action types
    _ACTIONTYPE_CREATED: 'created',
    _ACTIONTYPE_ARCHIVED: 'archived',
    _ACTIONTYPE_UNARCHIVED: 'unarchived',
    _ACTIONTYPE_DATA: 'data',



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
        if (this._config.https)
        {
            // a. load
            let jsonConfigFile = Module_FS.readFileSync('CopyPaste.config.json');

            // b. convert
            let configFile = JSON.parse(jsonConfigFile);

            // c. setup
            this._server = new Module_HTTPS.createServer({
                key: Module_FS.readFileSync(configFile.ssl.key.toString(), 'utf8'),
                cert: Module_FS.readFileSync(configFile.ssl.certificate.toString(), 'utf8')
            });
        }
        else
        {
            // a. init
            this._app = Module_Express();

            // b. setup
            this._server = new Module_HTTP.createServer(this.app);
        }

        // 3. setup
        this._io = Module_SocketIO(this._server);

        // 4. configure
        this._io.on('connection', this._onUserConnect.bind(this));

        // 5. listen
        this._server.listen(3000, function()
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

    _onReceiverRequestToken: function(receiverSocket, sReceiverPublicKey)
    {
        // 1. create
        let sToken = Module_GenerateUniqueID({ length: 32 });

        // 2. output
        this._log('Receiver with socket.id = ' + receiverSocket.id + ' requests token = ' + sToken);

        // 3. verify
        if (this._aActivePairs['' + sToken] || !this._aSockets['' + receiverSocket.id]) return;

        // 4. build
        let pair = {
            receiver: receiverSocket,
            receiverPublicKey: sReceiverPublicKey,
            sender: null,
            senderPublicKey: '',
            states: {
                connectionEstablished: false,
                dataSent: false,
            },
            log: [
                { action: this._ACTIONTYPE_CREATED, timestamp: new Date().toUTCString() }
            ]
        };

        // 5. store
        this._aActivePairs['' + sToken] = pair;

        // 6. update
        this._aSockets['' + receiverSocket.id].sToken = sToken;

        // 7. broadcast
        receiverSocket.emit('token', sToken);

        // 8. output
        this._logUsers('After receiver requests token (socket.id = ' + receiverSocket.id + ')');
    },

    _onReceiverReconnectToToken: function(receiverSocket, sToken)
    {
        // 1. output
        this._log('Receiver wants to reconnect to token ' + sToken);

        // 2. load
        let pair = this._getPair(sToken);

        // 3. validate
        if (pair === false)
        {
            // a. output
            this._log('Token = ' + sToken + ' not found for reconnecting receiver');

            // b. broadcast
            receiverSocket.emit('token_not_found');

            // c. exit
            return;
        }


        // ---


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
        this._aActivePairs['' + sToken].receiver = receiverSocket;

        // 6. store
        this._aSockets['' + receiverSocket.id].sToken = sToken;

        // 7. broadcast
        receiverSocket.emit('token_reconnected');

        // 8. broadcast
        if (pair.sender) pair.sender.emit('receiver_reconnected');

        // 9. output
        this._logUsers('After receiver reconnects to token (socket.id = ' + receiverSocket.id + ')');
    },

    _onSenderConnectToToken: function(senderSocket, bReconnect, sToken, sSenderPublicKey)
    {
        // 1. prepare
        sToken = '' + sToken;

        // 1. output
        this._log('Sender wants to reconnect to token ' + sToken);

        // 2. load
        let pair = this._getPair(sToken);

        // 3. validate
        if (pair === false)
        {
            // a. broadcast
            senderSocket.emit('token_not_found');

            // b. exit
            return;
        }


        // ---


        // 4. validate
        if (pair.sender)
        {
            // 1. output
            this._log('Pair already has a sender connected. sToken = ' + sToken);

            // 2. warn
            this._broadcastSecurityWarning(senderSocket, pair, sToken);
            return;
        }


        // ---


        // 5. store
        this._aActivePairs[sToken].sender = senderSocket;

        // 6. store
        this._aSockets['' + senderSocket.id].sToken = sToken;

        // 7. store
        pair.senderPublicKey = sSenderPublicKey;

        // 7. broadcast
        senderSocket.emit((bReconnect) ? 'token_reconnected' : 'token_connected', pair.receiverPublicKey);

        // 8. broadcast
        if (pair.receiver) pair.receiver.emit((bReconnect) ? 'sender_reconnected' : 'sender_connected', pair.senderPublicKey);


        // --- logging


        // 9. update
        pair.states.connectionEstablished = true;

        // 10. store
        if (!this._aConnectedPairs[sToken]) this._aConnectedPairs[sToken] = true;

        // 11. output
        this._logUsers('After sender connects to token (socket.id = ' + senderSocket.id + ')');
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
        let pair = this._getPair(sToken);

        // 7. validate
        if (pair === false) return;

        // 8. validate
        if (pair.receiver && pair.receiver.id === socket.id)
        {
            // a. cleanup
            pair.receiver = null;

            // d. broadcast
            if (pair.sender) pair.sender.emit('receiver_disconnected');
        }

        // 9. validate
        if (pair.sender && pair.sender.id === socket.id)
        {
            // a. cleanup
            pair.sender = null;

            // b. broadcast
            if (pair.receiver) pair.receiver.emit('sender_disconnected');
        }

        // 10. validate
        if (!pair.receiver && !pair.sender)
        {
            // a. move
            this._aInactivePairs[sToken] = pair;

            // b. clear
            delete this._aActivePairs[sToken];

            // c. store
            pair.log.push( { type: this._ACTIONTYPE_ARCHIVED, timestamp: new Date().toUTCString() } );
        }

        // 11. output
        this._logUsers('After user disconnected');
    },

    _onData: function(data)
    {
        // 1. load
        let pair = this._getPair(data.sToken);

        // 2. validate
        if (pair === false || !pair.receiver) return;

        // 3. broadcast
        pair.receiver.emit('data', { sType:data.sType, value:data.value });

        // 4. store
        pair.log.push( { type: this._ACTIONTYPE_DATA, timestamp: new Date().toUTCString(), contentType:data.sType } );


        // --- logging


        // 5. update
        pair.states.dataSent = true;

        // 6. store
        if (!this._aUsedPairs[data.sToken]) this._aUsedPairs[data.sToken] = true;
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
        delete this._aActivePairs['' + sToken];
    },

    _getPair: function(sToken)
    {
        // 1. prepare
        sToken = '' + sToken;

        // 2. init
        let pair = false;

        // 3. locate
        if (this._aActivePairs[sToken])
        {
            // a. register
            pair = this._aActivePairs[sToken];
        }
        else
        {
            // a. validate
            if (this._aInactivePairs[sToken])
            {
                // I. register
                pair = this._aInactivePairs[sToken];

                // II. move
                this._aActivePairs[sToken] = pair;

                // II. clear
                delete this._aInactivePairs[sToken];

                // IV. store
                pair.log.push( { type: this._ACTIONTYPE_UNARCHIVED, timestamp: new Date().toUTCString() } );
            }
        }

        // 4. send
        return pair;
    },

    _log: function()
    {
        // 1. output when in dev mode
        if (this._config.mode === 'dev') if (console) console.log.apply(this, arguments);
    },

    _logUsers: function(sTitle)
    {
        // 1. output
        console.log('');
        console.log('Usage: ' + sTitle);
        console.log('=========================');
        console.log('Number of sockets:', Object.keys(this._aSockets).length);
        console.log('Number of active pairs:', Object.keys(this._aActivePairs).length);
        console.log('Number of inactive pairs:', Object.keys(this._aInactivePairs).length);
        console.log('---');
        console.log('Number of pairs that established connection between both devices:', Object.keys(this._aConnectedPairs).length);
        console.log('Number of pairs that have been used to send data:', Object.keys(this._aUsedPairs).length);

        // 2. verify
        if (this._config.mode !== 'dev') return;

        // 3. output
        console.log('');
        console.log('Users: ' + sTitle);
        console.log('Sockets');
        console.log('=========================');
        console.log(this._aSockets);
        console.log('');
        console.log('Active pairs');
        console.log('-------------------------');
        console.log(this._aActivePairs);
        console.log('');
        console.log('Inactive pairs');
        console.log('-------------------------');
        console.log(CoreModule_Util.inspect(this._aInactivePairs, false, null, true));
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
