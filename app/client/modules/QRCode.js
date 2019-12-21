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


    // ----------------------------------------------------------------------------
    // --- Constructor ------------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Constructor
     */
    __construct: function (sTokenURL)
    {
        // 1. configure
        var typeNumber = 4;
        var errorCorrectionLevel = 'L';
        var qr = QRCodeGenerator(typeNumber, errorCorrectionLevel);
        qr.addData(sTokenURL);
        qr.make();
        document.getElementById('QRCode').innerHTML = qr.createImgTag(5);

        // 2. configure
        document.getElementById("QRCode").addEventListener(
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
    }

};
