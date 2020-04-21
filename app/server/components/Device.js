/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';


// import utils
const Module_GenerateUniqueID = require('generate-unique-id');


module.exports = function(socket)
{
    // start
    this.__construct(socket);
};

module.exports.prototype = {

    // settings
    _sDeviceID: null,

    // data
    _socket: null,
    _sSocketID: null,
    _sPairID: null,
    _sType: null,

    // types
    PRIMARYDEVICE: 'PRIMARYDEVICE',
    SECONDARYDEVICE: 'SECONDARYDEVICE',



    // ----------------------------------------------------------------------------
    // --- Constructor ------------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Constructor
     */
    __construct: function (socket)
    {
        // 1. store
        this._socket = socket;

        // 2. init
        this._sDeviceID = Module_GenerateUniqueID({ length: 32 });
    },



    // ----------------------------------------------------------------------------
    // --- Public methods ---------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Get device ID
     * @returns string
     */
    getID: function() { return this._sDeviceID; },

    /**
     * Get socket ID
     * @returns string
     */
    getSocketID: function() { return (this._socket) ? this._socket.id : false; },

    /**
     * Get socket
     * @returns object
     */
    getSocket: function() { return this._socket; },

    /**
     * Set socket
     * @param value
     */
    updateSocket: function(value) { this._socket = value },

    /**
     * Get pair ID
     * @returns string
     */
    getPairID: function() { return this._sPairID; },

    /**
     * Set pair ID
     * @para, sValue
     */
    setPairID: function(sValue) { this._sPairID = sValue },

    /**
     * Get type
     * @returns string
     */
    getType: function() { return this._sType },

    /**
     * Set type
     * @para, sValue
     */
    setType: function(sValue) { this._sType = sValue }

};
