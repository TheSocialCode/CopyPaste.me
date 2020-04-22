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
    _elLabel: null,
    _elMenu: null,
    _elButton: null,

    // settings
    _buttonData: null,



    // ----------------------------------------------------------------------------
    // --- Constructor ------------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Constructor
     */
    __construct: function ()
    {
        // 1. register
        this._elRoot = document.querySelector('[data-mimoto-id="component_AlertMessage"]');
        this._elLabel = this._elRoot.querySelector('[data-mimoto-id="label"]');
        this._elMenu = this._elRoot.querySelector('[data-mimoto-id="menu"]');
        this._elButton = this._elRoot.querySelector('[data-mimoto-id="button"]');

        // 2. configure
        this._elButton.addEventListener('click', this._onButtonClick.bind(this));
    },



    // ----------------------------------------------------------------------------
    // --- Public methods ---------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Show component
     */
    show: function(sMessage, bDisableInterface, buttonData)
    {
        // 1. store
        this._buttonData = buttonData;

        // 2. output
        this._elLabel.innerHTML = sMessage;

        // 3. show
        this._elRoot.classList.add('show');
        this._elMenu.classList.remove('show');

        // 4. verify
        if (this._buttonData && this._buttonData.sLabel && this._buttonData.fClickHandler)
        {
            // a. show
            this._elMenu.classList.add('show');

            // b. output
            this._elButton.innerText = this._buttonData.sLabel;
        }

        // 5. disable
        if (bDisableInterface) this._elRoot.classList.add('disabled');
    },

    /**
     * Hide component
     */
    hide: function()
    {
        // 1. toggle
        this._elRoot.classList.remove('show');
        this._elMenu.classList.remove('show');
    },



    // ----------------------------------------------------------------------------
    // --- Private functions ------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Handle button `click`
     * @private
     */
    _onButtonClick: function()
    {
        // 1. validate
        if (this._buttonData && this._buttonData.fClickHandler)
        {
            // a. execute
            this._buttonData.fClickHandler();
        }
    }

}