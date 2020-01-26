/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';


// import external classes
const Module_HTTP = require('http');
const Module_FS = require('fs');
const Module_HTTPS = require('https');
const Module_SocketIO = require('socket.io');
const Module_Express = require('express');
const Module_GenerateUniqueID = require('generate-unique-id');
const Module_GeneratePassword = require("generate-password");
const Module_MongoDB = require("mongodb");

// import core module
const CoreModule_Assert = require('assert');
const CoreModule_Util = require('util');

// import project classes
const ToggleDirectionStates = require('./../client/components/ToggleDirectionButton/ToggleDirectionStates');
const ToggleDirectionEvents = require('./../client/components/ToggleDirectionButton/ToggleDirectionEvents');
const ManualConnectEvents = require('./../client/components/ManualConnectButton/ManualConnectEvents');


module.exports = {

    // config
    _config: {
        mode: 'prod',   // options: "prod" (no output)  | "dev" (output debugging comments)
        https: true,    // options: 'true' (runs on https)  | 'false' (runs on http)
    },
    _configFile: null,

    // services
    _app: null,
    _server: null,
    _io: null,
    _mongo: null,

    // utils
    _timerLog: null,
    _timerManualCodes: null,

    // data
    _aActivePairs: [],
    _aInactivePairs: [],
    _aSockets: [],
    _aManualCodes: [],

    // logs
    _aConnectedPairs: [],       // which pairs actually had two devices connected at one point
    _aUsedPairs: [],            // which pairs where actually used to share data

    // connection types
    CONNECTIONTYPE_QR: 'qr',
    CONNECTIONTYPE_MANUAL: 'manual',

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

        // 2. load
        let jsonConfigFile = Module_FS.readFileSync('CopyPaste.config.json');

        // 3. convert
        this._configFile = JSON.parse(jsonConfigFile);


        // --- Mongo DB

        // 4. inti
        //this._mongo = Module_MongoDB.MongoClient;

        // 5. configure
        //const sMongoURL = 'mongodb://' + this._configFile.mongodb.host.toString() + ':' + this._configFile.mongodb.port.toString();

        // 6. connect
        //this._mongo.connect(sMongoURL, this._onMongoDBConnect.bind(this));


        // --- Socket.IO

        // 7. init
        if (this._config.https)
        {
            // c. setup
            this._server = new Module_HTTPS.createServer({
                key: Module_FS.readFileSync(this._configFile.ssl.key.toString(), 'utf8'),
                cert: Module_FS.readFileSync(this._configFile.ssl.certificate.toString(), 'utf8')
            });
        }
        else
        {
            // a. init
            this._app = Module_Express();

            // b. setup
            this._server = new Module_HTTP.createServer(this.app);
        }

        // 8. setup
        this._io = Module_SocketIO(this._server);

        // 9. configure
        this._io.on('connection', this._onUserConnect.bind(this));

        // 10. listen
        this._server.listen(3000, this._onSocketIOConnect.bind(this));
    },

    /**
     * Handle MongoDB connect
     * @param err
     * @param client
     * @private
     */
    _onMongoDBConnect: function(err, client)
    {
        // 1. init
        const sMongoDBName = this._configFile.mongodb.dbname.toString();

        // 2. validate
        CoreModule_Assert.equal(null, err);

        // 3. output
        console.log("MongoDB connected on " + this._configFile.mongodb.host.toString() + ':' + this._configFile.mongodb.port.toString());
        console.log();

        // 4. setup
        const db = client.db(sMongoDBName);


        //this._collection_MongoDB_pairs = db.collection('pairs');
        //this._collection_MongoDB_manualcode = db.collection('manualcodes');

        // 5. Do we need this?
        //client.close();


        //
        // const collection = db.collection('pairs');
        // // Insert some documents
        // collection.insertMany([
        //     {a : 1}, {a : 2}, {a : 3}
        // ]);
        //
        // collection.find({'a': 3}).toArray(function(err, docs) {
        //     CoreModule_Assert.equal(err, null);
        //
        //     console.log('Result of find', docs);
        // });


    },

    _onSocketIOConnect: function()
    {
        // 1. cleanup
        console.clear();

        // 2. prepare
        let aLines = [
            '',
            'CopyPaste.me - Frictionless sharing between devices',
            'Created by The Social Code',
            ' ',
            '@author  Sebastian Kersten',
            '@license MIT',
            ' ',
            'Please help keeping this service free by donating: https://paypal.me/thesocialcode',
            ' ',
            'listening on *:3000 ' + JSON.stringify(this._config),
            ''
        ];

        // 3. find max length
        let nMaxLength = 0;
        for (let nLineIndex = 0; nLineIndex < aLines.length; nLineIndex++)
        {
            // a. calculate
            if (aLines[nLineIndex].length > nMaxLength) nMaxLength = aLines[nLineIndex].length;
        }

        // 4. build and output lines
        for (let nLineIndex = 0; nLineIndex < aLines.length; nLineIndex++)
        {
            // a. build
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

            // b. output
            console.log(aLines[nLineIndex]);
        }

        // 5. output extra line
        console.log();

        // 6. output
        this._timerLog = setInterval(this._logUsers.bind(this, 'Automated log'), 60 * 1000);
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
        socket.on('primarydevice_request_token', this._onPrimaryDeviceRequestToken.bind(this, socket));
        socket.on('primarydevice_reconnect_to_token', this._onPrimaryDeviceReconnectToToken.bind(this, socket));
        socket.on('secondarydevice_connect_to_token', this._onSecondaryDeviceConnectToToken.bind(this, socket, false));
        socket.on('secondarydevice_reconnect_to_token', this._onSecondaryDeviceConnectToToken.bind(this, socket, true));
        socket.on('data', this._onData.bind(this, socket));
        socket.on(ToggleDirectionEvents.prototype.REQUEST_TOGGLE_DIRECTION, this._onRequestToggleDirection.bind(this, socket));
        socket.on(ManualConnectEvents.prototype.REQUEST_MANUALCODE, this._onRequestManualCode.bind(this, socket));
        socket.on(ManualConnectEvents.prototype.REQUEST_CONNECTION_BY_MANUALCODE, this._onRequestConnectionByManualCode.bind(this, socket));

        // 5. debug
        this._logUsers('User connected (socket.id = ' + socket.id + ')');
    },

    _onPrimaryDeviceRequestToken: function(primaryDeviceSocket, sPrimaryDevicePublicKey)
    {
        // 1. create
        let sToken = Module_GenerateUniqueID({ length: 32 });

        // 2. output
        this._log('Initial Device with socket.id = ' + primaryDeviceSocket.id + ' requests token = ' + sToken);

        // 3. verify
        if (this._aActivePairs['' + sToken] || !this._aSockets['' + primaryDeviceSocket.id]) return;

        // 4. build
        let pair = {
            primaryDevice: primaryDeviceSocket,
            primaryDevicePublicKey: sPrimaryDevicePublicKey,
            secondaryDevice: null,
            secondaryDevicePublicKey: '',
            manualCode: '',
            direction: ToggleDirectionStates.prototype.DEFAULT,
            connectiontype: null,
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
        this._aSockets['' + primaryDeviceSocket.id].sToken = sToken;

        // 7. broadcast
        primaryDeviceSocket.emit('token', sToken);

        // 8. output
        this._logUsers('Initial Device requested token (socket.id = ' + primaryDeviceSocket.id + ')');
    },

    _onPrimaryDeviceReconnectToToken: function(primaryDeviceSocket, sToken)
    {
        // 1. output
        this._log('Primary device wants to reconnect to token ' + sToken);

        // 2. load
        let pair = this._getPairByToken(sToken);

        // 3. validate
        if (pair === false)
        {
            // a. output
            this._log('Token = ' + sToken + ' not found for reconnecting primary device');

            // b. broadcast
            primaryDeviceSocket.emit('token_not_found');

            // c. exit
            return;
        }


        // ---


        // 4. validate
        if (pair.primaryDevice)
        {
            // 1. output
            this._log('Pair already has a primary device connected. sToken = ' + sToken);

            // 2. warn
            this._broadcastSecurityWarning(primaryDeviceSocket, pair, sToken);
            return;
        }


        // ---


        // 5. store
        this._aActivePairs['' + sToken].primaryDevice = primaryDeviceSocket;

        // 6. store
        this._aSockets['' + primaryDeviceSocket.id].sToken = sToken;

        // 7. broadcast
        primaryDeviceSocket.emit('token_reconnected');

        // 8. broadcast
        if (pair.secondaryDevice) pair.secondaryDevice.emit('primarydevice_reconnected');

        // 9. output
        this._logUsers('Primary device reconnects to token (socket.id = ' + primaryDeviceSocket.id + ')');
    },

    _onSecondaryDeviceConnectToToken: function(secondaryDeviceSocket, bReconnect, sToken, sSecondaryDevicePublicKey)
    {
        // 1. prepare
        sToken = '' + sToken;

        // 1. output
        this._log('Secondary device wants to connect to token ' + sToken);

        // 2. load
        let pair = this._getPairByToken(sToken);

        // 3. validate
        if (pair === false)
        {
            // a. broadcast
            secondaryDeviceSocket.emit('token_not_found');

            // b. exit
            return;
        }

        // 4. validate
        if (pair.secondaryDevice)
        {
            // 1. output
            this._log('Pair already has a second device connected. sToken = ' + sToken);

            // 2. warn
            this._broadcastSecurityWarning(secondaryDeviceSocket, pair, sToken);
            return;
        }

        // 5. connect
        this._connectSecondaryDeviceToPair(this.CONNECTIONTYPE_QR, pair, secondaryDeviceSocket, sSecondaryDevicePublicKey, sToken, bReconnect);
    },


    _connectSecondaryDeviceToPair: function(sConnectionType, pair, secondaryDeviceSocket, sSecondaryDevicePublicKey, sToken, bReconnect)
    {
        // 1. store
        this._aActivePairs[sToken].secondaryDevice = secondaryDeviceSocket;

        // 2. store
        this._aSockets['' + secondaryDeviceSocket.id].sToken = sToken;

        // 3. store
        pair.secondaryDevicePublicKey = sSecondaryDevicePublicKey;
        pair.connectiontype = sConnectionType;


        // --- communicate


        // 4. broadcast
        switch(sConnectionType)
        {
            case this.CONNECTIONTYPE_QR:

                secondaryDeviceSocket.emit('token_connected', pair.primaryDevicePublicKey, pair.direction);
                break;

            case this.CONNECTIONTYPE_MANUAL:

                secondaryDeviceSocket.emit(ManualConnectEvents.prototype.MANUALCODE_CONNECTED, pair.primaryDevicePublicKey, pair.direction);
                break;

        }


        // 5. broadcast
        if (pair.primaryDevice) pair.primaryDevice.emit((bReconnect) ? 'secondarydevice_reconnected' : 'secondarydevice_connected', pair.secondaryDevicePublicKey);


        // --- log


        // 6. update
        pair.states.connectionEstablished = true;

        // 7. store
        if (!this._aConnectedPairs[sToken]) this._aConnectedPairs[sToken] = true;

        // 8. output
        this._logUsers('Secondary device ' + ((bReconnect) ? 're' : '' ) + ' connects `' + sConnectionType + '` (socket.id = ' + secondaryDeviceSocket.id + ')');
    },

    /**
     * Handle socket `disconnect`
     * @param socket
     * @private
     */
    _onUserDisconnect: function(socket)
    {
        // 1. output
        this._log('Socket.id = ' + socket.id + ' has disconnected');

        // 2. validate
        if (!this._aSockets['' + socket.id]) return;

        // 3. load
        let registeredSocket = this._aSockets['' + socket.id];

        // 4. register
        let sToken = registeredSocket.sToken;

        // 5. cleanup
        delete this._aSockets['' + socket.id];

        // 6. validate
        if (!sToken) return;

        // 7. load
        let pair = this._getPairByToken(sToken);

        // 8. validate
        if (pair === false) return;

        // 9. validate
        if (pair.primaryDevice && pair.primaryDevice.id === socket.id)
        {
            // a. cleanup
            pair.primaryDevice = null;

            // d. broadcast
            if (pair.secondaryDevice) pair.secondaryDevice.emit('primarydevice_disconnected');
        }

        // 10. validate
        if (pair.secondaryDevice && pair.secondaryDevice.id === socket.id)
        {
            // a. cleanup
            pair.secondaryDevice = null;

            // b. broadcast
            if (pair.primaryDevice) pair.primaryDevice.emit('secondarydevice_disconnected');
        }

        // 11. validate
        if (!pair.primaryDevice && !pair.secondaryDevice)
        {
            // a. move
            this._aInactivePairs[sToken] = pair;

            // b. clear
            delete this._aActivePairs[sToken];

            // c. store
            pair.log.push( { type: this._ACTIONTYPE_ARCHIVED, timestamp: new Date().toUTCString() } );
        }

        // 12. output
        this._logUsers('User disconnected (socket.id = ' + socket.id + ')');
    },

    _onData: function(socket, encryptedData)
    {
        // 1. output
        this._log('Socket.id = ' + socket.id + ' has shared data');

        // 2. load
        let sToken = this._getTokenBySocket(socket);

        // 3. validate
        if (sToken === false) return;

        // 4. load
        let pair = this._getPairByToken(sToken);

        // 5. validate
        if (pair === false) return;
        if (pair.direction === ToggleDirectionStates.prototype.SWAPPED)
        {
            if (!pair.secondaryDevice) return;
        }
        else
        {
            if (!pair.primaryDevice) return;
        }

        // 6. register
        let receivingSocket = (pair.direction === ToggleDirectionStates.prototype.SWAPPED) ? pair.secondaryDevice : pair.primaryDevice;

        // 7. broadcast
        receivingSocket.emit('data', encryptedData);

        // 8. store
        pair.log.push(
            {
                type: this._ACTIONTYPE_DATA,
                timestamp: new Date().toUTCString(),
                contentType:encryptedData.sType,
                direction:pair.direction
            }
        );


        // --- log


        // 9. update
        pair.states.dataSent = true;

        // 10. store
        if (!this._aUsedPairs[sToken]) this._aUsedPairs[sToken] = true;

        // 11. output
        this._logUsers('Data shared (socket.id = ' + socket.id + ')');
    },

    _onRequestToggleDirection: function(socket)
    {
        // 1. load
        let pair = this._getPairBySocket(socket);

        // 2. validate
        if (pair === false || !pair.primaryDevice || !pair.secondaryDevice) return;

        // 3. toggle
        pair.direction = (pair.direction === ToggleDirectionStates.prototype.DEFAULT) ? ToggleDirectionStates.prototype.SWAPPED : ToggleDirectionStates.prototype.DEFAULT;

        // 4. broadcast
        pair.primaryDevice.emit(ToggleDirectionEvents.prototype.TOGGLE_DIRECTION, pair.direction);
        pair.secondaryDevice.emit(ToggleDirectionEvents.prototype.TOGGLE_DIRECTION, pair.direction);
    },

    /**
     * Handle request event 'REQUEST_MANUALCODE'
     * @param primaryDeviceSocket
     * @private
     */
    _onRequestManualCode: function(primaryDeviceSocket)
    {
        // 1. output
        this._log('Socket.id = ' + primaryDeviceSocket.id + ' has requested manual code');

        // 2. load
        let sToken = this._getTokenBySocket(primaryDeviceSocket);

        // 3. validate
        if (sToken === false) return;

        // 4. load
        let pair = this._getPairByToken(sToken);

        // 5. validate
        if (pair === false) return;

        // 4. create and store
        pair.manualCode = this._createManualCode();

        // 5. broadcast
        primaryDeviceSocket.emit('manualcode', pair.manualCode);

        // 6. store
        pair.manualCode.sToken = sToken;
    },

    /**
     * Handle event 'onRequestConnectionByManualCode'
     * @private
     */
    _onRequestConnectionByManualCode: function(secondaryDeviceSocket, sManualCode, sSecondaryDevicePublicKey)
    {
        // 1. validate
        if (!this._aManualCodes[sManualCode])
        {
            // a. broadcast
            secondaryDeviceSocket.emit(ManualConnectEvents.prototype.MANUALCODE_NOT_FOUND);

            // b. exit
            return;
        }

        // 2. register
        let manualCode = this._aManualCodes[sManualCode];

        // 3. validate
        if (manualCode.expires < new Date().getTime())
        {
            // a. broadcast
            secondaryDeviceSocket.emit(ManualConnectEvents.prototype.MANUALCODE_EXPIRED);

            // b. exit
            return;
        }

        // 4. invalidate
        delete this._aManualCodes[sManualCode];


        // --- connect


        // 5. load
        let pair = this._getPairByToken(manualCode.sToken);

        // 6. validate
        if (pair === false) return;

        // 7. connect
        this._connectSecondaryDeviceToPair(this.CONNECTIONTYPE_MANUAL, pair, secondaryDeviceSocket, sSecondaryDevicePublicKey, manualCode.sToken);
    },

    /**
     * Create manual code
     * @private
     */
    _createManualCode: function()
    {
        // 1. init
        let manualCode = null;
        let sManualCode = null;
        let bManualCodeFound = false;

        // 2. run
        while(!bManualCodeFound)
        {
            // a. create
            sManualCode = Module_GeneratePassword.generate({
                length: 6,
                numbers: true,
                lowercase: false,
                uppercase: true,
                excludeSimilarCharacters: true,
                exclude: 'i'
            });

            // b. validate
            if (!this._aManualCodes[sManualCode])
            {
                // I. setup
                let nCreated = new Date().getTime();

                // II. build
                manualCode = {                      // ### ManualConnect
                    created: nCreated,
                    expires: nCreated + 5 * 60 * 1000,
                    code: sManualCode
                };

                // III. store
                this._aManualCodes[sManualCode] = manualCode;

                // IV. toggle
                bManualCodeFound = true;
            }
        }

        // 3. verify or start
        if (!this._timerManualCodes) this._timerManualCodes = setInterval(this._cleanupManualCodes.bind(this), 1000);

        // 4. send
        return manualCode;
    },

    /**
     * Cleanup manual code
     * @private
     */
    _cleanupManualCodes: function()
    {
        // 1. register
        let nNow = new Date().getTime();

        // 2. verify all
        for (let sManualCode in this._aManualCodes)
        {
            // a. validate
            if (this._aManualCodes[sManualCode].expires > nNow) continue;

            // b. remove
            delete this._aManualCodes[sManualCode];
        }

        // 3. verify or cleanup
        if (Object.keys(this._aManualCodes).length === 0)
        {
            clearInterval(this._timerManualCodes);
            this._timerManualCodes = null;
        }
    },

    _broadcastSecurityWarning: function(requestingSocket, pair, sToken)
    {
        // 1. broadcast breach to current user
        requestingSocket.emit('security_compromised');

        // 2. cleanup
        delete this._aSockets['' + requestingSocket.id];

        // 3. verify
        if (pair.primaryDevice)
        {
            // a. broadcast
            pair.primaryDevice.emit('security_compromised');

            // b. cleanup
            delete this._aSockets['' + pair.primaryDevice.id];
        }

        // 4. verify
        if (pair.secondaryDevice)
        {
            // a. broadcast
            pair.secondaryDevice.emit('security_compromised');

            // b. cleanup
            delete this._aSockets['' + pair.secondaryDevice.id];
        }

        // 5. clear
        delete this._aActivePairs['' + sToken];
    },

    _getPairBySocket: function(socket)
    {
        // 1. load
        let sToken = this._getTokenBySocket(socket);

        // 2. validate
        if (sToken === false) return false;

        // 3. load and send
        return this._getPairByToken(sToken);
    },

    _getTokenBySocket: function(socket)
    {
        // 1. validate
        if (!this._aSockets['' + socket.id]) return;

        // 2. load
        let registeredSocket = this._aSockets['' + socket.id];

        // 3. register
        let sToken = registeredSocket.sToken;

        // 4. validate
        if (!sToken) return false;

        // 5. load and send
        return sToken;
    },

    _getPairByToken: function(sToken)
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
        console.log(this._aInactivePairs);
        //console.log(CoreModule_Util.inspect(this._aInactivePairs, false, null, true));
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
