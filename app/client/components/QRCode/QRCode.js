/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';


// import
const QRCodeGenerator = require('qrcode-generator');


module.exports = function(sTokenURL)
{
    // start
    this.__construct(sTokenURL);
};

module.exports.prototype = {

    // components
    _qrcode: null,

    // views
    _elRoot: null,
    _elContainer: null,



    // ----------------------------------------------------------------------------
    // --- Constructor ------------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Constructor
     */
    __construct: function (sTokenURL)
    {
        // 1. register
        this._elRoot = document.querySelector('[data-mimoto-id="component_QR"]');
        this._elContainer = document.querySelector('[data-mimoto-id="component_QR_container"]');

        // 2. configure
        var typeNumber = 4;
        var errorCorrectionLevel = 'L';
        var qr = QRCodeGenerator(typeNumber, errorCorrectionLevel);
        qr.addData(sTokenURL);
        qr.make();
        this._elContainer.innerHTML = qr.createImgTag(5);

        // 3. configure
        this._elContainer.addEventListener(
            'click',
            function(e)
            {
                // copy to clipboard
                let elHelperTextArea = document.createElement('textarea');
                elHelperTextArea.value = sTokenURL;
                document.body.appendChild(elHelperTextArea);
                elHelperTextArea.select();
                document.execCommand('copy');
                document.body.removeChild(elHelperTextArea);

            }.bind(this, sTokenURL)
        );
    },



    // ----------------------------------------------------------------------------
    // --- Public methods ---------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Show component
     */
    show: function()
    {
        // 1. toggle
        this._elRoot.classList.add('show');
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
