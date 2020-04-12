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
const Module_LogToFile = require('log-to-file');

// import core module
const CoreModule_Assert = require('assert');
const CoreModule_Util = require('util');

// import project classes
const PairManager = require('./components/PairManager');
const MongoDB = require('./components/MongoDB');
const Logger = require('./components/Logger');
const StartupInfo = require('./components/StartupInfo');
const ToggleDirectionStates = require('./../client/components/ToggleDirectionButton/ToggleDirectionStates');
const ToggleDirectionEvents = require('./../client/components/ToggleDirectionButton/ToggleDirectionEvents');
const ManualConnectEvents = require('./../client/components/ManualConnectButton/ManualConnectEvents');


module.exports = {

    // runtime modes
    PRODUCTION: 'prod',
    DEVELOPMENT: 'dev',

    // config
    _config: {
        mode: this.PRODUCTION,   // options: "prod" (no output)  | "dev" (output debugging comments)
        https: true,    // options: 'true' (runs on https)  | 'false' (runs on http)
        mongo: true,
        mongoauthenticate: true
    },
    _configFile: null,

    // services
    _app: null,
    _server: null,
    _socketIO: null,

    // managers
    _mongoManager: null,
    _pairManager: null,



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
        if (config.mongo === true || config.mongo === false) this._config.mongo = config.mongo;
        if (config.mongoauthenticate === true || config.mongoauthenticate === false) this._config.mongoauthenticate = config.mongoauthenticate;

        // 2. load
        let jsonConfigFile = Module_FS.readFileSync('CopyPaste.config.json');

        // 3. convert
        this._configFile = JSON.parse(jsonConfigFile);


        // 4. boot up
        if (this._config.mongo)
        {
            this._startupMongoDB();
        }
        else
        {
            this._startupSocketIO();
        }
    },

    /**
     * Startup MongoDB
     * @private
     */
    _startupMongoDB: function()
    {
        // 1. init
        this._mongoDB = new MongoDB(this._configFile, this._config);

        // 2. configure
        this._mongoDB.addEventListener(MongoDB.prototype.MONGODB_READY, this._onMongoDBReady.bind(this));

    },

    /**
     * Handle MongoManager `MONGODB_READY`
     * @private
     */
    _onMongoDBReady: function()
    {
        // 1. start
        this._startupSocketIO();
    },

    /**
     * Startup SocketIO
     * @private
     */
    _startupSocketIO: function()
    {
        // 1. init
        if (this._config.https)
        {
            // a. setup
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
            this._server = new Module_HTTP.createServer(this._app, { pingTimeout: 60000 });
        }

        // 2. setup
        this._socketIO = Module_SocketIO(this._server);

        // 3. configure
        this._socketIO.on('connection', this._onSocketConnect.bind(this));

        // 4. listen
        this._server.listen(this._configFile.socketio.server.port, this._configFile.socketio.server.host, this._onSocketIOConnected.bind(this));
    },


    /**
     * Handle SocketIO `connect`
     * @private
     */
    _onSocketIOConnected: function()
    {
        // 1. startup
        this._init();
    },

    /**
     * Initialize application
     * @private
     */
    _init: function()
    {
        // 1. init
        this._logger = new Logger(this._configFile.logtofile.file.toString(), this._config.mode === this.DEVELOPMENT);

        // 2. output
        new StartupInfo(this._logger, this._configFile, this._config, this._mongoDB.isRunning());

        // 3. init
        this._pairManager = new PairManager(this._mongoDB, this._logger);
    },



    // ----------------------------------------------------------------------------
    // --- Sockets ----------------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Handle socket `connect`
     * @param socket
     * @private
     */
    _onSocketConnect: function(socket)
    {
        // 1. store
        this._pairManager.registerSocket(socket);

        // 2. configure
        socket.on('disconnect', this._onSocketDisconnect.bind(this, socket));
    },

    /**
     * Handle socket `disconnect`
     * @param socket
     * @private
     */
    _onSocketDisconnect: function(socket)
    {
        // 1. register
        let sSocketId = socket.id;

        // 2. store
        this._pairManager.unregisterSocket(socket);

        // 3. clear configuration
        //socket.off();

        // 4. log
        this._log('Socket.id = ' + sSocketId + ' has disconnected');
    },



    // ----------------------------------------------------------------------------
    // --- Devices ----------------------------------------------------------------
    // ----------------------------------------------------------------------------



    /**
     * Handle manualcode event `REQUEST_MANUALCODE_HANDSHAKE`
     * @private
     */
    _onRequestManualCodeHandshake: function(secondaryDeviceSocket, sCode)
    {
        // 1. load
        let pair = this._getPairBySocket(secondaryDeviceSocket);

        // 2. validate
        if (pair === false) return;

        // 3. send
        pair.primaryDevice.emit(ManualConnectEvents.prototype.REQUEST_MANUALCODE_CONFIRMATION, sCode);
    },

    /**
     * Handle manualcode event `CONFIRM_MANUALCODE`
     * @private
     */
    _onConfirmManualCode: function(primaryDeviceSocket)
    {
        // 1. load
        let pair = this._getPairBySocket(primaryDeviceSocket);

        // 2. validate
        if (pair === false) return;

        // 3. move
        pair.secondaryDevice = pair.unconfirmedSecondaryDevice;

        // 4. cleanup
        delete pair.unconfirmedSecondaryDevice;

        // 5. send
        pair.secondaryDevice.emit(ManualConnectEvents.prototype.MANUALCODE_CONNECTED, pair.primaryDevicePublicKey, pair.direction, this._aSockets['' + primaryDeviceSocket.id].sToken);

        // 6. finish
        this._finishConnection(this.CONNECTIONTYPE_MANUAL, pair, this._aSockets['' + primaryDeviceSocket.id].sToken);
    },

    /**
     * Finish connection
     * @param sConnectionType
     * @param pair
     * @param sToken
     * @param bReconnect
     * @private
     */
    _finishConnection: function(sConnectionType, pair, sToken, bReconnect)
    {
        if (bReconnect)
        {
            // a. compose
            let actionLog = {
                created: new Date().toUTCString(),
                context: '_finishConnection',
                what: 'bReconnect was true'
            };

            // 11. store
            this._dbCollection_exceptions.insertOne(actionLog);
        }

        // 1. send
        if (pair.primaryDevice) pair.primaryDevice.emit((bReconnect) ? 'secondarydevice_reconnected' : 'secondarydevice_connected', pair.secondaryDevicePublicKey);

        // 2. update
        pair.states.connectionEstablished = true;

        // 3. store
        if (!this._aConnectedPairs[sToken]) this._aConnectedPairs[sToken] = true;


        // --- log ---


        // 4. output
        this._logUsers('Secondary device ' + ((bReconnect) ? 're' : '' ) + ' connects `' + sConnectionType + '` (socket.id = ' + pair.secondaryDevice.id + ')');

        // 5. log
        this._dbCollection_pairs.updateMany(
            {
                "data.token": sToken
            },
            {
                $set: { "states.connectionEstablished" : true },
                $push: { logs: { action: this._ACTIONTYPE_SECONDARYDEVICE_CONNECTED, timestamp: new Date().toUTCString() } }
            },
            function(err, result)
            {
                CoreModule_Assert.equal(err, null);
            }
        );
    },



    _onData: function(socket, encryptedData)
    {
        // 1. output
        this._log('Socket.id = ' + socket.id + ' has shared data');

        if (this._configFile.logtofile.file.toString())
        {
            let sOutput = '------' + '\n' +
                'encryptedData = ' + encryptedData + '\n' +
                '------' + '\n' +
                '' + '\n';

            Module_LogToFile(sOutput, this._configFile.logtofile.file.toString());
        }

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

        // 7. send
        receivingSocket.emit('data', encryptedData);

        // 8. log
        if (encryptedData.packageNumber === 0)
        {
            pair.log.push(
                {
                    type: this._ACTIONTYPE_DATA_START,
                    timestamp: new Date().toUTCString(),
                    contentType:encryptedData.sType,
                    direction:pair.direction
                }
            );
        }

        // 9. log
        if (encryptedData.packageNumber === encryptedData.packageCount)
        {
            pair.log.push(
                {
                    type: this._ACTIONTYPE_DATA_FINISH,
                    timestamp: new Date().toUTCString(),
                    contentType:encryptedData.sType,
                    direction:pair.direction
                }
            );
        }


        // --- log


        // 10. update
        pair.states.dataSent = true;

        // 12. store
        if (!this._aUsedPairs[sToken]) this._aUsedPairs[sToken] = true;

        // 13. output
        this._logUsers('Data shared (socket.id = ' + socket.id + ')');


        // 13. log
        this._dbCollection_pairs.updateMany(
            {
                "data.token": sToken
            },
            {
                $set: { "states.dataSent" : true },
                $push: { logs: {
                        type: this._ACTIONTYPE_DATA,
                        timestamp: new Date().toUTCString(),
                        contentType: encryptedData.sType,
                        direction: pair.direction
                    } }
            },
            function(err, result)
            {
                CoreModule_Assert.equal(err, null);
            }
        );
    },

    _onRequestToggleDirection: function(socket)
    {
        // 1. load
        let pair = this._getPairBySocket(socket);

        // 2. validate
        if (pair === false || !pair.primaryDevice || !pair.secondaryDevice) return;

        // 3. toggle
        pair.direction = (pair.direction === ToggleDirectionStates.prototype.DEFAULT) ? ToggleDirectionStates.prototype.SWAPPED : ToggleDirectionStates.prototype.DEFAULT;

        // 4. send
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

        // 5. send
        primaryDeviceSocket.emit('manualcode', pair.manualCode);

        // 6. store
        pair.manualCode.sToken = sToken;
    },

    /**
     * Handle event 'REQUEST_CONNECTION_BY_MANUALCODE'
     * @private
     */
    _onRequestConnectionByManualCode: function(secondaryDeviceSocket, sManualCode, sSecondaryDevicePublicKey)
    {
        // 1. validate
        if (!this._aManualCodes[sManualCode])
        {
            // a. send
            secondaryDeviceSocket.emit(ManualConnectEvents.prototype.MANUALCODE_NOT_FOUND);

            // b. exit
            return;
        }

        // 2. register
        let manualCode = this._aManualCodes[sManualCode];

        // 3. validate
        if (manualCode.expires < new Date().getTime())
        {
            // a. send
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
    if (value.substr(0, 18) === 'mongoauthenticate=')
    {
        this.Mimoto.config.mongoauthenticate = (value.substr(18) === 'false') ? false : true;
    }
});

// auto-start
module.exports.__construct(this.Mimoto.config);
