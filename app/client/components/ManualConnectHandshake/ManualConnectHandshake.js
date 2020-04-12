/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';


// import
const ManualConnectEvents = require('./../ManualConnectButton/ManualConnectEvents');

// import extenders
const EventDispatcherExtender = require('./../../../common/extenders/EventDispatcherExtender');


module.exports = function()
{
    // start
    this.__construct();
};

module.exports.prototype = {

    // views
    _elRoot: null,
    _elTitle: null,
    _elSubtitle: null,
    _elButtonConnect: null,

    // events
    REQUEST_CONFIRM_HANDSHAKE: 'onRequestConfirmHandshake',



    // ----------------------------------------------------------------------------
    // --- Constructor ------------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Constructor
     */
    __construct: function ()
    {
        // 1. extend
        new EventDispatcherExtender(this);

        // 2. register
        this._elRoot = document.querySelector('[data-mimoto-id="component_ManualConnectHandshake"]');
        this._elTitle = document.querySelector('[data-mimoto-id="title"]');
        this._elSubtitle = document.querySelector('[data-mimoto-id="subtitle"]');
        this._elButtonConnect = this._elRoot.querySelector('[data-mimoto-id="button"]');

        // 3. configure
        this._elButtonConnect.addEventListener('click', this._onButtonConnectClick.bind(this));
    },



    // ----------------------------------------------------------------------------
    // --- Public methods ---------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Show component
     */
    show: function(sCode)
    {
        // 1. output
        for (let nIndex = 0; nIndex < 4; nIndex++)
        {
            // a. find
            let elCharacter = this._elRoot.querySelector('[data-mimoto-id="char' + (nIndex + 1) + '"]');

            // b. output
            elCharacter.innerText = sCode.substr(nIndex, 1);
        }

        // 2. toggle
        this._elRoot.classList.add('show');
    },

    /**
     * Hide component
     */
    hide: function()
    {
        // 1. toggle
        this._elRoot.classList.remove('show');
    },

    /**
     * Enable button
     */
    enableButton: function()
    {
        // 1. toggle
        this._elButtonConnect.classList.add('show');
    },



    // ----------------------------------------------------------------------------
    // --- Private methods --------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Handle button connect `click`
     * @private
     */
    _onButtonConnectClick: function()
    {
        // 1. broadcast
        this.dispatchEvent(this.REQUEST_CONFIRM_HANDSHAKE, this._sCode);
    }

};
