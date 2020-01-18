/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';


module.exports = function()
{
    // start
    this.__construct();
};

module.exports.prototype = {

    // views
    _elRoot: null,
    _elButton: null,

    // utils
    _aEvents: [],

    // events
    REQUEST_TOGGLE_MANUALCONNECT: 'onRequestToggleManualConnect',



    // ----------------------------------------------------------------------------
    // --- Constructor ------------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Constructor
     */
    __construct: function ()
    {
        // 1. register
        this._elRoot = document.querySelector('[data-mimoto-id="component_ManualConnect"]');
        this._elButton = this._elRoot.querySelector('[data-mimoto-id="component_ManualConnect_button"]');

        // 2. configure
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
     * Add event listener
     * @param sEvent
     * @param fMethod
     */
    addEventListener: function(sEvent, fMethod)
    {
        // 1. verify or init
        if (!this._aEvents[sEvent]) this._aEvents[sEvent] = [];

        // 2. store
        this._aEvents[sEvent].push(fMethod);
    },

    /**
     * dispatch event
     * @param sEvent
     */
    dispatchEvent: function(sEvent)
    {
        // 1. validate
        if (this._aEvents[sEvent])
        {
            // a. find
            let nMethodCount = this._aEvents[sEvent].length;
            for (let nIndex = 0; nIndex < nMethodCount; nIndex++)
            {
                // I. register
                let fMethod = this._aEvents[sEvent][nIndex];

                // II. execute
                fMethod.apply(this, Array.prototype.slice.call(arguments, 1));
            }
        }
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
        // 1. broadcast
        this.dispatchEvent(this.REQUEST_TOGGLE_MANUALCONNECT);
    }

};
