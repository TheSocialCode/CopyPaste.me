/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';



module.exports = function(socket)
{
    // start
    this.__construct(socket);
};

module.exports.prototype = {

    // data
    _socket: null,
    _sDeviceID: null,
    _sPairID: null,


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
    },



    // ----------------------------------------------------------------------------
    // --- Public methods ---------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Get device ID
     * @returns string
     */
    getDeviceID: function() { return this._sValue; },

    /**
     * Set device ID
     */
    setDeviceID: function(sValue) { this._sValue = sValue },


    /**
     * Get Pair ID
     * @returns string
     */
    getPairID: function() { return this._sPairID; },

    /**
     * Set Pair ID
     */
    setPairID: function(sValue) { this._sPairID = sValue }

};
