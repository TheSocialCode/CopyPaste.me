/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';


// import
const QRCodeGenerator = require('qrcode-generator');


module.exports = function(socket, sToken)
{
    // start
    this.__construct(socket, sToken);
};

module.exports.prototype = {

    // connection
    _socket: null,
    _sToken: '',


    // ----------------------------------------------------------------------------
    // --- Constructor ------------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Constructor
     */
    __construct: function (socket, sToken)
    {
        // store
        this._socket = socket;
        this._sToken = sToken;

        // register
        let classRoot = this;

        // configure
        this._socket.on('token', function(sToken) { classRoot._setupToken(sToken); });
        this._socket.on('data-password', function(sPassword) { classRoot._showPassword(sPassword); });
        this._socket.on('sender_connected', function() { classRoot._onSenderConnected(); });

        this._socket.on('connect_error', function(err) {
            // handle server error here
            console.log('Error connecting to server');
        });

        // show
        document.getElementById('interface-receiver').style.display = 'inline-block';
    },


    _setupToken: function (sToken)
    {
        // setup
        let sURL = 'http://copypaste.local/' + sToken;

        var typeNumber = 4;
        var errorCorrectionLevel = 'L';
        var qr = QRCodeGenerator(typeNumber, errorCorrectionLevel);
        qr.addData(sURL);
        qr.make();
        document.getElementById('QRCode').innerHTML = qr.createImgTag(5);


        // store
        this._sToken = sToken;


        document.getElementById("QRCode").addEventListener(
            'click',
            function(e)
            {
                // copy to clipboard
                const el = document.createElement('textarea');
                el.value = sURL;
                document.body.appendChild(el);
                el.select();
                document.execCommand('copy');
                document.body.removeChild(el);

            }.bind(this, sURL)
        );




        //document.getElementById("token_url").innerHTML = sURL;

        // document.getElementById("content").innerHTML = response.html;
        // document.title = response.pageTitle;
        // if (window.history.pushState) {
        //     window.history.pushState({}, null, "/" + sToken);
        // }
    },


    _onSenderConnected: function()
    {
        console.log('Sender connected');

        document.getElementById('QR-holder').style.display = 'none';

    },

    _showPassword: function (sPassword)
    {
        // // init
        // var newEl = document.createElement('div');
        //
        // // configure
        // newEl.setAttribute('class', 'password');
        //
        // // output
        // document.getElementById('transferredData').appendChild(newEl);


        document.getElementById('transferredData').style.display = 'block';


        console.log('Password received:', sPassword);


        document.getElementById('received_data_label_data').setAttribute('data-data', sPassword); // #todo alter to encrypted js
        document.getElementById('received_data_label_data').innerText = '*******';
        document.getElementById('received_data_button').addEventListener('click', this._onClickCopyToClipboard);
    },

    _onClickCopyToClipboard: function()
    {
        // copy to clipboard
        const el = document.createElement('textarea');
        el.value = document.getElementById('received_data_label_data').getAttribute('data-data');
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);



        // register
        let elTooltip = document.getElementById('tooltip');

        elTooltip.classList.remove('tooltip-fade');
        elTooltip.style.display = 'inline-block';
        //elTooltip.style.opacity = 0.5;

        elTooltip.classList.add('tooltip-fade');
    }

};
