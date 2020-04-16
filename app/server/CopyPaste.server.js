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
const Device = require('./components/Device');
const DeviceManager = require('./components/DeviceManager');
const Pair = require('./components/Pair');
const PairManager = require('./components/PairManager');
const TokenManager = require('./components/TokenManager');
const MongoDB = require('./components/MongoDB');
const Logger = require('./components/Logger');
const StartupInfo = require('./components/StartupInfo');
const ToggleDirectionStates = require('./../client/components/ToggleDirectionButton/ToggleDirectionStates');
const ManualConnectEvents = require('./../client/components/ManualConnectButton/ManualConnectEvents');
const ConnectorEvents = require('./../client/components/Connector/ConnectorEvents');


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

    // core
    Mimoto: {},

    // services
    _app: null,
    _server: null,
    _socketIO: null,

    // managers
    _tokenManager: null,



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
        if (!this._startupMongoDB()) this._startupSocketIO();
    },

    /**
     * Startup MongoDB
     * @private
     */
    _startupMongoDB: function()
    {
        // 1. init
        this.Mimoto.mongoDB = new MongoDB(this._configFile, this._config);

        // 2. verify and exit
        if (!this._config.mongo) return false;

        // 3. configure
        this.Mimoto.mongoDB.addEventListener(MongoDB.prototype.MONGODB_READY, this._onMongoDBReady.bind(this));

        // 4. exit
        return true
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
        // 1. extend core
        PairManager.prototype.Mimoto = this.Mimoto;
        DeviceManager.prototype.Mimoto = this.Mimoto;
        StartupInfo.prototype.Mimoto = this.Mimoto;
        Pair.prototype.Mimoto = this.Mimoto;

        // 2. init core
        this.Mimoto.logger = new Logger(this._configFile.logtofile.file.toString(), this._config.mode === this.DEVELOPMENT);

        // 3. output
        new StartupInfo(this._configFile, this._config, this.Mimoto.mongoDB.isRunning());

        // 4. init core
        this.Mimoto.deviceManager = new DeviceManager();
        this.Mimoto.pairManager = new PairManager();

        // 5. init
        this._tokenManager = new TokenManager();
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
        this.Mimoto.deviceManager.registerSocket(socket);

        // 2. configure - sockets
        socket.on('disconnect', this._onSocketDisconnect.bind(this, socket));

        // 3. configure primary device
        socket.on(ConnectorEvents.prototype.REQUEST_PRIMARYDEVICE_CONNECT, this._onRequestPrimaryDeviceConnect.bind(this, socket));
        socket.on(ConnectorEvents.prototype.REQUEST_PRIMARYDEVICE_FRESH_TOKEN, this._onRequestPrimaryDeviceFreshToken.bind(this, socket));

        // 4. configure secondary device
        socket.on(ConnectorEvents.prototype.REQUEST_SECONDARYDEVICE_CONNECT_BY_QR, this._onSecondaryDeviceConnectByQR.bind(this, socket));

        // 5. configure both devices
        socket.on(ConnectorEvents.prototype.REQUEST_DEVICE_RECONNECT, this._onRequestDeviceReconnect.bind(this, socket));
        socket.on(ConnectorEvents.prototype.DATA, this._onData.bind(this, socket));




        // 5. configure - setting events
        socket.on(ConnectorEvents.prototype.REQUEST_TOGGLE_DIRECTION, this._onRequestToggleDirection.bind(this, socket));

        // 6. configure - handshake events
        //socket.on(ManualConnectEvents.prototype.REQUEST_MANUALCODE, this._onRequestManualCode.bind(this, socket));
        //socket.on(ManualConnectEvents.prototype.REQUEST_CONNECTION_BY_MANUALCODE, this._onRequestConnectionByManualCode.bind(this, socket));
        //socket.on(ManualConnectEvents.prototype.REQUEST_MANUALCODE_HANDSHAKE, this._onRequestManualCodeHandshake.bind(this, socket));
        //socket.on(ManualConnectEvents.prototype.CONFIRM_MANUALCODE, this._onConfirmManualCode.bind(this, socket));


        // 8. log
        this._logUsers('Socket connected (socket.id = ' + socket.id + ')');
    },

    /**
     * Handle socket `disconnect`
     * @param socket
     * @private
     */
    _onSocketDisconnect: function(socket)
    {
        // 1. store
        this.Mimoto.deviceManager.unregisterSocket(socket);

        // 2. clear configuration
        socket.removeAllListeners();





        // // 2. load
        // let device = this._aDevicesBySocketID['' + socket.id];
        //
        // // 3. cleanup
        // delete this._aDevicesBySocketID['' + socket.id];
        // delete this._aDevicesByDeviceID['' + device.getDeviceID()];
        //
        // // 4. register
        // let sPairID = device.getPairID();
        //
        // // 5. validate
        // if (!sPairID) return;
        //
        // // 6. register
        // let pair = this._aPairs['' + device.getPairID()];
        //
        // // 7. validate
        // if (pair === false) return;
        //
        //
        //
        // return;
        //
        //
        // // 9. validate
        // if (pair.primaryDevice && pair.primaryDevice.id === socket.id)
        // {
        //     // a. cleanup
        //     pair.primaryDevice = null;
        //
        //     // b. send
        //     if (pair.secondaryDevice) pair.secondaryDevice.emit('primarydevice_disconnected');
        //
        //     // c. log
        //     this._dbCollection_pairs.updateMany(
        //         {
        //             "data.token": sToken
        //         },
        //         {
        //             $push: { logs: { action: this._ACTIONTYPE_PRIMARYDEVICE_DISCONNECTED, timestamp: new Date().toUTCString() } }
        //         },
        //         function(err, result)
        //         {
        //             CoreModule_Assert.equal(err, null);
        //         }
        //     );
        // }
        //
        // // 10. validate
        // if (pair.secondaryDevice && pair.secondaryDevice.id === socket.id)
        // {
        //     // a. cleanup
        //     pair.secondaryDevice = null;
        //
        //     // b. send
        //     if (pair.primaryDevice) pair.primaryDevice.emit('secondarydevice_disconnected');
        //
        //     // c. log
        //     this._dbCollection_pairs.updateMany(
        //         {
        //             "data.token": sToken
        //         },
        //         {
        //             $push: { logs: { action: this._ACTIONTYPE_SECONDARYDEVICE_DISCONNECTED, timestamp: new Date().toUTCString() } }
        //         },
        //         function(err, result)
        //         {
        //             CoreModule_Assert.equal(err, null);
        //         }
        //     );
        // }
        //
        // // 11. validate
        // if (!pair.primaryDevice && !pair.secondaryDevice)
        // {
        //     // a. move
        //     this._aIdlePairs[sToken] = pair;
        //
        //     // b. clear
        //     delete this._aPairs[sToken];
        //
        //     // c. store
        //     pair.log.push( { type: this._ACTIONTYPE_ARCHIVED, timestamp: new Date().toUTCString() } );
        //
        //     // d. log
        //     this._dbCollection_pairs.updateMany(
        //         {
        //             "data.token": sToken
        //         },
        //         {
        //             $set: { "states.archived" : true },
        //             $push: { logs: { action: this._ACTIONTYPE_ARCHIVED, timestamp: new Date().toUTCString() } }
        //         },
        //         function(err, result)
        //         {
        //             CoreModule_Assert.equal(err, null);
        //         }
        //     );
        // }
        //














        // 3. log
        this._logUsers('Socket disconnected (socket.id = ' + socket.id + ')');
    },



    // ----------------------------------------------------------------------------
    // --- Event handlers - Pairing - Primary device ------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Handle primary device `REQUEST_PRIMARYDEVICE_CONNECT`
     * @param primaryDeviceSocket
     * @param sPrimaryDevicePublicKey
     * @private
     */
    _onRequestPrimaryDeviceConnect: function(primaryDeviceSocket, sPrimaryDevicePublicKey)
    {
        // 1. init
        let pair = this.Mimoto.pairManager.initPair(primaryDeviceSocket, sPrimaryDevicePublicKey);

        // 2. create
        let token = this._tokenManager.createToken(pair);

        // 3. send
        pair.getPrimaryDevice().emit(ConnectorEvents.prototype.UPDATE_PRIMARYDEVICE_CONNECTED, pair.getPrimaryDeviceID(), token.getValue(), token.getLifetime());

        // 4. output
        this._logUsers('Primary Device with socket.id = ' + primaryDeviceSocket.id + ' requests token = ' + token.getValue());
    },

    /**
     * Handle device `REQUEST_DEVICE_RECONNECT`
     * @param socket
     * @param sDeviceID
     * @private
     */
    _onRequestDeviceReconnect: function(socket, sDeviceID)
    {
        // 1. load
        let newDevice = this.Mimoto.deviceManager.getDeviceBySocketID(socket.id);
        let originalDevice = this.Mimoto.deviceManager.getOfflineDeviceByDeviceID(sDeviceID);

        // 2. validate
        if (!newDevice || !originalDevice)
        {
            // a. output
            this.Mimoto.logger.log('No original device after server restart sDeviceID = ' + sDeviceID);

            // b. send
            socket.emit(ConnectorEvents.prototype.ERROR_DEVICE_RECONNECT_DEVICEID_NOT_FOUND);

            // c. exit
            return;
        }

        // 3. restore and merge
        let device = this.Mimoto.deviceManager.restoreAndMerge(originalDevice, newDevice);



        console.log('sDevice = `' + device.getType() + '` (' +  sDeviceID + ') - originalDevice = ', originalDevice);




        // 4. load
        let pair = this.Mimoto.pairManager.getPairByDeviceID(sDeviceID);

        // 5. validate
        if (pair === false)
        {
            // a. output
            this.Mimoto.logger.log('No pair connected to sDeviceID = ' + sDeviceID);

            // b. send
            socket.emit(ConnectorEvents.prototype.ERROR_DEVICE_RECONNECT_DEVICEID_NOT_FOUND);

            // c. exit
            return;
        }

        // 6. select
        switch(device.getType())
        {
            case Device.prototype.PRIMARYDEVICE:

                // a. store
                if (!pair.reconnectPrimaryDevice(device)) return;

                // b. send
                if (pair.hasSecondaryDevice()) pair.getSecondaryDevice().emit(ConnectorEvents.prototype.UPDATE_OTHERDEVICE_RECONNECTED);

                break;

            case Device.prototype.SECONDARYDEVICE:

                // a. store
                if (!pair.reconnectSecondaryDevice(device)) return;

                // b. send
                if (pair.hasPrimaryDevice()) pair.getPrimaryDevice().emit(ConnectorEvents.prototype.UPDATE_OTHERDEVICE_RECONNECTED);

                break;

            default:

                return;
        }


        // ---


        // 8. output
        this._logUsers('Device `' + device.getType() + '` with sDeviceID = `' + sDeviceID + '` reconnected to pair (socket.id = ' + socket.id + ')');
    },



    /**
     * Handle primary device `REQUEST_PRIMARYDEVICE_FRESH_TOKEN`
     * @param socket
     * @param sDeviceID
     * @private
     */
    _onRequestPrimaryDeviceFreshToken: function(socket, sDeviceID)
    {
        // 1. load
        let pair = this.Mimoto.pairManager.getPairByDeviceID(sDeviceID);

        // 2. validate
        if (pair === false) return;

        // 3. refresh
        let token = this._tokenManager.createToken(pair);

        // 4. send
        pair.getPrimaryDevice().emit(ConnectorEvents.prototype.UPDATE_PRIMARYDEVICE_FRESH_TOKEN, token.getValue(), token.getLifetime());
    },



    // ----------------------------------------------------------------------------
    // --- Event handlers - Pairing - Secondary device ----------------------------
    // ----------------------------------------------------------------------------


    /**
     * Handle secondary device `SECONDARYDEVICE_CONNECT_BY_QR`
     * @param secondaryDeviceSocket
     * @param sTokenValue
     * @param sSecondaryDevicePublicKey
     * @private
     */
    _onSecondaryDeviceConnectByQR: function(secondaryDeviceSocket, sSecondaryDevicePublicKey, sTokenValue)
    {
        // 1. load
        let device = this.Mimoto.deviceManager.getDeviceBySocketID(secondaryDeviceSocket.id);

        // 2. load
        let token = this._tokenManager.getToken(sTokenValue);

        // 3. validate or send error
        if (token === false)
        {
            this.Mimoto.logger.log('SECONDARYDEVICE_CONNECT_TOKEN_NOT_FOUND for sTokenValue=`' + sTokenValue + '` from socket.id=`' + secondaryDeviceSocket.id + '`');

            // a. broadcast
            secondaryDeviceSocket.emit(ConnectorEvents.prototype.ERROR_SECONDARYDEVICE_CONNECT_BY_QR_TOKEN_NOT_FOUND);

            // b. exit
            return;
        }

        // 4. load
        let pair = token.getPair();

        // 5. validate
        if (!pair.connectSecondaryDevice(secondaryDeviceSocket, sSecondaryDevicePublicKey, device)) false;

        // 6. store
        pair.setConnectionType(PairManager.prototype.CONNECTIONTYPE_QR);

        // 7. update
        secondaryDeviceSocket.emit(ConnectorEvents.prototype.UPDATE_SECONDARYDEVICE_CONNECTED_BY_QR, pair.getSecondaryDeviceID(), pair.getPrimaryDevicePublicKey(), pair.getDirection());




        // 1. OTHERDEVICE_CONNECTED




        // 8. send
        if (pair.hasPrimaryDevice()) pair.getPrimaryDevice().emit(ConnectorEvents.prototype.UPDATE_OTHERDEVICE_CONNECTED, pair.getSecondaryDevicePublicKey());

        // 9. output
        this._logUsers('Primary device with socket.id = ' + secondaryDeviceSocket.id + ' requests connection to token = ' + token.getValue());
    },

    /**
     * Connect secondary device to pair
     * @param sConnectionType
     * @param pair
     * @param secondaryDeviceSocket
     * @param sSecondaryDevicePublicKey
     * @param sToken
     * @param bReconnect
     * @private
     */
    _connectSecondaryDeviceToPair: function(sConnectionType, pair, secondaryDeviceSocket, sSecondaryDevicePublicKey, sToken, bReconnect)
    {
        // 1. store
        //this._aDevicesBySocketID['' + secondaryDeviceSocket.id].sToken = sToken;
        this._aDevicesByDeviceID['' + secondaryDeviceSocket.id] = this._aDevicesBySocketID['' + secondaryDeviceSocket.id];

        // 2. store
        pair.secondaryDevicePublicKey = sSecondaryDevicePublicKey;
        pair.connectiontype = sConnectionType;


        // --- communicate


        // 3. select
        switch(sConnectionType)
        {
            // case this.CONNECTIONTYPE_QR:
            //
            //     // // a. store
            //     // this._aActivePairs[sToken].secondaryDevice = secondaryDeviceSocket;
            //     //
            //     // // b. send
            //     // secondaryDeviceSocket.emit('token_connected', pair.primaryDevicePublicKey, pair.direction);
            //     //
            //     // // c. finish
            //     // this._finishConnection(sConnectionType, pair, sToken, bReconnect);
            //     break;

            case this.CONNECTIONTYPE_MANUAL:

                // a. validate
                if (this._aActivePairs[sToken].unconfirmedSecondaryDevice)
                {
                    // I. send
                    this._broadcastSecurityWarning(secondaryDeviceSocket, pair, sToken);
                    return;
                }

                // b. store
                this._aActivePairs[sToken].unconfirmedSecondaryDevice = secondaryDeviceSocket;

                // c. validate and send
                if (pair.primaryDevice)
                {
                    // I. send
                    pair.unconfirmedSecondaryDevice.emit(ManualConnectEvents.prototype.MANUALCODE_ACCEPTED);
                }
                break;
        }
    },








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

        // 1. send
        if (pair.primaryDevice) pair.primaryDevice.emit((bReconnect) ? 'secondarydevice_reconnected' : 'secondarydevice_connected', pair.secondaryDevicePublicKey);

        // 3. store
        if (!this._aConnectedPairs[sToken]) this._aConnectedPairs[sToken] = true;


        // --- log ---


        // 4. output
        this._logUsers('Secondary device ' + ((bReconnect) ? 're' : '' ) + ' connects `' + sConnectionType + '` (socket.id = ' + pair.secondaryDevice.id + ')');

    },



    _onData: function(socket, encryptedData)
    {
        // 1. output
        this.Mimoto.logger.log('Socket.id = ' + socket.id + ' has shared data');

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

    /**
     * Handle `REQUEST_TOGGLE_DIRECTION`
     * @param socket
     * @private
     */
    _onRequestToggleDirection: function(socket)
    {
        // 1. load
        let pair = this.Mimoto.pairManager.getPairBySocketID(socket.id);

        // 2. validate
        if (pair === false) return;

        // 3. toggle
        pair.toggleDirection();

        // 4. send
        if (pair.hasPrimaryDevice()) pair.getPrimaryDevice().emit(ConnectorEvents.prototype.UPDATE_TOGGLE_DIRECTION, pair.getDirection());
        if (pair.hasSecondaryDevice()) pair.getSecondaryDevice().emit(ConnectorEvents.prototype.UPDATE_TOGGLE_DIRECTION, pair.getDirection());
    },

    /**
     * Handle request event 'REQUEST_MANUALCODE'
     * @param primaryDeviceSocket
     * @private
     */
    _onRequestManualCode: function(primaryDeviceSocket)
    {
        // 1. output
        this.Mimoto.logger.log('Socket.id = ' + primaryDeviceSocket.id + ' has requested manual code');

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


    _logUsers: function(sTitle)
    {
        // 1. compose
        let sOutput = '' + '\n' +
            sTitle + '\n' +
            '=========================' + '\n' +
            'Number of sockets:' + this.Mimoto.deviceManager.getNumberOfDevices() + '\n' +
            'Number of pairs:' + this.Mimoto.pairManager.getNumberOfActivePairs() + '\n' +
            'Number of idle pairs:' + this.Mimoto.pairManager.getNumberOfIdlePairs() + '\n' +
            //'---' + '\n' +
            //'Number of pairs that established connection between both devices:' + Object.keys(this._aConnectedPairs).length + '\n' +
            //'Number of pairs that have been used to send data:' + Object.keys(this._aUsedPairs).length +
            '\n';

        // 2. output to file
        this.Mimoto.logger.logToFile(sOutput);

        // 3. output to console
        this.Mimoto.logger.log(sOutput);


        // 3. output
        this.Mimoto.logger.log('');
        this.Mimoto.logger.log(sTitle);
        this.Mimoto.logger.log('Devices by socket ID');
        this.Mimoto.logger.log('=========================');
        this.Mimoto.logger.log(this.Mimoto.deviceManager.getAllDevicesBySocketID());



        this.Mimoto.logger.log('Devices by device ID');
        this.Mimoto.logger.log('=========================');
        this.Mimoto.logger.log(this.Mimoto.deviceManager.getAllDevicesByDeviceID());
        this.Mimoto.logger.log('Offline devices');
        this.Mimoto.logger.log('=========================');
        this.Mimoto.logger.log(this.Mimoto.deviceManager.getAllOfflineDevices());
        this.Mimoto.logger.log('=========================');
        this.Mimoto.logger.log('Pairs');
        this.Mimoto.logger.log('-------------------------');
        this.Mimoto.logger.log(this.Mimoto.pairManager.getActivePairs());
        this.Mimoto.logger.log('');
        // this.Mimoto.logger.log('Idle pairs');
        // this.Mimoto.logger.log('-------------------------');
        // this.Mimoto.logger.log(this._aInactivePairs);
        //this.Mimoto.logger.log(CoreModule_Util.inspect(this._aInactivePairs, false, null, true));
        this.Mimoto.logger.log('');
        this.Mimoto.logger.log('');
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
