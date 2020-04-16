/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';


// import project classes
const Device = require('./Device');
const Pair = require('./Pair');
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

    // devices
    _primaryDeviceSocket: null,
    _sPrimaryDevicePublicKey: null,
    _sPrimaryDeviceID: null,

    _secondaryDeviceSocket: null,
    _sSecondaryDevicePublicKey: null,
    _sSecondaryDeviceID: null,

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
    ACTIONTYPE_SECONDARYDEVICE_CONNECTED: 'SECONDARYDEVICE_CONNECTED',
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
        this._sDirection = ToggleDirectionStates.prototype.DEFAULT;

        // 3. set id
        this._sPairID = Module_GenerateUniqueID({ length: 32 });

        // 4. store
        this._primaryDeviceSocket = socket;
        this._sPrimaryDevicePublicKey = sPublicKey;
        this._sPrimaryDeviceID = sDeviceID;


        // ---

        // 5. store
        if (this.Mimoto.mongoDB.isRunning()) this.Mimoto.mongoDB.getCollection('pairs').insertOne(
            {
                id: this._sPairID,
                data: {
                    connectiontype: null,
                    direction: this._sDirection
                },
                states: {
                    connectionEstablished: this._states.connectionEstablished,
                    securityCompromised: this._states.securityCompromised,
                    dataSent: this._states.dataSent,
                    archived: this._states.archived,

                },
                logs: [
                    { action: this.ACTIONTYPE_CREATED }
                ]
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
     */
    connectSecondaryDevice: function(socket, sPublicKey, device)
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

        // 5. store
        if (this.Mimoto.mongoDB.isRunning()) this.Mimoto.mongoDB.getCollection('pairs').updateOne(
            {
                "id": this.getID()
            },
            {
                $set: { "states.connectionEstablished" : this._states.connectionEstablished },
                $push: { logs: { action: this.ACTIONTYPE_SECONDARYDEVICE_CONNECTED } }
            },
            function(err, result)
            {
                CoreModule_Assert.equal(err, null);
            }
        );


        // ---


        // 6. success
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
        return this._primaryDeviceSocket;
    },

    /**
     * Get primary device's ID
     * @returns string
     */
    getPrimaryDeviceID: function()
    {
        return this._sPrimaryDeviceID;
    },

    /**
     * Get primary device's public key
     * @returns string
     */
    getPrimaryDevicePublicKey: function()
    {
        return this._sPrimaryDevicePublicKey;
    },

    /**
     * Set primary device's ID
     * @param sValue
     */
    setPrimaryDeviceID: function(sValue)
    {
        this._sPrimaryDeviceID = sValue;
    },

    /**
     * Clear primary device
     */
    clearPrimaryDevice: function()
    {
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
        return this._secondaryDeviceSocket;
    },

    /**
     * Get secondary device's ID
     * @returns string
     */
    getSecondaryDeviceID: function()
    {
        return this._sSecondaryDeviceID;
    },

    /**
     * Get secondary device's public key
     * @returns string
     */
    getSecondaryDevicePublicKey: function()
    {
        return this._sSecondaryDevicePublicKey;
    },

    /**
     * Set secondary device's ID
     * @param sValue
     */
    setSecondaryDeviceID: function(sValue)
    {
        this._sSecondaryDeviceID = sValue;
    },

    /**
     * Clear secondary device
     */
    clearSecondaryDevice: function()
    {
        delete this._secondaryDeviceSocket;
    },

    /**
     * Set connection type
     * @param sValue
     */
    setConnectionType: function(sValue)
    {
        this._sConnectionType = sValue;
    },

    /**
     * Get pair's communication direction
     * @returns string
     */
    getDirection: function()
    {
        return this._sDirection;
    },

    /**
     * Set pair's communication direction
     * @param sValue
     */
    setDirection: function(sValue)
    {
        this._sDirection = sValue;
    },

    /**
     * Toggle pair's communication direction
     */
    toggleDirection: function()
    {
        this._sDirection = (this._sDirection === ToggleDirectionStates.prototype.DEFAULT) ? ToggleDirectionStates.prototype.SWAPPED : ToggleDirectionStates.prototype.DEFAULT;
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
        this.dispatchEvent(ConnectorEvents.prototype.SECURITY_COMPROMISED, device, this);


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
                $push: { logs: { action: this.ACTIONTYPE_SECURITYCOMPROMISED } }
            },
            function(err, result)
            {
                CoreModule_Assert.equal(err, null);
            }
        );
    }

};
