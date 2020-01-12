/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';


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
        // 3. register
        this._elRoot = document.querySelector('[data-mimoto-id="component_ClearClipboard"]');
        this._elContainer = document.querySelector('[data-mimoto-id="component_DataOutput_container"]');
        




        //this._clearClipboard = new ClearClipboard();
        
        //this._elClearClipboard = document.querySelector('receiver_clipboard_clear');
        //this._elClearClipboardButton = document.querySelector('receiver_clipboard_clear_button');


        //if (this._dataOutput.hasItems()) this._elWaiting.style.display = 'block';
        // elDataContainer.children.length === 0)
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
    }

};
