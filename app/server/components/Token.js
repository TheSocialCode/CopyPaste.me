/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';

// import project classes
const ConnectionTypes = require('./../../client/components/Connector/ConnectionTypes');

// import utils
const Module_GenerateUniqueID = require('generate-unique-id');
const Module_GeneratePassword = require("generate-password");


module.exports = function(pair, sType)
{
    // start
    this.__construct(pair, sType);
};

module.exports.prototype = {

    // data
    _sValue: null,
    _pair: null,

    // security
    _tsExpires: null,

    // settings
    TOKEN_LIFETIME: 2 * 60 * 1000,
    TOKEN_LIFETIME_INVITE: 5 * 60 * 1000,


    // ----------------------------------------------------------------------------
    // --- Constructor ------------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Constructor
     * @param pair
     * @param sType
     */
    __construct: function(pair, sType)
    {
        // 1. store
        this._pair = pair;
        this._sType = sType;

        // 2. init
        this._sValue = (sType === ConnectionTypes.prototype.TYPE_SCAN || sType === ConnectionTypes.prototype.TYPE_INVITE) ? this._initValueQR() : (sType === ConnectionTypes.prototype.TYPE_MANUALLY) ? this._initValueManualCode() : false;

        // 3. configure
        this._nExpires = new Date().getTime() + ((this._sValue !== false) ? ((this._sType === ConnectionTypes.prototype.TYPE_INVITE) ? this.TOKEN_LIFETIME_INVITE : this.TOKEN_LIFETIME) : 0);
    },



    // ----------------------------------------------------------------------------
    // --- Public methods ---------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Get token value
     * @returns string
     */
    getValue: function()
    {
        // 1. send
        return this._sValue;
    },

    /**
     * Get token lifetime
     * @returns int
     */
    getLifetime: function()
    {
        // 1. send
        return (this._sType === ConnectionTypes.prototype.TYPE_INVITE) ? this.TOKEN_LIFETIME_INVITE : this.TOKEN_LIFETIME;
    },

    /**
     * Get pair
     * @returns object
     */
    getPair: function()
    {
        // 1. send
        return this._pair;
    },

    /**
     * Get type
     * @returns object
     */
    getType: function()
    {
        // 1. send
        return this._sType;
    },

    /**
     * Validate
     * @returns boolean
     */
    isValid: function()
    {
        // 1. validate and send
        return (this._nExpires >= new Date().getTime());
    },



    // ----------------------------------------------------------------------------
    // --- Private functions ------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Init value for QR code
     * @returns string
     * @private
     */
    _initValueQR: function()
    {
        // 1. create and send
        return Module_GenerateUniqueID({ length: 32 });
    },

    /**
     * Init value for manual code
     * @returns string
     * @private
     */
    _initValueManualCode: function()
    {
        // 1. create and send
        return Module_GeneratePassword.generate({
            length: 6,
            numbers: true,
            lowercase: false,
            uppercase: true,
            excludeSimilarCharacters: true,
            exclude: 'i'
        });
    }

};
