/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';


// import helpers
const Module_ClipboardCopy = require('clipboard-copy');


module.exports = function(socket)
{
    // start
    this.__construct(socket);
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
    __construct: function (socket)
    {
        // 1. register
        this._elRoot = document.querySelector('[data-mimoto-id="component_ClearClipboard"]');
        this._elButton = this._elRoot.querySelector('[data-mimoto-id="button_clear"]');

        // 2. configure
        this._elButton.addEventListener('click', this._onButtonClick.bind(this));
    },



    // ----------------------------------------------------------------------------
    // --- Public methods ---------------------------------------------------------
    // ----------------------------------------------------------------------------


    show: function()
    {
        console.log('Show ClearClipboard');

        this._elRoot.classList.add('show');

        this._waiting.show();
        //if (!this._elContainer.hasItems()) this._waiting.show();
    },

    hide: function()
    {
        console.log('Hide ClearClipbard');

        this._elRoot.classList.remove('show');
    },



    // ----------------------------------------------------------------------------
    // --- Private methods --------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Handle button event `click`
     * @private
     */
    _onButtonClick: function()
    {
        // 1. copy
        Module_ClipboardCopy('');

        // 2. hide
        this.hide();
    }

};
