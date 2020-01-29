/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';


// import
const ManualConnectEvents = require('./ManualConnectEvents');

// import extenders
const EventDispatcherExtender = require('./../../extenders/EventDispatcherExtender');


module.exports = function()
{
    // start
    this.__construct();
};

module.exports.prototype = {

    // views
    _elRoot: null,
    _elButton: null,


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
        this._elRoot = document.querySelector('[data-mimoto-id="component_ManualConnectButton"]');
        this._elButton = this._elRoot.querySelector('[data-mimoto-id="button"]');

        // 3. configure
        this._elButton.addEventListener('click', this._onButtonClick.bind(this));
    },



    // ----------------------------------------------------------------------------
    // --- Public methods ---------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Show component
     */
    show: function()
    {
        this._elRoot.classList.add('show');
    },

    /**
     * Hide component
     */
    hide: function()
    {
        this._elRoot.classList.remove('show');
    },



    // ----------------------------------------------------------------------------
    // --- Private methods --------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Handle button event `click`
     * @param e
     * @private
     */
    _onButtonClick: function(e)
    {
        // 1, toggle label
        this._elRoot.classList.toggle('flip');

        // 2. broadcast
        this.dispatchEvent(ManualConnectEvents.prototype.REQUEST_TOGGLE_MANUALCONNECT);
    }

};
