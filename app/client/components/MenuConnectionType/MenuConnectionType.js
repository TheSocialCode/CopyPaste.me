/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';


// import extenders
const EventDispatcherExtender = require('./../../../common/extenders/EventDispatcherExtender');

// import project classes
const ConnectionTypes = require('./../Connector/ConnectionTypes');


module.exports = function()
{
    // start
    this.__construct();
};

module.exports.prototype = {

    // views
    _elRoot: null,
    _elArrow: null,
    _elButtonContainer: null,
    _elButtonScan: null,
    _elButtonManually: null,
    _elButtonInvite: null,

    // events
    REQUEST_TOGGLE_CONNECTIONTYPE: 'REQUEST_TOGGLE_CONNECTIONTYPE',

    // state
    _sCurrentConnectionType: null,



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
        this._elRoot = document.querySelector('[data-mimoto-id="component_MenuConnectionType"]');
        this._elArrow = this._elRoot.querySelector('[data-mimoto-id="arrow"]');
        this._elButtonContainer = this._elRoot.querySelector('[data-mimoto-id="button-container"]');
        this._elButtonScan = this._elRoot.querySelector('[data-mimoto-id="button-scan"]');
        this._elButtonManually = this._elRoot.querySelector('[data-mimoto-id="button-manually"]');
        this._elButtonInvite = this._elRoot.querySelector('[data-mimoto-id="button-invite"]');

        // 3. configure
        this._elButtonScan.addEventListener('click', this._onButtonClick.bind(this, ConnectionTypes.prototype.TYPE_SCAN));
        this._elButtonManually.addEventListener('click', this._onButtonClick.bind(this, ConnectionTypes.prototype.TYPE_MANUALLY));
        this._elButtonInvite.addEventListener('click', this._onButtonClick.bind(this, ConnectionTypes.prototype.TYPE_INVITE));
    },



    // ----------------------------------------------------------------------------
    // --- Public methods ---------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Show component
     */
    show: function()
    {
        // 1. toggle visibility
        this._elRoot.classList.add('show');

        // 2. position
        this._elRoot.style.marginLeft = (-Math.floor(this._elButtonContainer.offsetWidth) / 2) + 'px';

        // 3. auto-select
        if (!this._sCurrentConnectionType) this._onButtonClick(ConnectionTypes.prototype.TYPE_SCAN);
    },

    /**
     * Hide component
     */
    hide: function()
    {
        // 1. toggle visibility
        this._elRoot.classList.remove('show');
    },



    // ----------------------------------------------------------------------------
    // --- Private methods --------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Handle button event `click`
     * @param sConnectionType
     * @private
     */
    _onButtonClick: function(sConnectionType)
    {
        // 1. verify or exit
        if (sConnectionType === this._sCurrentConnectionType) return;

        // 2. store
        this._sCurrentConnectionType = sConnectionType;

        // 3. reset
        this._elButtonScan.classList.remove('selected');
        this._elButtonManually.classList.remove('selected');
        this._elButtonInvite.classList.remove('selected');

        // 4. init
        let elSelectedButton = null;

        // 5. select
        switch(sConnectionType)
        {
            case ConnectionTypes.prototype.TYPE_SCAN:

                // a. focus
                this._elButtonScan.classList.add('selected');

                // b. store
                elSelectedButton = this._elButtonScan;
                break;

            case ConnectionTypes.prototype.TYPE_MANUALLY:

                // a. focus
                this._elButtonManually.classList.add('selected');

                // b. store
                elSelectedButton = this._elButtonManually;
                break;

            case ConnectionTypes.prototype.TYPE_INVITE:

                // a. focus
                this._elButtonInvite.classList.add('selected');

                // b. store
                elSelectedButton = this._elButtonInvite;
                break;
        }

        // 6. verify
        if (elSelectedButton)
        {
            // a. read
            let rectRoot = this._elRoot.getBoundingClientRect();
            let rectArrow = this._elArrow.getBoundingClientRect();
            let rectButton = elSelectedButton.getBoundingClientRect();

            // b. move
            this._elArrow.style.left = Math.round(rectButton.x - rectRoot.x + rectButton.width/2 - rectArrow.width) + 'px';
        }

        // 7. broadcast
        this.dispatchEvent(this.REQUEST_TOGGLE_CONNECTIONTYPE, sConnectionType);
    }

};
