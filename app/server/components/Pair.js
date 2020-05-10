/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';


// import project classes
const Device = require('./Device');
const Pair = require('./Pair');
const Token = require('./Token');
const Utils = require('./../utils/Utils');
const ConnectorEvents = require('./../../client/components/Connector/ConnectorEvents');
const ToggleDirectionStates = require('./../../client/components/ToggleDirectionButton/ToggleDirectionStates');
const ConnectionTypes = require('./../../client/components/Connector/ConnectionTypes');

// import extenders
const EventDispatcherExtender = require('./../../common/extenders/EventDispatcherExtender');

// import core module
const CoreModule_Assert = require('assert');

// import utils
const Module_GenerateUniqueID = require('generate-unique-id');


module.exports = function(primaryDeviceSocket, sPrimaryDevicePublicKey)
{
    // start
    this.__construct(primaryDeviceSocket, sPrimaryDevicePublicKey);
};

module.exports.prototype = {

    // settings
    _sPairID: null,
    _nCreated: 0,
    _bIsActive: true,

    // devices
    _primaryDeviceSocket: null,
    _sPrimaryDevicePublicKey: null,
    _sPrimaryDeviceID: null,

    _secondaryDeviceSocket: null,
    _sSecondaryDevicePublicKey: null,
    _sSecondaryDeviceID: null,

    // connect by manualcode
    _unconfirmedSecondaryDeviceSocket: null,

    // config
    _sDirection: '',

    // action types
    ACTIONTYPE_CREATED: 'CREATED',
    ACTIONTYPE_DISCONNECTED: 'DISCONNECTED',
    ACTIONTYPE_TERMINATED: 'TERMINDATED',
    ACTIONTYPE_TOKEN_REQUEST: 'TOKEN_REQUESTED',
    ACTIONTYPE_ARCHIVED: 'ARCHIVED',
    ACTIONTYPE_UNARCHIVED: 'UNARCHIVED',
    ACTIONTYPE_DATA: 'DATA',
    ACTIONTYPE_DATA_START: 'DATA_START',
    ACTIONTYPE_DATA_FINISH: 'DATA_FINISH',
    ACTIONTYPE_PRIMARYDEVICE_CONNECTED: 'PRIMARYDEVICE_CONNECTED',
    ACTIONTYPE_PRIMARYDEVICE_DISCONNECTED: 'PRIMARYDEVICE_DISCONNECTED',
    ACTIONTYPE_PRIMARYDEVICE_RECONNECTED: 'PRIMARYDEVICE_RECONNECTED',

    ACTIONTYPE_DEVICES_CONNECTED: 'DEVICES_CONNECTED',
    ACTIONTYPE_SECONDARYDEVICE_DISCONNECTED: 'SECONDARYDEVICE_DISCONNECTED',
    ACTIONTYPE_SECONDARYDEVICE_RECONNECTED: 'SECONDARYDEVICE_RECONNECTED',
    ACTIONTYPE_SECURITYCOMPROMISED: 'SECURITY_COMPROMISED',

    // utils
    _timerExpiration: null,

    // settings
    MAX_IDLE_TIME: 0.5 * 60 * 60 * 1000,

    // events
    ACTIVE: 'ACTIVE',
    IDLE: 'IDLE',
    EXPIRED: 'EXPIRED',

    // logs
    _aTransferTimes: [],



    // ----------------------------------------------------------------------------
    // --- Constructor ------------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Constructor
     * @param socket
     * @param sPublicKey
     * @param sDeviceID
     */
    __construct: function(socket, sPublicKey, sDeviceID)
    {
        // 1. extend
        new EventDispatcherExtender(this);

        // ---

        // 2. init
        this._sPairID = Module_GenerateUniqueID({ length: 32 });
        this._nCreated = new Date().getTime();
        this._sDirection = ToggleDirectionStates.prototype.DEFAULT;

        // 3. store
        this._primaryDeviceSocket = socket;
        this._sPrimaryDevicePublicKey = sPublicKey;
        this._sPrimaryDeviceID = sDeviceID;


        // ---


        // 4. store
        if (this.Mimoto.mongoDB.isRunning()) this.Mimoto.mongoDB.getCollection('pairs').insertOne(
            {
                id: this._sPairID,
                active: this._bIsActive,
                connected: false,
                connectionType: null,
                used: false,
                compromised: false,
                archived: false
            }
        );


        // ---


        // 5. update
        this._updateExpirationDate();
    },



    // ----------------------------------------------------------------------------
    // --- Public methods ---------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Reconnect primary device socket
     * @param device
     * @returns boolean
     */
    reconnectPrimaryDevice: function(device)
    {
        // 1. validate
        if (this.hasPrimaryDevice() || (this.getPrimaryDeviceID() && this.getPrimaryDeviceID() !== device.getID()))
        {
            // a. act
            this._handlePossibleSecurityBreach(device, 'primary');

            // b. error
            return false;
        }

        // 2. replace
        this._primaryDeviceSocket = device.getSocket();

        // 3. update
        this._updateExpirationDate();

        // 4. success
        return true;
    },

    /**
     * Connect secondary device
     * @param socket
     * @param sPublicKey
     * @param device
     * @param sConnectionType
     */
    connectSecondaryDevice: function(socket, sPublicKey, device, sConnectionType)
    {
        // 1. validate
        if (this.hasSecondaryDevice() || (this.getSecondaryDeviceID() && this.getSecondaryDeviceID() !== device.getID()))
        {
            // a. act
            this._handlePossibleSecurityBreach(device, 'secondary');

            // b. error
            return false;
        }

        // 2. store
        this._secondaryDeviceSocket = socket;
        this._sSecondaryDevicePublicKey = sPublicKey;
        this._sSecondaryDeviceID = device.getID();

        // 3. store
        device.setPairID(this.getID());
        device.setType(Device.prototype.SECONDARYDEVICE);

        // 4. update
        this._updateExpirationDate();


        // ---


        // 5. init
        let sAction = '';

        // 6. store
        if (this.Mimoto.mongoDB.isRunning()) this.Mimoto.mongoDB.getCollection('pairs').updateOne(
            {
                "id": this.getID()
            },
            {
                $set: { "connected" : true, "connectionType": sConnectionType },
                $push: { logs: { action: this.ACTIONTYPE_DEVICES_CONNECTED, timeSinceStart: Utils.prototype.since(this._nCreated) } }
            },
            function(err, result)
            {
                CoreModule_Assert.equal(err, null);
            }
        );


        // ---


        // 8. success
        return true;
    },

    /**
     * Reconnect secondary device socket
     * @param device
     * @returns boolean
     */
    reconnectSecondaryDevice: function(device)
    {
        // 1. validate
        if (this.hasSecondaryDevice() || (this.getSecondaryDeviceID() && this.getSecondaryDeviceID() !== device.getID()))
        {
            // a. act
            this._handlePossibleSecurityBreach(device, 'secondary');

            // b. error
            return false;
        }

        // 2. replace
        this._secondaryDeviceSocket = device.getSocket();

        // 3. update
        this._updateExpirationDate();

        // 4. success
        return true;
    },

    /**
     * Register unconfirmed secondary device socket (used in manualcode connection)
     * @param socket
     * @param sPublicKey
     * @param device
     */
    registerUnconfirmedSecondaryDevice: function(socket, sPublicKey, device)
    {
        // 1. store
        this._unconfirmedSecondaryDeviceSocket = socket;
        this._sSecondaryDevicePublicKey = sPublicKey;
        this._sSecondaryDeviceID = device.getID();

        // 2. setup
        device.setPairID(this.getID());
        device.setType(Device.prototype.SECONDARYDEVICE);
    },

    /**
     * Confirm unconfirmed secondary device socket (used in manualcode connection)
     */
    confirmUnconfirmedSecondaryDevice: function()
    {
        // 1. load
        let device = this.Mimoto.deviceManager.getDeviceByDeviceID(this._sSecondaryDeviceID);

        // 2. validate
        if (!device) return false;

        // 3. convert
        this.connectSecondaryDevice(this._unconfirmedSecondaryDeviceSocket, this._sSecondaryDevicePublicKey, device, ConnectionTypes.prototype.TYPE_MANUALLY);

        // 4. cleanup
        delete this._unconfirmedSecondaryDeviceSocket;

        // 5. success
        return true;
    },

    /**
     * Get pair's ID
     * @returns string
     */
    getID: function()
    {
        // 1. respond
        return this._sPairID;
    },

    /**
     * Check if pair has primary device
     * @returns {boolean}
     */
    hasPrimaryDevice: function()
    {
        // 1. verify and respond
        return (this._primaryDeviceSocket) ? true : false;
    },

    /**
     * Get primary device's socket
     * @returns object
     */
    getPrimaryDevice: function()
    {
        // 1. send
        return this._primaryDeviceSocket;
    },

    /**
     * Get primary device's ID
     * @returns string
     */
    getPrimaryDeviceID: function()
    {
        // 1. send
        return this._sPrimaryDeviceID;
    },

    /**
     * Get primary device's public key
     * @returns string
     */
    getPrimaryDevicePublicKey: function()
    {
        // 1. send
        return this._sPrimaryDevicePublicKey;
    },

    /**
     * Set primary device's ID
     * @param sValue
     */
    setPrimaryDeviceID: function(sValue)
    {
        // 1. store
        this._sPrimaryDeviceID = sValue;
    },

    /**
     * Clear primary device
     */
    clearPrimaryDevice: function()
    {
        // 1. cleanup
        delete this._primaryDeviceSocket;

        // 2. update
        this._updateExpirationDate();
    },

    /**
     * Check if pair has secondary device
     * @returns {boolean}
     */
    hasSecondaryDevice: function()
    {
        // 1. verify and respond
        return (this._secondaryDeviceSocket) ? true : false;
    },

    /**
     * Get secondary device's socket
     * @returns object
     */
    getSecondaryDevice: function()
    {
        // 1. send
        return this._secondaryDeviceSocket;
    },

    /**
     * Get secondary device's ID
     * @returns string
     */
    getSecondaryDeviceID: function()
    {
        // 1. send
        return this._sSecondaryDeviceID;
    },

    /**
     * Get secondary device's public key
     * @returns string
     */
    getSecondaryDevicePublicKey: function()
    {
        // 1. send
        return this._sSecondaryDevicePublicKey;
    },

    /**
     * Set secondary device's ID
     * @param sValue
     */
    setSecondaryDeviceID: function(sValue)
    {
        // 1. store
        this._sSecondaryDeviceID = sValue;
    },

    /**
     * Clear secondary device
     */
    clearSecondaryDevice: function()
    {
        // 1. send
        delete this._secondaryDeviceSocket;

        // 2. update
        this._updateExpirationDate();
    },

    /**
     * Check if pair has other device (socket)
     * @returns {boolean}
     */
    hasOtherDevice: function(socket)
    {
        // 1. verify
        if (this.hasPrimaryDevice() && this.getPrimaryDevice().id === socket.id) return this.hasSecondaryDevice();

        // 2. verify
        if (this.hasSecondaryDevice() && this.getSecondaryDevice().id === socket.id) return this.hasPrimaryDevice();

        // 3. error
        return false;
    },

    /**
     * Get other device (socket)
     * @returns object
     */
    getOtherDevice: function(socket)
    {
        // 1. verify
        if (this.hasPrimaryDevice())
        {
            // a. validate
            if (this.getPrimaryDevice().id === socket.id)
            {
                // I. verify and respond
                return (this.hasSecondaryDevice()) ? this.getSecondaryDevice() : false;
            }
        }

        // 2. verify
        if (this.hasSecondaryDevice())
        {
            // a. validate
            if (this.getSecondaryDevice().id === socket.id)
            {
                // I. verify and respond
                return (this.hasPrimaryDevice()) ? this.getPrimaryDevice() : false;
            }
        }

        // 3. error
        return false;
    },

    /**
     * Get pair's communication direction
     * @returns string
     */
    getDirection: function()
    {
        // 1. send
        return this._sDirection;
    },

    /**
     * Set pair's communication direction
     * @param sValue
     */
    setDirection: function(sValue)
    {
        // 1. store
        this._sDirection = sValue;
    },

    /**
     * Toggle pair's communication direction
     */
    toggleDirection: function()
    {
        // 1. toggle
        this._sDirection = (this._sDirection === ToggleDirectionStates.prototype.DEFAULT) ? ToggleDirectionStates.prototype.SWAPPED : ToggleDirectionStates.prototype.DEFAULT;
    },

    /**
     * Send data
     * @param encryptedData
     */
    sendData: function(encryptedData)
    {
        // 1. verify
        if (this.getDirection() === ToggleDirectionStates.prototype.SWAPPED)
        {
            // a. verify or exit
            if (!this.hasSecondaryDevice()) return;
        }
        else
        {
            // a. verify or exit
            if (!this.hasPrimaryDevice()) return;
        }

        // 2. register
        let receiverSocket = (this.getDirection() === ToggleDirectionStates.prototype.SWAPPED) ? this.getSecondaryDevice() : this.getPrimaryDevice();


        let dataCloneForLogging = JSON.parse(JSON.stringify(encryptedData));

        if (dataCloneForLogging.value.data.length > 20)
        {
            let sValue = dataCloneForLogging.value.data;

            dataCloneForLogging.value.data = sValue.substr(0, 10) + ' ... ' + sValue.substr(sValue.length - 10);
        }

        // 3. send
        receiverSocket.emit(ConnectorEvents.prototype.RECEIVE_DATA, encryptedData);


        // ---


        // 4. log start of data
        if (encryptedData.packageNumber === 0)
        {
            // a. store
            this._aTransferTimes[encryptedData.id] = {
                created: Utils.prototype.since(this._nCreated),
                bytesTransferred: encryptedData.packageSize
            };

            // b. log
            this.Mimoto.mongoDB.getCollection('pairs').updateOne(
                {
                    "id": this.getID()
                },
                {
                    $set: { "used": true },
                    $push: { logs: {
                            action: this.ACTIONTYPE_DATA,
                            id: encryptedData.id,
                            contentType: encryptedData.sType,
                            totalSize: encryptedData.totalSize,
                            bytesTransferred: encryptedData.packageSize,
                            direction: this.getDirection(),
                            timeSinceStart: this._aTransferTimes[encryptedData.id].created,
                            finished: (encryptedData.packageNumber === encryptedData.packageCount - 1)
                        } }
                },
                function(err, result)
                {
                    CoreModule_Assert.equal(err, null);
                }
            );
        }
        else
        {
            // a. update
            this._aTransferTimes[encryptedData.id].bytesTransferred += encryptedData.packageSize;

            // b. log
            this.Mimoto.mongoDB.getCollection('pairs').updateOne(
                {
                    "id": this.getID(), "logs.action": this.ACTIONTYPE_DATA, "logs.id": encryptedData.id
                },
                {
                    $set: {
                        "logs.$.bytesTransferred": this._aTransferTimes[encryptedData.id].bytesTransferred,
                        "logs.$.duration": Utils.prototype.since(this._nCreated) - this._aTransferTimes[encryptedData.id].created
                    }
                },
                function(err, result, encryptedData)
                {
                    CoreModule_Assert.equal(err, null);
                }
            );
        }

        // 5. log end of data
        if (encryptedData.packageCount > 1 && encryptedData.packageNumber === encryptedData.packageCount - 1)
        {
            // a. log
            this.Mimoto.mongoDB.getCollection('pairs').updateOne(
                {
                    "id": this.getID(), "logs.action": this.ACTIONTYPE_DATA, "logs.id": encryptedData.id
                },
                {
                    $set: {
                        "logs.$.finished": true
                    }
                },
                function(err, result, encryptedData)
                {
                    CoreModule_Assert.equal(err, null);
                }
            );

            // b. cleanup
            delete this._aTransferTimes[encryptedData.id];
        }
    },

    /**
     * Get active state
     * @returns boolean
     */
    isActive: function()
    {
        return this._bIsActive;
    },

    /**
     * Get expiry date
     * @returns {null|number}
     */
    getExpiryDate: function()
    {
        return this._nExpires;
    },


    // ----------------------------------------------------------------------------
    // --- Private functions ------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Update expiration date
     * @private
     */
    _updateExpirationDate: function()
    {
        // 1. cleanup
        if (this._timerExpiration)
        {
            // a. reset
            this._nExpires = null;

            // b. cleanup
            clearTimeout(this._timerExpiration);
        }

        // 2. define
        let bNewState = (this.hasPrimaryDevice() || this.hasSecondaryDevice());
        let bStateHasChanged = (this._bIsActive !== bNewState);

        // 3. toggle
        this._bIsActive = bNewState;


        // 3. verify
        if (bStateHasChanged)
        {
            // a. store
            if (this.Mimoto.mongoDB.isRunning()) this.Mimoto.mongoDB.getCollection('pairs').updateOne(
                {
                    "id": this.getID()
                },
                {
                    $set: { "active" : this._bIsActive }
                },
                function(err, result)
                {
                    CoreModule_Assert.equal(err, null);
                }
            );

            // b. update
            if (this._bIsActive)
            {
                // a. broadcast
                this.dispatchEvent(this.ACTIVE);
            }
            else
            {
                // a. store
                this._nExpires = new Date().getTime() + this.MAX_IDLE_TIME;

                // b. setup
                this._timerExpiration = setTimeout(this._onHandleExpiration.bind(this), this.MAX_IDLE_TIME);

                // c. broadcast
                this.dispatchEvent(this.IDLE);
            }
        }
    },

    /**
     * Handle expiration timer `MAX_IDLE_TIME`
     * @private
     */
    _onHandleExpiration: function()
    {
        // 1. store
        if (this.Mimoto.mongoDB.isRunning()) this.Mimoto.mongoDB.getCollection('pairs').updateOne(
            {
                "id": this.getID()
            },
            {
                $set: { "archived": true }
            },
            function(err, result)
            {
                CoreModule_Assert.equal(err, null);
            }
        );

        // 2. broadcast
        this.dispatchEvent(this.EXPIRED);
    },

    /**
     * Handle possible security breach
     * @param device
     * @param sDeviceLabel
     * @private
     */
    _handlePossibleSecurityBreach: function(device, sDeviceLabel)
    {
        // 1. output
        this.Mimoto.logger.log('Pair already has a ' + sDeviceLabel + ' device connected. sPairID = ' + this.getID());

        // 2. broadcast
        this.dispatchEvent(ConnectorEvents.prototype.ERROR_SECURITY_COMPROMISED, device, this);


        // ---


        // 3. store
        if (this.Mimoto.mongoDB.isRunning()) this.Mimoto.mongoDB.getCollection('pairs').updateOne(
            {
                "id": this.getID()
            },
            {
                $set: { "compromised": true },
                $push: { logs: { action: this.ACTIONTYPE_SECURITYCOMPROMISED, timeSinceStart: Utils.prototype.since(this._nCreated) } }
            },
            function(err, result)
            {
                CoreModule_Assert.equal(err, null);
            }
        );
    }

};
