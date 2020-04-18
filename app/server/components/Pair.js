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
    _sConnectionType: null,

    _states: {
        connectionEstablished: false,
        securityCompromised: false,
        dataSent: false,
        archived: false
    },

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
    ACTIONTYPE_SECONDARYDEVICE_CONNECTED_QR: 'SECONDARYDEVICE_CONNECTED_QR',
    ACTIONTYPE_SECONDARYDEVICE_CONNECTED_MANUALCODE: 'SECONDARYDEVICE_CONNECTED_MANUALCODE',
    ACTIONTYPE_SECONDARYDEVICE_CONNECTED_INVITE: 'SECONDARYDEVICE_CONNECTED_INVITE',
    ACTIONTYPE_SECONDARYDEVICE_DISCONNECTED: 'SECONDARYDEVICE_DISCONNECTED',
    ACTIONTYPE_SECURITYCOMPROMISED: 'SECURITY_COMPROMISED',



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
                states: {
                    connectionEstablished: this._states.connectionEstablished,
                    securityCompromised: this._states.securityCompromised,
                    dataSent: this._states.dataSent,
                    archived: this._states.archived,
                }
            }
        );
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

        // 3. success
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


        // ---


        // 4. toggle
        this._states.connectionEstablished = true;

        // 5. init
        let sAction = '';

        // 6. prepare
        switch(sConnectionType)
        {
            case Token.prototype.TYPE_QR: sAction = this.ACTIONTYPE_SECONDARYDEVICE_CONNECTED_QR; break;
            case Token.prototype.TYPE_MANUALCODE: sAction = this.ACTIONTYPE_SECONDARYDEVICE_CONNECTED_MANUALCODE; break;
            case Token.prototype.TYPE_INVITE: sAction = this.ACTIONTYPE_SECONDARYDEVICE_CONNECTED_INVITE; break;
        }

        // 7. store
        if (this.Mimoto.mongoDB.isRunning()) this.Mimoto.mongoDB.getCollection('pairs').updateOne(
            {
                "id": this.getID()
            },
            {
                $set: { "states.connectionEstablished" : this._states.connectionEstablished },
                $push: { logs: { action: sAction, timeSinceStart: Utils.prototype.since(this._nCreated) } }
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

        // 3. success
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

        // 2. convert
        this.connectSecondaryDevice(this._unconfirmedSecondaryDeviceSocket, this._sSecondaryDevicePublicKey, device, Token.prototype.TYPE_MANUALCODE)

        // 3. cleanup
        delete this._unconfirmedSecondaryDeviceSocket;
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
    },

    /**
     * Set connection type
     * @param sValue
     */
    setConnectionType: function(sValue)
    {
        // 1. store
        this._sConnectionType = sValue;
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

        // 3. send
        receiverSocket.emit(ConnectorEvents.prototype.RECEIVE_DATA, encryptedData);


        // ---


        // 4. toggle
        this._states.dataSent = true;

        // 5. log start of data
        if (encryptedData.packageNumber === 0)
        {
            // a. log
            this.Mimoto.mongoDB.getCollection('pairs').updateOne(
                {
                    "id": this.getID()
                },
                {
                    $set: { "states.dataSent" : this._states.dataSent },
                    $push: { logs: {
                            type: this.ACTIONTYPE_DATA_START,
                            id: encryptedData.id,
                            contentType: encryptedData.sType,
                            totalSize: encryptedData.totalSize,
                            direction: this.getDirection(),
                            timeSinceStart: Utils.prototype.since(this._nCreated)
                        } }
                },
                function(err, result)
                {
                    CoreModule_Assert.equal(err, null);
                }
            );
        }

        // 6. log end of data
        if (encryptedData.packageNumber === encryptedData.packageCount - 1)
        {
            // a. log
            this.Mimoto.mongoDB.getCollection('pairs').updateOne(
                {
                    "id": this.getID()
                },
                {
                    $push: { logs: {
                            type: this.ACTIONTYPE_DATA_FINISH,
                            id: encryptedData.id,
                            timeSinceStart: Utils.prototype.since(this._nCreated)
                        } }
                },
                function(err, result)
                {
                    CoreModule_Assert.equal(err, null);
                }
            );
        }
    },



    // ----------------------------------------------------------------------------
    // --- Private functions ------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Handle possible security breach
     * @param device
     * @private
     */
    _handlePossibleSecurityBreach: function(device, sDeviceLabel)
    {
        // 1. output
        this.Mimoto.logger.log('Pair already has a ' + sDeviceLabel + ' device connected. sPairID = ' + this.getID());

        // 2. broadcast
        this.dispatchEvent(ConnectorEvents.prototype.ERROR_SECURITY_COMPROMISED, device, this);


        // ---


        // 3. toggle
        this._states.securityCompromised = true;

        // 4. store
        if (this.Mimoto.mongoDB.isRunning()) this.Mimoto.mongoDB.getCollection('pairs').updateOne(
            {
                "id": this.getID()
            },
            {
                $set: { "states.securityCompromised" : this._states.securityCompromised },
                $push: { logs: { action: this.ACTIONTYPE_SECURITYCOMPROMISED, timeSinceStart: Utils.prototype.since(this._nCreated) } }
            },
            function(err, result)
            {
                CoreModule_Assert.equal(err, null);
            }
        );
    }

};
