/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';


// import
const ToggleDirectionStates = require('./ToggleDirectionStates');

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
    _elButton: null,

    // states
    _bIsDisabled: false,

    // events
    REQUEST_TOGGLE_DIRECTION: 'REQUEST_TOGGLE_DIRECTION',


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
        this._elRoot = document.querySelector('[data-mimoto-id="component_ToggleDirectionButton"]');
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

    /**
     * Disable
     */
    disable: function()
    {
        // 1. toggle
        this._bIsDisabled = true;

        // 2. set state
        this._elButton.classList.add('disabled')
    },

    /**
     * Enable
     */
    enable: function()
    {
        // 1. toggle
        this._bIsDisabled = false;

        // 2. set state
        this._elButton.classList.remove('disabled')
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
        // 1. validate
        if (this._bIsDisabled) return;

        // 2. broadcast
        this.dispatchEvent(this.REQUEST_TOGGLE_DIRECTION);
    }

};
