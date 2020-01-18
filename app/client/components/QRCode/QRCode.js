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
    _elFront: null,
    _elBack: null,
    _elManualURL: null,



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
        this._elFront = document.querySelector('[data-mimoto-id="component_QR_front"]');
        this._elBack = document.querySelector('[data-mimoto-id="component_QR_back"]');
        this._elManualURL = document.querySelector('[data-mimoto-id="component_QR_manualurl"]');

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

        // 2. apply dimensions to main component
        this._elRoot.style.width = this._elFront.offsetWidth + 'px';
        this._elRoot.style.height = this._elFront.offsetHeight + 'px';

        // 3. register
        let nInitialBackHeight = this._elBack.offsetHeight;

        // 4. resize
        this._elBack.style.height = this._elFront.offsetHeight + 'px';
        this._elManualURL.style.height = (this._elManualURL.offsetHeight + this._elFront.offsetHeight - nInitialBackHeight) + 'px';

        // 5. position
        this._elBack.style.left = (-Math.floor(Math.abs(this._elBack.offsetWidth - this._elFront.offsetWidth) / 2)) + 'px';
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
     * Flip from QR-code to manual connect and back
     */
    flip: function()
    {
        // 1. toggle
        this._elRoot.classList.toggle('flip');
    }

};
