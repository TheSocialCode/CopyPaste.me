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
    },



    // ----------------------------------------------------------------------------
    // --- Public methods ---------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Show component
     */
    show: function(sMessage, bDisableInterface)
    {
        // 1. output
        this._elRoot.innerHTML = sMessage;

        // 2. show
        this._elRoot.classList.add('show');

        // 3. disable
        if (bDisableInterface) this._elRoot.classList.add('disabled');
    },

    /**
     * Hide component
     */
    hide: function()
    {
        // 1. toggle
        this._elRoot.classList.remove('show');
    }

};
