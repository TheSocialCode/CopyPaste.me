/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';


// import project classes
const Utils = require('./../utils/Utils');
const ToggleDirectionStates = require('./../../client/components/ToggleDirectionButton/ToggleDirectionStates');

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
        dataSent: false,
    },

    // action types
    ACTIONTYPE_CREATED: 'created',
    ACTIONTYPE_DISCONNECTED: 'disconnected',
    ACTIONTYPE_TERMINATED: 'terminated',
    ACTIONTYPE_TOKEN_REQUEST: 'token_requested',
    ACTIONTYPE_ARCHIVED: 'archived',
    ACTIONTYPE_UNARCHIVED: 'unarchived',
    ACTIONTYPE_DATA: 'data',
    ACTIONTYPE_DATA_START: 'data_start',
    ACTIONTYPE_DATA_FINISH: 'data_finish',
    ACTIONTYPE_PRIMARYDEVICE_CONNECTED: 'primarydevice_connected',
    ACTIONTYPE_PRIMARYDEVICE_DISCONNECTED: 'primarydevice_disconnected',
    ACTIONTYPE_SECONDARYDEVICE_CONNECTED: 'secondarydevice_connected',
    ACTIONTYPE_SECONDARYDEVICE_DISCONNECTED: 'secondarydevice_disconnected',



    // ----------------------------------------------------------------------------
    // --- Constructor ------------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Constructor
     */
    __construct: function (primaryDeviceSocket, sPrimaryDevicePublicKey)
    {
        // 1. init
        this._sDirection = ToggleDirectionStates.prototype.DEFAULT;

        // 2. set id
        this._sPairID = Module_GenerateUniqueID({ length: 32 });

        // 3. store
        this._primaryDeviceSocket = primaryDeviceSocket;
        this._sPrimaryDevicePublicKey = sPrimaryDevicePublicKey;
        this._sPrimaryDeviceID = Module_GenerateUniqueID({ length: 32 });
    },



    // ----------------------------------------------------------------------------
    // --- Public methods ---------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Connect secondary device
     * @param secondaryDeviceSocket
     * @param sSecondaryDevicePublicKey
     */
    connectSecondaryDevice: function(secondaryDeviceSocket, sSecondaryDevicePublicKey)
    {
        // 1. validate
        if (this._sSecondaryDeviceID) return false;

        // 2. store
        this._secondaryDeviceSocket = secondaryDeviceSocket;
        this._sSecondaryDevicePublicKey = sSecondaryDevicePublicKey;
        this._sSecondaryDeviceID = Module_GenerateUniqueID({ length: 32 });

        // 3. success
        return true;
    },

    /**
     * Get pair's ID
     * @returns string
     */
    getId: function()
    {
        // 1. respond
        return this._sPairID;
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
     * Get data for mongo
     * @returns object
     */
    getDataForMongo: function()
    {
        // 1. build and respond
        return {
            id: this._sPairID,
            created: Utils.prototype.buildDate(),
            data: {
                connectiontype: null,
                direction: this._sDirection
            },
            states: {
                connectionEstablished: this._states.connectionEstablished,
                dataSent: this._states.dataSent,
                archived: false
            },
            logs: [
                { action: this.ACTIONTYPE_CREATED, timestamp: Utils.prototype.buildDate() }
            ]
        };
    }

};
