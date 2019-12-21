/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';


// import
const QRCodeGenerator = require('qrcode-generator');
const SocketIO = require('socket.io-client');


module.exports = function(socket, sToken)
{
    // start
    this.__construct(socket, sToken);
};

module.exports.prototype = {

    // connection
    _socket: null,
    _sToken: '',
    _aTabs: [],
    _sCurrentDataType: '',
    _elCurrentDataInput: null,
    _elSenderInterface: null,
    _elInputPassword: null,
    _elInputURL: null,
    _elInputText: null,


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
        this._elSenderInterface = document.getElementById('interface-sender');
        this._elInputPassword = this._elSenderInterface.querySelector('[data-mimoto-id="data_input_password"]');
        this._elInputURL = this._elSenderInterface.querySelector('[data-mimoto-id="data_input_url"]');
        this._elInputText = this._elSenderInterface.querySelector('[data-mimoto-id="data_input_text"]');
        this._elButtonSend = this._elSenderInterface.querySelector('[data-mimoto-id="button_input_password"]');

        // validate
        if (!new RegExp(/^[0-9a-z]{32}$/g).test(this._sToken))
        {
            window.open('/', '_self');
            return;
        }
        else
        {
            // configure
            this._socket.on('token_not_found', function() { classRoot._onTokenNotFound(); });
            this._socket.on('token_connected', function() { classRoot._onTokenConnected(); });
            this._socket.on('receiver_disconnected', function() { classRoot._onReceiverDisconnected(); }); // #todo

            // connect
            this._socket.emit('connect_token', sToken);

            // show
            this._elSenderInterface.style.display = 'inline-block';




            this._elInputPassword.addEventListener('change', this._validatePassword.bind(this));
            this._elInputPassword.addEventListener('keyup', this._validatePassword.bind(this));
            this._elInputPassword.addEventListener('paste', this._validatePassword.bind(this));
            this._elInputPassword.addEventListener('inout', this._validatePassword.bind(this));

            this._elInputURL.addEventListener('change', this._validateURL.bind(this));
            this._elInputURL.addEventListener('keyup', this._validateURL.bind(this));
            this._elInputURL.addEventListener('paste', this._validateURL.bind(this));
            this._elInputURL.addEventListener('inout', this._validateURL.bind(this));

            this._elInputText.addEventListener('change', this._validateText.bind(this));
            this._elInputText.addEventListener('keyup', this._validateText.bind(this));
            this._elInputText.addEventListener('paste', this._validateText.bind(this));
            this._elInputText.addEventListener('inout', this._validateText.bind(this));


            document.getElementById('data_input_image_file').addEventListener('change', function() {

                console.log('Uploaded!');

                let imageInput = document.getElementById('data_input_image_file');

                if (imageInput.files && imageInput.files[0])
                {

                    var reader = new FileReader();

                    reader.onload = function(e) {

                        console.log('File found', imageInput.files[0].name, e.target.result);

                        //$('#blah').attr('src', e.target.result);

                        document.getElementById('data_input_document_preview').setAttribute('src', e.target.result);
                    };

                    reader.readAsDataURL(imageInput.files[0]);
                }

            }.bind(this));



            this._elButtonSend.addEventListener('click', function(){


                // validate
                if (this._elButtonSend.classList.contains('disabled')) return;


                // validate input ipv contains(class)


                let value = null;

                switch(this._sCurrentDataType)
                {
                    case 'password':
                    case 'url':
                    case 'text':

                        // read
                        value = this._elCurrentDataInput.value;

                        // clear
                        this._elCurrentDataInput.value = '';

                        break;

                    case 'image':

                        // read
                        value = document.getElementById('data_input_document_preview').getAttribute('src');

                        // clear
                        document.getElementById('data_input_document_preview').remove();

                        break;

                    case 'document':

                        value = this._elCurrentDataInput.getElementById('data_input_document_file').value;
                        break;
                }

                console.log('Type = ' + this._sCurrentDataType, 'value = ' + value);


                // disable
                this._toggleSendButton(false);


                this._socket.emit('data', { sType:this._sCurrentDataType, value:value, sToken:sToken });




            }.bind(this));


            this._setupTabMenu();
        }


        // 4. open url (also show URL)
        // 6. show version in bottom/footer
        // 7. onConnect remove QR code -> you are now connected -> check 4 character code
        // 8. change URL to token
        // 10. register token in server
    },


    _getDataUri: function(url, callback) {

        var image = new Image();

        image.onload = function () {
            var canvas = document.createElement('canvas');
            canvas.width = this.naturalWidth; // or 'width' if you want a special/scaled size
            canvas.height = this.naturalHeight; // or 'height' if you want a special/scaled size

            canvas.getContext('2d').drawImage(this, 0, 0);

            // Get raw image data
            callback(canvas.toDataURL('image/png').replace(/^data:image\/(png|jpg);base64,/, ''));

            // ... or get as Data URI
            callback(canvas.toDataURL('image/png'));
        };

        image.src = url;
    },





    _onTokenNotFound: function()
    {
        console.log('Sender: Token not found');
    },

    _onTokenConnected: function()
    {
        console.log('Sender: Token connected');
    },



    // --------


    _setupTabMenu: function()
    {
        // find
        let elSenderMenu = document.getElementById('sender_menu');

        // store
        this._aTabs = document.querySelectorAll('.sender_menu_tab', elSenderMenu);

        //
        for (let nTabIndex = 0; nTabIndex < this._aTabs.length; nTabIndex++)
        {
            // register
            let elTab = this._aTabs[nTabIndex];

            elTab.addEventListener('click', function(sDataType)
            {
                // focus
                this._focusTab(sDataType);

                // toggle
                this._focusDataInput(sDataType);

            }.bind(this, elTab.getAttribute('data-type')));
        }

        this._focusDataInput('password');
    },

    _focusTab: function(sDataType)
    {

        for (let nTabIndex = 0; nTabIndex < this._aTabs.length; nTabIndex++)
        {
            // register
            let elTab = this._aTabs[nTabIndex];

            if (elTab.getAttribute('data-type') === sDataType)
            {
                elTab.classList.add('selected');

                this._focusDataInput(sDataType);
            }
            else
            {
                elTab.classList.remove('selected');
            }
        }
    },

    _focusDataInput: function(sDataType)
    {
        // store
        this._sCurrentDataType = sDataType;

        // init
        let aInputs = ['data_input_password', 'data_input_url', 'data_input_text', 'data_input_image', 'data_input_document'];

        for (let nIndex = 0; nIndex < aInputs.length; nIndex++)
        {
            // register
            let sInputName = aInputs[nIndex];
            let elInput = this._elSenderInterface.querySelector('[data-mimoto-id="' + sInputName + '"]');

            if (aInputs[nIndex] === 'data_input_' + sDataType)
            {
                // store
                this._elCurrentDataInput = elInput;

                // show
                this._elCurrentDataInput.classList.add('selected');
            }
            else
            {
                // hide
                elInput.classList.remove('selected');
            }

        }
    },


    _validatePassword: function()
    {
        // 1. toggle
        this._toggleSendButton(this._elInputPassword.value.length > 0);
    },

    _validateURL: function()
    {
        // 1. init
        var expression = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;
        var regex = new RegExp(expression);

        // 2. toggle
        this._toggleSendButton(this._elInputURL.value.match(regex));
    },

    _validateText: function()
    {
        // 1. toggle
        this._toggleSendButton(this._elInputText.value.length > 0);
    },


    _toggleSendButton: function(bEnable)
    {
        if (bEnable)
        {
            this._elButtonSend.classList.remove('disabled');
        }
        else
        {
            this._elButtonSend.classList.add('disabled');
        }
    }

};
