/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';


// import extenders
const EventDispatcherExtender = require('./../../common/extenders/EventDispatcherExtender');

// import
const Token = require('./Token');


module.exports = function(aSockets)
{
    // start
    this.__construct(aSockets);
};

module.exports.prototype = {

    // source
    _aSockets: [],

    // utils
    _timer: null,

    // data
    _aTokens: [],

    // events
    TOKEN_EXPIRED: 'token_expired',



    // ----------------------------------------------------------------------------
    // --- Constructor ------------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Constructor
     */
    __construct: function (aSockets)
    {
        // 1. extend
        new EventDispatcherExtender(this);

        // ---

        // 2. store
        this._aSockets = aSockets;

        // 3. run garbage collection
        this._timer = setInterval(this._findExpiredTokens.bind(this), 1000);
    },



    // ----------------------------------------------------------------------------
    // --- Public methods ---------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Create token
     * @param pair
     * @param sTokenType
     * @returns object
     */
    createToken: function(pair, sTokenType)
    {
        // 1. init
        let bCreated = false;

        // 2. create
        let token = new Token(pair, sTokenType);

        // 3. validate
        while (!bCreated)
        {
            // b. validate
            if (!this._aTokens['' + token.getValue()])
            {
                // I. store
                this._aTokens['' + token.getValue()] = token;

                // II. toggle
                bCreated = true;
            }
            else
            {
                // I. re-create
                token = new Token(pair, sTokenType);
            }
        }

        // 4. send
        return token;
    },

    /**
     * Get token
     * @returns string
     */
    getToken: function(sTokenValue)
    {
        // 1. verify and respond
        if (!this._aTokens['' + sTokenValue]) return false;

        // 2. register
        let token = this._aTokens['' + sTokenValue];

        // 3. cleanup (use once)
        delete this._aTokens['' + sTokenValue];

        // 3. validate or return error
        if (!token.isValid()) return false;

        // 4. send
        return token;
    },



    // ----------------------------------------------------------------------------
    // --- Private methods --------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Find expired tokens
     * @private
     */
    _findExpiredTokens: function()
    {
        // 1. parse all
        for (let sKey in this._aTokens)
        {
            // a. register
            let token = this._aTokens[sKey];

            // b. validate
            if (token.isValid()) continue;

            // c. cleanup
            delete this._aTokens[sKey];
        }
    }

};
