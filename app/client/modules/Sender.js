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
    _aTabs: [],
    _elCurrentDataInput: null,
    _elSenderInterface: null,
    _elInputPassword: null,
    _elInputURL: null,
    _elInputText: null,
    _bValidated: false,
    _data: {},


    // ----------------------------------------------------------------------------
    // --- Constructor ------------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Constructor
     */
    __construct: function (socket, sToken)
    {
        // 1. store
        this._socket = socket;
        this._data.sToken = sToken;

        // 2. register
        this._elSenderInterface = document.querySelector('[data-mimoto-id="interface-sender"]');
        this._elInputPassword = this._elSenderInterface.querySelector('[data-mimoto-id="data_input_password"]');
        this._elInputURL = this._elSenderInterface.querySelector('[data-mimoto-id="data_input_url"]');
        this._elInputText = this._elSenderInterface.querySelector('[data-mimoto-id="data_input_text"]');
        this._elButtonSend = this._elSenderInterface.querySelector('[data-mimoto-id="button_input_password"]');

        // 3. validate
        if (!new RegExp(/^[0-9a-z]{32}$/g).test(this._data.sToken))
        {
            // a. open
            window.open('/', '_self');
            return;
        }
        else
        {
            // a. configure
            this._socket.on('token_not_found', this._onTokenNotFound.bind(this));
            this._socket.on('token_connected', this._onTokenConnected.bind(this));
            this._socket.on('token_reconnected', this._onTokenReconnected.bind(this));
            this._socket.on('receiver_disconnected', this._onReceiverDisconnected.bind(this));
            this._socket.on('receiver_reconnected', this._onReceiverReconnected.bind(this));

            // c. show
            this._elSenderInterface.style.display = 'inline-block'; // #todo add class ipv style

            // d. setup
            this._setupInput();
            this._setupTabMenu();
        }
    },



    // ----------------------------------------------------------------------------
    // --- Public methods ---------------------------------------------------------
    // ----------------------------------------------------------------------------


    connect: function()
    {
        // 1, broadcast
        this._socket.emit('sender_connect_to_token', this._data.sToken);
    },

    reconnect: function()
    {
        // 1, broadcast
        this._socket.emit('sender_reconnect_to_token', this._data.sToken);
    },



    // ----------------------------------------------------------------------------
    // --- Event ------------------------------------------------------------------
    // ----------------------------------------------------------------------------


    _onTokenNotFound: function()
    {
        this._showAlertMessage('The link you are trying to use is not working. Please try again.', true);
    },

    _onTokenConnected: function()
    {
        //console.log('Sender: Token connected');
    },

    _onTokenReconnected: function()
    {
        //console.log('Sender: Token reconnected');
    },

    _onReceiverDisconnected: function()
    {
        this._showAlertMessage('The receiving device is not connected. Is it still online?', true);
    },

    _onReceiverReconnected: function()
    {
        this._hideAlertMessage();
    },



    // ----------------------------------------------------------------------------
    // --- Private methods --------------------------------------------------------
    // ----------------------------------------------------------------------------


    _setupInput: function()
    {
        // 1. configure input: password
        this._elInputPassword.addEventListener('change', this._validatePassword.bind(this));
        this._elInputPassword.addEventListener('keyup', this._validatePassword.bind(this));
        this._elInputPassword.addEventListener('paste', this._validatePassword.bind(this));
        this._elInputPassword.addEventListener('input', this._validatePassword.bind(this));

        // 2. configure input: URL
        this._elInputURL.addEventListener('change', this._validateURL.bind(this));
        this._elInputURL.addEventListener('keyup', this._validateURL.bind(this));
        this._elInputURL.addEventListener('paste', this._validateURL.bind(this));
        this._elInputURL.addEventListener('input', this._validateURL.bind(this));

        // 3. configure input: text
        this._elInputText.addEventListener('change', this._validateText.bind(this));
        this._elInputText.addEventListener('keyup', this._validateText.bind(this));
        this._elInputText.addEventListener('paste', this._validateText.bind(this));
        this._elInputText.addEventListener('input', this._validateText.bind(this));

        // 4. configure input: image & document
        document.getElementById('data_input_image_file').addEventListener('change', this._onSelectImage.bind(this));
        document.getElementById('data_input_document_file').addEventListener('change', this._onSelectDocument.bind(this));

        // 5. configure send button
        this._elButtonSend.addEventListener('click', this._onButtonSendClick.bind(this));
    },

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
        // 1. cleanup
        this._discardAllInput();

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
        this._data.sType = sDataType;

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

    _onSelectImage: function()
    {
        // 1. find
        let imageInput = document.getElementById('data_input_image_file');

        // 2. validate
        if (imageInput.files && imageInput.files[0])
        {
            // a. init
            var reader = new FileReader();

            // b. configure
            reader.onload = function(e)
            {
                // I. store
                this._data.value = {
                    fileName: imageInput.files[0].name,
                    base64: e.target.result
                };

                // II. show
                document.getElementById('data_input_document_preview').setAttribute('src', e.target.result);

                // III. toggle
                this._validateImage();

            }.bind(this);

            // reader.onerror = function (error) { console.log('Error: ', error); };

            // c. load
            reader.readAsDataURL(imageInput.files[0]);
        }
    },

    _onSelectDocument: function()
    {
        // 1. find
        let documentInput = document.getElementById('data_input_document_file');

        // 2. validate
        if (documentInput.files && documentInput.files[0])
        {
            // a. init
            var reader = new FileReader();

            // b. configure
            reader.onload = function(e)
            {
                // I. store
                this._data.value = {
                    fileName: documentInput.files[0].name,
                    base64: e.target.result
                };

                // II. show
                // ...

                // III. toggle
                this._validateDocument();

            }.bind(this);

            // reader.onerror = function (error) { console.log('Error: ', error); };

            // c. load
            reader.readAsDataURL(documentInput.files[0]);
        }
    },

    _onButtonSendClick: function()
    {
        // 1. validate
        if (!this._bValidated) return;

        // 2. disable
        this._toggleSendButton(false);

        // 3. broadcast
        this._socket.emit('data', this._data);

        // 4. clear
        this._data.value = null;

        // 5. cleanup
        this._clearInput();
    },

    _clearInput: function()
    {
        // 1. prepare
        document.querySelector('[data-mimoto-id="sender_data_label_data"]').classList.add('clear');

        // 2. time clearing of value
        let timerValue = setTimeout(function()
        {
            this._discardAllInput(this._data.sType);

        }.bind(this), 600);

        // 3. time clearing of animation
        let timerCover = setTimeout(function()
        {
            // a. cleanup
            document.querySelector('[data-mimoto-id="sender_data_label_data"]').classList.remove('clear');

        }.bind(this), 1200);
    },

    _discardAllInput: function(sType)
    {
        if (sType === 'password' || !sType) this._elInputPassword.value = '';
        if (sType === 'url' || !sType) this._elInputURL.value = '';
        if (sType === 'text' || !sType) this._elInputText.value = '';
        if (sType === 'image' || !sType)
        {
            //document.getElementById('data_input_image_preview').remove();
        }
        if (sType === 'document' || !sType)
        {
            //document.getElementById('data_input_document_preview').remove();
        }
    },

    _validatePassword: function()
    {
        // 1. toggle
        this._toggleSendButton(this._elInputPassword.value.length > 0);

        // 2. store
        this._data.value = this._elInputPassword.value;
    },

    _validateURL: function()
    {
        // 1. init
        var expression = /(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;
        var regex = new RegExp(expression);

        // 2. toggle
        this._toggleSendButton(this._elInputURL.value.match(regex));

        // 3. init
        var protocolExpression = /(https?:\/\/)/gi;
        var protocolRegex = new RegExp(protocolExpression);

        // 4. store
        if (!this._elInputURL.value.match(protocolRegex))
        {
            this._data.value = 'https://' + this._elInputURL.value;
        }
        else
        {
            this._data.value = this._elInputURL.value;
        }
    },

    _validateText: function()
    {
        // 1. toggle
        this._toggleSendButton(this._elInputText.value.length > 0);

        // 2. store
        this._data.value = this._elInputText.value;
    },

    _validateImage: function()
    {
        // 1. toggle
        this._toggleSendButton(true);
    },

    _validateDocument: function()
    {
        // 1. toggle
        this._toggleSendButton(true);
    },


    _toggleSendButton: function(bEnable)
    {
        if (bEnable)
        {
            this._elButtonSend.classList.remove('disabled');
            this._bValidated = true;
        }
        else
        {
            this._elButtonSend.classList.add('disabled');
            this._bValidated = false;
        }
    },


    _showAlertMessage(sMessage, bDisableInterface)
    {
        // 1. register
        let elAlertMessage = document.querySelector('[data-mimoto-id="alertmessage"]');

        // 2. show
        elAlertMessage.style.display = 'inline-block';

        // 3. output
        elAlertMessage.innerHTML = sMessage;

        // 4. hide
        if (bDisableInterface) document.querySelector('[data-mimoto-id="interface-sender"]').style.display = 'none';
    },

    _hideAlertMessage()
    {
        let elAlertMessage = document.querySelector('[data-mimoto-id="alertmessage"]');

        // 2. show
        elAlertMessage.style.display = 'none';
    }

};
