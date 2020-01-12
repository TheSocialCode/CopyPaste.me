/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';


// import
const SocketIO = require('socket.io-client');
const Module_Crypto = require('asymmetric-crypto');


module.exports = function()
{
    // start
    this.__construct();
};

module.exports.prototype = {

    // views
    _elRoot: null,
    _elCurrentDataInput: null,
    _elInputPassword: null,
    _elInputURL: null,
    _elInputText: null,
    _elInputImage: null,
    _elInputDocumnent: null,

    // utils
    _aEvents: [],
    _aTabs: [],

    // events
    REQUEST_DATABROADCAST: 'onRequestDataBroadcast',

    // data types
    DATATYPE_PASSWORD: 'password',
    DATATYPE_URL: 'url',
    DATATYPE_TEXT: 'text',
    DATATYPE_IMAGE: 'image',
    DATATYPE_DOCUMENT: 'document',

    // data
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
        this._elRoot = document.querySelector('[data-mimoto-id="component_DataInput"]');

        // 3. register
        this._elInputPassword = this._elRoot.querySelector('[data-mimoto-id="data_input_password"]');
        this._elInputURL = this._elRoot.querySelector('[data-mimoto-id="data_input_url"]');
        this._elInputText = this._elRoot.querySelector('[data-mimoto-id="data_input_text"]');
        this._elInputImage = this._elRoot.querySelector('[data-mimoto-id="data_input_image"]');
        this._elInputDocument = this._elRoot.querySelector('[data-mimoto-id="data_input_document"]');
        this._elButtonSend = this._elRoot.querySelector('[data-mimoto-id="button_input_send"]');

        // 4. setup
        this._setupInput();
        this._setupTabMenu();
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
    },

    /**
     * Add event listener
     * @param sEvent
     * @param fMethod
     */
    addEventListener: function(sEvent, fMethod)
    {
        // 1. verify or init
        if (!this._aEvents[sEvent]) this._aEvents[sEvent] = [];

        // 2. store
        this._aEvents[sEvent].push(fMethod);
    },

    /**
     * dispatch event
     * @param sEvent
     */
    dispatchEvent: function(sEvent)
    {
        // 1. validate
        if (this._aEvents[sEvent])
        {
            // a. find
            let nMethodCount = this._aEvents[sEvent].length;
            for (let nIndex = 0; nIndex < nMethodCount; nIndex++)
            {
                // I. register
                let fMethod = this._aEvents[sEvent][nIndex];

                // II. execute
                fMethod.apply(this, Array.prototype.slice.call(arguments, 1));
            }
        }
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

                console.log('TAB click', sDataType);

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
        let aInputs = [this.DATATYPE_PASSWORD, this.DATATYPE_URL, this.DATATYPE_TEXT, this.DATATYPE_IMAGE, this.DATATYPE_DOCUMENT];

        for (let nIndex = 0; nIndex < aInputs.length; nIndex++)
        {
            // register
            let sInputName = aInputs[nIndex];
            let elInput = this._elRoot.querySelector('[data-mimoto-id="data_input_' + sInputName + '"]');

            if (aInputs[nIndex] === sDataType)
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
               this._elInputImage.querySelector('[data-mimoto-id="data_input_image_preview"]').classList.add('data_input_image_preview-visible');
               this._elInputImage.querySelector('[data-mimoto-id="data_input_image_preview_image"]').setAttribute('src', this._data.value.base64);
               this._elInputImage.querySelector('[data-mimoto-id="data_input_image_preview_label"]').innerText = this._data.value.fileName;

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
                this._elInputDocument.querySelector('[data-mimoto-id="data_input_document_preview"]').classList.add('data_input_document_preview-visible');
                this._elInputDocument.querySelector('[data-mimoto-id="data_input_document_preview_label"]').innerText = this._data.value.fileName;

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
        this.dispatchEvent(this.REQUEST_DATABROADCAST, this._data);

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
        if (sType === this.DATATYPE_PASSWORD || !sType) this._elInputPassword.value = '';
        if (sType === this.DATATYPE_URL || !sType) this._elInputURL.value = '';
        if (sType === this.DATATYPE_TEXT || !sType) this._elInputText.value = '';
        if (sType === this.DATATYPE_IMAGE || !sType)
        {
            this._elInputImage.querySelector('[data-mimoto-id="data_input_image_preview"]').classList.remove('data_input_image_preview-visible');
        }
        if (sType === this.DATATYPE_DOCUMENT || !sType)
        {
            this._elInputDocument.querySelector('[data-mimoto-id="data_input_document_preview"]').classList.remove('data_input_document_preview-visible');
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
    }

};
