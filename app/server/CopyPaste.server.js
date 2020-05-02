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
const Module_LogToFile = require('log-to-file');

// import core module
const CoreModule_Assert = require('assert');
const CoreModule_Util = require('util');

// import project classes
const Device = require('./components/Device');
const DeviceManager = require('./components/DeviceManager');
const Pair = require('./components/Pair');
const PairManager = require('./components/PairManager');
const Token = require('./components/Token');
const TokenManager = require('./components/TokenManager');
const MongoDB = require('./components/MongoDB');
const Logger = require('./components/Logger');
const StartupInfo = require('./components/StartupInfo');
const Utils = require('./utils/Utils');
const ToggleDirectionStates = require('./../client/components/ToggleDirectionButton/ToggleDirectionStates');
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
            // // a. init
            this._app = Module_Express();

            // b. setup
            this._server = new Module_HTTP.createServer(this._app);//, { pingTimeout: 5000, allowUpgrades: false, upgradeTimeout: 20000});
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
        this.Mimoto.logger = new Logger((this._configFile.logtofile.file) ? this._configFile.logtofile.file.toString() : '', this._config.mode === this.DEVELOPMENT);

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
        socket.on(ConnectorEvents.prototype.REQUEST_SECONDARYDEVICE_CONNECT_BY_QR, this._onRequestSecondaryDeviceConnectByQR.bind(this, socket));

        // 5. configure both devices
        socket.on(ConnectorEvents.prototype.REQUEST_DEVICE_RECONNECT, this._onRequestDeviceReconnect.bind(this, socket));
        socket.on(ConnectorEvents.prototype.SEND_DATA, this._onSendData.bind(this, socket));
        socket.on(ConnectorEvents.prototype.DATA_RECEIVED, this._onReceiverDataReceived.bind(this, socket));

        // 6. configure - setting events
        socket.on(ConnectorEvents.prototype.REQUEST_TOGGLE_DIRECTION, this._onRequestToggleDirection.bind(this, socket));

        // 7. configure - handshake events
        socket.on(ConnectorEvents.prototype.REQUEST_PRIMARYDEVICE_MANUALCODE, this._onRequestPrimaryDeviceManualCode.bind(this, socket));
        socket.on(ConnectorEvents.prototype.REQUEST_SECONDARYDEVICE_CONNECT_BY_MANUALCODE, this._onRequestSecondaryDeviceConnectByManualCode.bind(this, socket));
        socket.on(ConnectorEvents.prototype.REQUEST_SECONDARYDEVICE_MANUALCODE_HANDSHAKE, this._onRequestSecondaryDeviceManualCodeHandshake.bind(this, socket));
        socket.on(ConnectorEvents.prototype.REQUEST_PRIMARYDEVICE_MANUALCODE_CONFIRMED, this._onRequestPrimaryDeviceManualCodeConfirmed.bind(this, socket));

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
        let token = this._tokenManager.createToken(pair, Token.prototype.TYPE_QR);

        // 3. send
        pair.getPrimaryDevice().emit(ConnectorEvents.prototype.UPDATE_PRIMARYDEVICE_CONNECTED, pair.getPrimaryDeviceID(), token.getValue(), token.getLifetime());

        // 4. output
        this._logUsers('Primary Device with socket.id = ' + primaryDeviceSocket.id, 'Requests token = ' + token.getValue());
    },

    /**
     * Handle device `REQUEST_DEVICE_RECONNECT`
     * @param socket
     * @param sDeviceID
     * @param sPreviousSocketID - OFFLINE_RESCUE_#1 - this parameter is only passed when the server lost track of a device that didn't manage to properly disconnect and unregister (for instance because the internet got cut off and the device wasn't able to communicate it's change in presence (all related parts of this solution are marked in the comments by OFFLINE_RESCUE_#1)
     * @private
     */
    _onRequestDeviceReconnect: function(socket, sDeviceID, sPreviousSocketID)
    {
        this.Mimoto.logger.log('ALERT - Trying to reconnect to sDeviceID = ' + sDeviceID);


        // 1. verify - OFFLINE_RESCUE_#1 - this parameter is only passed when the server lost track of a device that didn't manage to properly disconnect and unregister (for instance because the internet got cut off and the device wasn't able to communicate it's change in presence
        if (sPreviousSocketID)
        {
            // a. check if the device exists that might not have managed to log off officially
            let undisconnectedDevice = this.Mimoto.deviceManager.getDeviceByDeviceID(sDeviceID);

            // b. validate
            if (undisconnectedDevice && undisconnectedDevice.getSocketID() === sPreviousSocketID)
            {
                this.Mimoto.logger.log('ALERT - The device DOES EXIST and seems to be the one we lost due to bad disconnect sDeviceID = ' + sDeviceID);

                // I. force disconnect and set the state of the device to offline
                this.Mimoto.deviceManager.unregisterSocket(undisconnectedDevice.getSocket())



                // lock / unlock




            }
        }

        // 2. load
        let newDevice = this.Mimoto.deviceManager.getDeviceBySocketID(socket.id);
        let originalDevice = this.Mimoto.deviceManager.getOfflineDeviceByDeviceID(sDeviceID);

        // 3. validate
        if (!newDevice || !originalDevice)
        {
            // a. output
            this.Mimoto.logger.log('ALERT - No original device after server restart or device offline - sDeviceID = ' + sDeviceID + '\n\n');


            // b. OFFLINE_RESCUE_#1 - check if the device has gone offline earlier, but hasn't managed to log off officially
            let undisconnectedDevice = this.Mimoto.deviceManager.getDeviceByDeviceID(sDeviceID);

            // c. OFFLINE_RESCUE_#1 - verify
            let bMightHaveBeenUnableToLogOffEarlier = (undisconnectedDevice && !sPreviousSocketID) ? true : false;

            // d. send
            socket.emit(ConnectorEvents.prototype.ERROR_DEVICE_RECONNECT_DEVICEID_NOT_FOUND, bMightHaveBeenUnableToLogOffEarlier);

            // e. exit
            return;
        }

        // 4. restore and merge
        let device = this.Mimoto.deviceManager.restoreAndMerge(originalDevice, newDevice);

        // 5. load
        let pair = this.Mimoto.pairManager.getPairByDeviceID(sDeviceID);

        // 6. validate
        if (pair === false)
        {
            // a. output
            this.Mimoto.logger.log('No pair connected to sDeviceID = ' + sDeviceID);

            // b. send
            socket.emit(ConnectorEvents.prototype.ERROR_DEVICE_RECONNECT_DEVICEID_NOT_FOUND);

            // c. exit
            return;
        }

        // 7. init
        let bOtherDeviceConnected = false;

        // 8. select
        switch(device.getType())
        {
            case Device.prototype.PRIMARYDEVICE:

                // a. store
                if (!pair.reconnectPrimaryDevice(device)) return;

                // b. verify
                if (pair.hasSecondaryDevice())
                {
                    // I. toggle
                    bOtherDeviceConnected = true;

                    // II. notify
                    pair.getSecondaryDevice().emit(ConnectorEvents.prototype.UPDATE_OTHERDEVICE_RECONNECTED);
                }

                break;

            case Device.prototype.SECONDARYDEVICE:

                // a. store
                if (!pair.reconnectSecondaryDevice(device)) return;

                // b. verify
                if (pair.hasPrimaryDevice())
                {
                    // I. toggle
                    bOtherDeviceConnected = true;

                    // II. notify
                    pair.getPrimaryDevice().emit(ConnectorEvents.prototype.UPDATE_OTHERDEVICE_RECONNECTED);
                }

                break;

            default:

                return;
        }

        // 9. notify
        socket.emit(ConnectorEvents.prototype.UPDATE_DEVICE_RECONNECTED, bOtherDeviceConnected ,pair.getDirection());


        // ---


        // 10. output
        this._logUsers('Device `' + device.getType() + '` with sDeviceID = `' + sDeviceID + '`', 'Reconnected to pair (socket.id = ' + socket.id + ')');
    },



    /**
     * Handle primary device `REQUEST_PRIMARYDEVICE_FRESH_TOKEN`
     * @param socket
     * @private
     */
    _onRequestPrimaryDeviceFreshToken: function(socket)
    {
        // 1. load
        let pair = this.Mimoto.pairManager.getPairBySocketID(socket.id);

        // 2. validate
        if (pair === false) return;

        // 3. refresh
        let token = this._tokenManager.createToken(pair, Token.prototype.TYPE_QR);

        // 4. send
        pair.getPrimaryDevice().emit(ConnectorEvents.prototype.UPDATE_PRIMARYDEVICE_FRESH_TOKEN, token.getValue(), token.getLifetime());
    },



    // ----------------------------------------------------------------------------
    // --- Event handlers - Pairing - Secondary device ----------------------------
    // ----------------------------------------------------------------------------


    /**
     * Handle secondary device `REQUEST_SECONDARYDEVICE_CONNECT_BY_QR`
     * @param socket
     * @param sTokenValue
     * @param sPublicKey
     * @private
     */
    _onRequestSecondaryDeviceConnectByQR: function(socket, sPublicKey, sTokenValue)
    {
        // 1. load
        let device = this.Mimoto.deviceManager.getDeviceBySocketID(socket.id);

        // 2. load
        let token = this._tokenManager.getToken(sTokenValue);

        // 3. validate or send error
        if (token === false)
        {
            this.Mimoto.logger.log('SECONDARYDEVICE_CONNECT_TOKEN_NOT_FOUND for sTokenValue=`' + sTokenValue + '` from socket.id=`' + socket.id + '`');

            // a. broadcast
            socket.emit(ConnectorEvents.prototype.ERROR_SECONDARYDEVICE_CONNECT_BY_QR_TOKEN_NOT_FOUND);

            // b. exit
            return;
        }

        // 4. load
        let pair = token.getPair();

        // 5. validate
        if (!pair.connectSecondaryDevice(socket, sPublicKey, device, token.getType())) return false;

        // 6. update
        socket.emit(ConnectorEvents.prototype.UPDATE_SECONDARYDEVICE_CONNECTED_BY_QR, pair.getSecondaryDeviceID(), pair.getPrimaryDevicePublicKey(), pair.getDirection());

        // 7. send
        if (pair.hasPrimaryDevice()) pair.getPrimaryDevice().emit(ConnectorEvents.prototype.UPDATE_OTHERDEVICE_CONNECTED, pair.getSecondaryDevicePublicKey());

        // 8. output
        this._logUsers('Secondary device with socket.id = ' + socket.id, 'Requests connection to token = ' + token.getValue());
    },



    // ----------------------------------------------------------------------------
    // --- Private functions - Manual code ----------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Handle 'REQUEST_PRIMARYDEVICE_MANUALCODE'
     * @param socket
     * @private
     */
    _onRequestPrimaryDeviceManualCode: function(socket)
    {
        // 1. load
        let pair = this.Mimoto.pairManager.getPairBySocketID(socket.id);

        // 2. validate
        if (pair === false) return;

        // 3. refresh
        let token = this._tokenManager.createToken(pair, Token.prototype.TYPE_MANUALCODE);

        // 4. send
        socket.emit(ConnectorEvents.prototype.UPDATE_PRIMARYDEVICE_MANUALCODE, token.getValue(), token.getLifetime());


        // ---


        // 5. output
        this.Mimoto.logger.log('Socket.id = ' + socket.id + ' has requested manual code');
    },

    /**
     * Handle event 'REQUEST_SECONDARYDEVICE_CONNECT_BY_MANUALCODE'
     * @param socket
     * @param sPublicKey
     * @param sManualCode
     * @private
     */
    _onRequestSecondaryDeviceConnectByManualCode: function(socket, sPublicKey, sManualCode)
    {
        // 1. load
        let device = this.Mimoto.deviceManager.getDeviceBySocketID(socket.id);

        // 2. load
        let token = this._tokenManager.getToken(sManualCode);

        // 3. validate or send error
        if (token === false)
        {
            this.Mimoto.logger.log('ERROR_SECONDARYDEVICE_CONNECT_BY_MANUALCODE_TOKEN_NOT_FOUND for sManualCode=`' + sManualCode + '` from socket.id=`' + socket.id + '`');

            // a. broadcast
            socket.emit(ConnectorEvents.prototype.ERROR_SECONDARYDEVICE_CONNECT_BY_MANUALCODE_TOKEN_NOT_FOUND);

            // b. exit
            return;
        }

        // 4. load
        let pair = token.getPair();

        // 5. validate
        pair.registerUnconfirmedSecondaryDevice(socket, sPublicKey, device, token.getType());

        // 6. update
        socket.emit(ConnectorEvents.prototype.UPDATE_SECONDARYDEVICE_MANUALCODE_ACCEPTED, pair.getSecondaryDeviceID(), pair.getPrimaryDevicePublicKey(), pair.getDirection());


        // ---


        // 7. output
        this._logUsers('Secondary device with socket.id = ' + socket.id, 'Requests connection to manual code = ' + token.getValue());
    },

    /**
     * Handle `REQUEST_SECONDARYDEVICE_MANUALCODE_HANDSHAKE`
     * @param socket
     * @param sConfirmationCode
     * @private
     */
    _onRequestSecondaryDeviceManualCodeHandshake: function(socket, sConfirmationCode)
    {
        // 1. load
        let pair = this.Mimoto.pairManager.getPairBySocketID(socket.id);

        // 2. validate
        if (pair === false) return;

        // 3. send
        if (pair.hasPrimaryDevice()) pair.getPrimaryDevice().emit(ConnectorEvents.prototype.REQUEST_PRIMARYDEVICE_MANUALCODE_CONFIRMATION, sConfirmationCode);
    },

    /**
     * Handle manualcode event `REQUEST_PRIMARYDEVICE_MANUALCODE_CONFIRMED`
     * @private
     */
    _onRequestPrimaryDeviceManualCodeConfirmed: function(socket)
    {
        // 1. load
        let pair = this.Mimoto.pairManager.getPairBySocketID(socket.id);

        // 2. validate
        if (pair === false) return;

        // 3. transfer and validate
        if (!pair.confirmUnconfirmedSecondaryDevice())
        {
            // a. notify
            socket.emit(ConnectorEvents.prototype.ERROR_PRIMARYDEVICE_CONNECT_BY_MANUALCODE_SECONDARYDEVICE_NOT_FOUND);

            // b. output
            this._logUsers('Secondary device NOt connected by manual code because it`s not there anymore');

            // c. exit
            return;
        }

        // 4. send
        if (pair.hasSecondaryDevice()) pair.getSecondaryDevice().emit(ConnectorEvents.prototype.UPDATE_SECONDARYDEVICE_CONNECTED_BY_MANUALCODE, pair.getSecondaryDeviceID(), pair.getPrimaryDevicePublicKey(), pair.getDirection());

        // 5. send
        if (pair.hasPrimaryDevice()) pair.getPrimaryDevice().emit(ConnectorEvents.prototype.UPDATE_OTHERDEVICE_CONNECTED, pair.getSecondaryDevicePublicKey());


        // --- log ---


        // 6. output
        this._logUsers('Secondary device connected by manual code (socket.id = ' + pair.getSecondaryDevice().id + ')');
    },



    // ----------------------------------------------------------------------------
    // --- Private functions - Settings -------------------------------------------
    // ----------------------------------------------------------------------------


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



    // ----------------------------------------------------------------------------
    // --- Private functions - Data -----------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Handle device `SEND_DATA`
     * @param socket
     * @param encryptedData
     * @private
     */
    _onSendData: function(socket, encryptedData)
    {
        // 1. load
        let pair = this.Mimoto.pairManager.getPairBySocketID(socket.id);

        // 2. validate
        if (pair === false) return;

        // 3. forward
        pair.sendData(encryptedData);
    },

    /**
     * Handle receiver `DATA_RECEIVED`
     * @param socket
     * @param data
     * @private
     */
    _onReceiverDataReceived: function(socket, data)
    {
        // 1. load
        let pair = this.Mimoto.pairManager.getPairBySocketID(socket.id);

        // 2. validate
        if (pair === false) return;

        // 3. forward
        if (pair.hasOtherDevice(socket)) pair.getOtherDevice(socket).emit(ConnectorEvents.prototype.DATA_RECEIVED, data);

    },



    // ----------------------------------------------------------------------------
    // --- Private functions - Logging --------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Log users (for debugging purposes only)
     * @private
     */
    _logUsers: function()
    {
        // 1. output action
        this.Mimoto.logger.log('');
        this.Mimoto.logger.log('========================================================================');
        for (let nActionIndex = 0; nActionIndex < arguments.length; nActionIndex++)
        {
            this.Mimoto.logger.log('=== ' + arguments[nActionIndex]);
        }
        this.Mimoto.logger.log('===');
        this.Mimoto.logger.log('=== ' + Utils.prototype.buildDate());
        this.Mimoto.logger.log('========================================================================');

        this.Mimoto.logger.log('');

        // 2. output active devices
        let aDevices = this.Mimoto.deviceManager.getAllDevicesByDeviceID();
        this.Mimoto.logger.log('Devices (count = ' + this.Mimoto.deviceManager.getNumberOfDevices() + ')');
        this.Mimoto.logger.log('------------------------------------------');
        for (let sKey in aDevices)
        {
            this.Mimoto.logger.log('device = ', this._prepareDeviceForOutput(aDevices[sKey]));
        }
        this.Mimoto.logger.log('');

        // 3. output offline devices
        let aOfflineDevices = this.Mimoto.deviceManager.getAllOfflineDevices();
        this.Mimoto.logger.log('Offline devices (count = ' + this.Mimoto.deviceManager.getNumberOfOfflineDevices() + ')');
        this.Mimoto.logger.log('------------------------------------------');
        for (let sKey in aOfflineDevices)
        {
            this.Mimoto.logger.log('device =', this._prepareDeviceForOutput(aOfflineDevices[sKey].device), 'Expires at ' + Utils.prototype.buildDate(aOfflineDevices[sKey].nExpires));
            this.Mimoto.logger.log('');
        }
        this.Mimoto.logger.log('');

        // 4. output pairs
        let aPairs = this.Mimoto.pairManager.getActivePairs();
        this.Mimoto.logger.log('Pairs (count = ' + this.Mimoto.pairManager.getNumberOfActivePairs() + ')');
        this.Mimoto.logger.log('------------------------------------------');
        for (let sKey in aPairs)
        {
            this.Mimoto.logger.log('pair =', this._preparePairForOutput(aPairs[sKey]), 'State =  ' + ((aPairs[sKey].isActive()) ? 'active' : 'idle'), (!aPairs[sKey].isActive()) ? 'Expires at ' + Utils.prototype.buildDate(aPairs[sKey].getExpiryDate()) : '');
            this.Mimoto.logger.log('');
        }
        this.Mimoto.logger.log('\n\n');
    },

    _prepareDeviceForOutput: function(device)
    {
        return {
            id: device.getID(),
            socketId: device.getSocketID(),
            pairId: device.getPairID(),
            type: device.getType()
        };
    },

    _preparePairForOutput: function(pair)
    {
        return {
            id: pair.getID(),
            primaryDeviceId: pair.getPrimaryDeviceID(),
            secondaryDeviceId: pair.getSecondaryDeviceID()
        };
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
