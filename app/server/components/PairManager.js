/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';


// import project classes
const Device = require('./Device');
const Pair = require('./Pair');
const TokenManager = require('./TokenManager');
const ConnectorEvents = require('./../../client/components/Connector/ConnectorEvents');

// import extenders
const EventDispatcherExtender = require('./../../common/extenders/EventDispatcherExtender');

// import utils
const Module_Crypto = require('asymmetric-crypto');
const Module_GenerateUniqueID = require('generate-unique-id');



module.exports = function(mongoDB, logger)
{
    // start
    this.__construct(mongoDB, logger);
};

module.exports.prototype = {

    // data
    _aDevicesBySocketID: [],
    _aDevicesByDeviceID: [],
    _aActivePairs: [],
    _aInactivePairs: [],

    // managers
    _tokenManager: null,
    _mongoDB: null,
    _logger: null,

    // events
    DATA_READY_FOR_TRANSFER: 'data_ready_for_transfer',



    // ---


    // utils
    _timerLog: null,
    _timerManualCodes: null,

    // data

    _aManualCodes: [],

    // logs
    _aConnectedPairs: [],       // which pairs actually had two devices connected at one point
    _aUsedPairs: [],            // which pairs where actually used to share data

    // connection types
    CONNECTIONTYPE_QR: 'qr',
    CONNECTIONTYPE_MANUAL: 'manual',



    // ----------------------------------------------------------------------------
    // --- Constructor ------------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Constructor
     */
    __construct: function(mongoDB, logger)
    {
        // 1. extend
        new EventDispatcherExtender(this);

        // 2. store
        this._mongoDB = mongoDB;
        this._logger = logger;


        // ---


        // 3. init
        this._tokenManager = new TokenManager();

        // 4. configure
        this._tokenManager.addEventListener(TokenManager.TOKEN_EXPIRED, this._tokenExpired.bind(this));
    },



    // ----------------------------------------------------------------------------
    // --- Public methods ---------------------------------------------------------
    // ----------------------------------------------------------------------------


    registerSocket: function(socket)
    {
        // 1. store
        this._aDevicesBySocketID['' + socket.id] = new Device(socket);

        // 2. configure - primary device - connection events
        socket.on(ConnectorEvents.prototype.PRIMARYDEVICE_CONNECT, this._onPrimaryDeviceConnect.bind(this, socket));
        socket.on(ConnectorEvents.prototype.PRIMARYDEVICE_REQUEST_TOKEN_REFRESH, this._onPrimaryDeviceRequestFreshToken.bind(this, socket));
        socket.on(ConnectorEvents.prototype.PRIMARYDEVICE_RECONNECT, this._onPrimaryDeviceReconnect.bind(this, socket));

        // 3. configure - secondary device - connection events
        socket.on(ConnectorEvents.prototype.SECONDARYDEVICE_CONNECT, this._onSecondaryDeviceConnect.bind(this, socket, false));

        // #todo - is this used?
        //socket.on(ConnectorEvents.prototype.SECONDARYDEVICE_RECONNECT, this._onSecondaryDeviceConnectToToken.bind(this, socket, true));

        // 4. configure - data events
        //socket.on('data', this._onData.bind(this, socket));

        // 5. configure - setting events
        //socket.on(ToggleDirectionEvents.prototype.REQUEST_TOGGLE_DIRECTION, this._onRequestToggleDirection.bind(this, socket));

        // 6. configure - handshake events
        //socket.on(ManualConnectEvents.prototype.REQUEST_MANUALCODE, this._onRequestManualCode.bind(this, socket));
        //socket.on(ManualConnectEvents.prototype.REQUEST_CONNECTION_BY_MANUALCODE, this._onRequestConnectionByManualCode.bind(this, socket));
        //socket.on(ManualConnectEvents.prototype.REQUEST_MANUALCODE_HANDSHAKE, this._onRequestManualCodeHandshake.bind(this, socket));
        //socket.on(ManualConnectEvents.prototype.CONFIRM_MANUALCODE, this._onConfirmManualCode.bind(this, socket));


        // 3. log
        this._logUsers('Socket connected (socket.id = ' + socket.id + ')');
    },

    unregisterSocket: function(socket)
    {
        // 1. clear configuration
        socket.removeAllListeners();

        // 2. load
        let device = this._aDevicesBySocketID['' + socket.id];

        // 3. cleanup
        delete this._aDevicesBySocketID['' + socket.id];
        delete this._aDevicesByDeviceID['' + device.getDeviceID()];

        // 4. register
        let sPairID = device.getPairID();

        // 5. validate
        if (!sPairID) return;

        // 6. register
        let pair = this._aActivePairs['' + device.getPairID()];

        // 7. validate
        if (pair === false) return;



        return;


        // 9. validate
        if (pair.primaryDevice && pair.primaryDevice.id === socket.id)
        {
            // a. cleanup
            pair.primaryDevice = null;

            // b. send
            if (pair.secondaryDevice) pair.secondaryDevice.emit('primarydevice_disconnected');

            // c. log
            this._dbCollection_pairs.updateMany(
                {
                    "data.token": sToken
                },
                {
                    $push: { logs: { action: this._ACTIONTYPE_PRIMARYDEVICE_DISCONNECTED, timestamp: new Date().toUTCString() } }
                },
                function(err, result)
                {
                    CoreModule_Assert.equal(err, null);
                }
            );
        }

        // 10. validate
        if (pair.secondaryDevice && pair.secondaryDevice.id === socket.id)
        {
            // a. cleanup
            pair.secondaryDevice = null;

            // b. send
            if (pair.primaryDevice) pair.primaryDevice.emit('secondarydevice_disconnected');

            // c. log
            this._dbCollection_pairs.updateMany(
                {
                    "data.token": sToken
                },
                {
                    $push: { logs: { action: this._ACTIONTYPE_SECONDARYDEVICE_DISCONNECTED, timestamp: new Date().toUTCString() } }
                },
                function(err, result)
                {
                    CoreModule_Assert.equal(err, null);
                }
            );
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

            // d. log
            this._dbCollection_pairs.updateMany(
                {
                    "data.token": sToken
                },
                {
                    $set: { "states.archived" : true },
                    $push: { logs: { action: this._ACTIONTYPE_ARCHIVED, timestamp: new Date().toUTCString() } }
                },
                function(err, result)
                {
                    CoreModule_Assert.equal(err, null);
                }
            );
        }


        // --- log ---


        // 12. output
        this._logUsers('User disconnected (socket.id = ' + socket.id + ')');
    },



    // ----------------------------------------------------------------------------
    // --- Event handlers - Pairing -----------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Handle primary device `PRIMARYDEVICE_CONNECT`
     * @param primaryDeviceSocket
     * @param sPrimaryDevicePublicKey
     * @private
     */
    _onPrimaryDeviceConnect: function(primaryDeviceSocket, sPrimaryDevicePublicKey)
    {
        // 1. init
        let pair = new Pair(primaryDeviceSocket, sPrimaryDevicePublicKey);

        // 2. store
        this._aActivePairs['' + pair.getId()] = pair;

        // 3. update
        this._aDevicesBySocketID['' + primaryDeviceSocket.id].setPairID(pair.getId());

        // 4. copy
        this._aDevicesByDeviceID['' + pair.getPrimaryDeviceID()] = this._aDevicesBySocketID['' + primaryDeviceSocket.id];


        // ---


        // 5. create
        let token = this._tokenManager.createToken(pair);

        // 6. store
        if (this._mongoDB.isRunning()) this._mongoDB.getCollection('pairs').insertOne(pair.getDataForMongo());

        // 7. send
        pair.getPrimaryDevice().emit(ConnectorEvents.prototype.PRIMARYDEVICE_CONNECTED, pair.getPrimaryDeviceID(), token.getValue(), token.getLifetime());

        // 8. output
        this._logger.logToFile('Primary Device with socket.id = ' + primaryDeviceSocket.id + ' requests token = ' + token.getValue());


        // ---


        // 9. output
        this._logUsers('Primary Device with socket.id = ' + primaryDeviceSocket.id + ' requests token = ' + token.getValue());
    },


    /**
     * Handle primary device `PRIMARYDEVICE_REQUEST_TOKEN_REFRESH`
     * @param socket
     * @param sDeviceID
     * @private
     */
    _onPrimaryDeviceRequestFreshToken: function(socket, sDeviceID)
    {
        // 1. load
        let pair = this._getPairByDeviceID(sDeviceID);

        // 2. validate
        if (pair === false) return;


        // 5. refresh
        let token = this._tokenManager.createToken(pair);

        // 6. send
        pair.getPrimaryDevice().emit(ConnectorEvents.prototype.PRIMARYDEVICE_TOKEN_REFRESHED, token.getValue(), token.getLifetime());
    },



    _onPrimaryDeviceReconnect: function(primaryDeviceSocket, sDeviceId)
    {
        // 1. output
        this._log('Primary device wants to reconnect to token ' + sDeviceId);



        return;



        // 2. load
        let pair = this._getPairByToken(sToken);

        // 3. validate
        if (pair === false)
        {
            // a. output
            this._log('Token = ' + sToken + ' not found for reconnecting primary device');

            // b. send
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

        // 7. send
        primaryDeviceSocket.emit('token_reconnected');

        // 8. send
        if (pair.secondaryDevice) pair.secondaryDevice.emit('primarydevice_reconnected');

        // 9. output
        this._logUsers('Primary device reconnects to token (socket.id = ' + primaryDeviceSocket.id + ')');
    },


    /**
     * Handle secodary device `SECONDARYDEVICE_CONNECT`
     * @param secondaryDeviceSocket
     * @param bReconnect
     * @param sToken
     * @param sSecondaryDevicePublicKey
     * @private
     */
    _onSecondaryDeviceConnect: function(secondaryDeviceSocket, bReconnect, sToken, sSecondaryDevicePublicKey)
    {
        console.log('Secondary Device - CONNECT');

        // 1. is reconnect nog relevant?
        // 2. ook registreren in _aDevicesByDeviceID


        // 1. output
        this._logger.log('Secondary device wants to connect to token ' + sToken);

        // 2. load
        let pair = this._getPairByToken(sToken);

        // 3. validate
        if (pair === false)
        {
            // a. send
            secondaryDeviceSocket.emit(ConnectorEvents.prototype.SECONDARYDEVICE_CONNECT_TOKEN_NOT_FOUND);

            // b. exit
            return;
        }

        // 4. validate
        if (!pair.connectSecondaryDevice(secondaryDeviceSocket, sSecondaryDevicePublicKey))
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
            case this.CONNECTIONTYPE_QR:

                // a. store
                this._aActivePairs[sToken].secondaryDevice = secondaryDeviceSocket;

                // b. send
                secondaryDeviceSocket.emit('token_connected', pair.primaryDevicePublicKey, pair.direction);

                // c. finish
                this._finishConnection(sConnectionType, pair, sToken, bReconnect);
                break;

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


    _tokenExpired: function(sToken)
    {
        console.log('Token expired', sToken);
    },

    /**
     * Get pair by Device ID
     * @param sDeviceID
     * @returns {boolean}
     * @private
     */
    _getPairByDeviceID: function(sDeviceID)
    {
        // 1. load
        let device = this._aDevicesByDeviceID['' + sDeviceID];

        // 2. verify
        if (!device) return false;

        // 3. get pair by device id
        let pair = this._aActivePairs['' + device.getPairID()];

        // 4. verify
        if (!pair) return false;

        // 5. send
        return pair;
    },

    /**
     * Get pair by token
     * @param sToken
     * @returns {boolean|*}
     * @private
     */
    _getPairByToken: function(sToken)
    {
        // 1. load
        let token = this._tokenManager.getToken(sToken);

        // 2. verify
        if (token === false) return false;

        // 3. load
        let pair = token.getPair();

        // 4. verify
        if (!pair) return false;

        // 5. send
        return pair;
    },

    _broadcastSecurityWarning: function(requestingSocket, pair, sToken)
    {
        // 1. broadcast breach to current user
        requestingSocket.emit('security_compromised');

        // 2. cleanup
        delete this._aDevicesBySocketID['' + requestingSocket.id];

        // 3. verify
        if (pair.getPrimaryDevice())
        {
            // a. send
            pair.getPrimaryDevice().emit('security_compromised');

            // b. cleanup
            delete this._aDevicesBySocketID['' + pair.primaryDevice.id];
            delete this._aDevicesByDeviceID['' + pair.getPrimaryDeviceID()];
        }

        // 4. verify
        if (pair.getSecondaryDevice())
        {
            // a. send
            pair.getSecondaryDevice().emit('security_compromised');

            // b. cleanup
            delete this._aDevicesBySocketID['' + pair.secondaryDevice.id];
            delete this._aDevicesByDeviceID['' + pair.getSecondaryDeviceID()];
        }

        // 5. clear
        delete this._aActivePairs['' + sToken];
    },


    _logUsers: function(sTitle)
    {
        // 1. compose
        let sOutput = '' + '\n' +
            sTitle + '\n' +
            '=========================' + '\n' +
            'Number of sockets:' + Object.keys(this._aDevicesBySocketID).length + '\n' +
            'Number of active pairs:' + Object.keys(this._aActivePairs).length + '\n' +
            'Number of inactive pairs:' + Object.keys(this._aInactivePairs).length + '\n' +
            '---' + '\n' +
            'Number of pairs that established connection between both devices:' + Object.keys(this._aConnectedPairs).length + '\n' +
            'Number of pairs that have been used to send data:' + Object.keys(this._aUsedPairs).length + '\n';

        // 2. output
        this._logger.logToFile(sOutput);

        // 3. output
        this._logger.log('');
        this._logger.log('Users: ' + sTitle);
        this._logger.log('Sockets');
        this._logger.log('=========================');
        this._logger.log(this._aDevicesBySocketID);
        this._logger.log('');
        this._logger.log('Active pairs');
        this._logger.log('-------------------------');
        this._logger.log(this._aActivePairs);
        this._logger.log('');
        this._logger.log('Inactive pairs');
        this._logger.log('-------------------------');
        this._logger.log(this._aInactivePairs);
        //this._logger.log(CoreModule_Util.inspect(this._aInactivePairs, false, null, true));
        this._logger.log('');
        this._logger.log('');
    }

};
