/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';


// import utils
const Module_GenerateUniqueID = require('generate-unique-id');


module.exports = function(pair)
{
    // start
    this.__construct(pair);
};

module.exports.prototype = {

    // data
    _sValue: null,
    _pair: null,

    // security
    _tsExpires: null,

    // settings
    TOKEN_LIFETIME: 2 * 60 * 1000,



    // ----------------------------------------------------------------------------
    // --- Constructor ------------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Constructor
     */
    __construct: function (pair)
    {
        // 1. store
        this._pair = pair;

        // 2. init
        this._sValue = Module_GenerateUniqueID({ length: 32 });

        // 3. configure
        this._nExpires = new Date().getTime() + this.TOKEN_LIFETIME;
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
        return this.TOKEN_LIFETIME;
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
     * Validate
     * @returns boolean
     */
    isValid: function()
    {
        // 1. validate and send
        return (this._nExpires >= new Date().getTime());
    }

};
