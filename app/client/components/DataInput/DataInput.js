/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';


// import
const SocketIO = require('socket.io-client');
const Module_Crypto = require('asymmetric-crypto');

// import extenders
const EventDispatcherExtender = require('./../../../common/extenders/EventDispatcherExtender');


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
    _elInputText: null,
    _elInputFile: null,
    _elInputFileButton: null,
    _elInputFileInputfield: null,
    _elUploadProgress: null,

    // utils
    _aEvents: [],
    _aTabs: [],

    // events
    REQUEST_DATABROADCAST: 'onRequestDataBroadcast',

    // data types
    DATATYPE_PASSWORD: 'password',
    DATATYPE_TEXT: 'text',
    DATATYPE_FILE: 'file',

    // data
    _bValidated: false,
    _data: {},

    // states
    _bUnlocked: true,



    // ----------------------------------------------------------------------------
    // --- Constructor ------------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Constructor
     */
    __construct: function()
    {
        // 1. extend
        new EventDispatcherExtender(this);

        // 2. register
        this._elRoot = document.querySelector('[data-mimoto-id="component_DataInput"]');

        // 3. register
        this._elInputPassword = this._elRoot.querySelector('[data-mimoto-id="data_input_password"]');
        this._elInputText = this._elRoot.querySelector('[data-mimoto-id="data_input_text"]');
        this._elInputFile = this._elRoot.querySelector('[data-mimoto-id="data_input_file"]');
        this._elInputFileButton = this._elInputFile.querySelector('[data-mimoto-id="data_input_file_button"]');
        this._elInputFileInputfield = this._elInputFile.querySelector('[data-mimoto-id="data_input_file_inputfield"]');
        this._elUploadProgress = this._elRoot.querySelector('[data-mimoto-id="progress"]');
        this._elButtonSend = this._elRoot.querySelector('[data-mimoto-id="button_input_send"]');

        // 4. setup
        this._setupInput();
        this._setupTabMenu();

        // 5. init
        this._data.sType = this.DATATYPE_PASSWORD;
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

        // 2. refocus
        this._focusDataInput(this._data.sType);
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
     * Show progress of data transfer
     * @param nProgress
     */
    showTransferProgress: function(nProgress)
    {
        // 1. verify
        if (nProgress > 0 && nProgress < 1)
        {
            // a. update
            this._elUploadProgress.innerText = 'Sharing ' + Math.ceil(100 * nProgress) + '%';
        }
        else
        {
            // a. hide
            this._elUploadProgress.innerText = 'Sharing done!';

            // b. toggle output
            document.querySelector('[data-mimoto-id="sender_data_label_data"]').classList.remove('showProgress');
            document.querySelector('[data-mimoto-id="sender_data_label_data"]').classList.add('hideProgress');

            // c. time clearing of animation
            let timerCover = setTimeout(function()
            {
                // I. cleanup
                document.querySelector('[data-mimoto-id="sender_data_label_data"]').classList.remove('hideProgress');

                // II. toggle
                this._bUnlocked = true;
                this._elRoot.classList.add('unlocked');

            }.bind(this), 900);
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

        // 2. configure input: text
        this._elInputText.addEventListener('change', this._validateText.bind(this));
        this._elInputText.addEventListener('keyup', this._validateText.bind(this));
        this._elInputText.addEventListener('paste', this._validateText.bind(this));
        this._elInputText.addEventListener('input', this._validateText.bind(this));

        // 3. configure input: file
        this._elInputFileButton.addEventListener('click', function() { this._elInputFileInputfield.click(); }.bind(this));
        this._elInputFileInputfield.addEventListener('change', this._onSelectFile.bind(this));

        // 6. configure send button
        this._elButtonSend.addEventListener('click', this._onButtonSendClick.bind(this));
    },

    /**
     * Setup tab menu
     * @private
     */
    _setupTabMenu: function()
    {
        // 1. find
        let elSenderMenu = document.getElementById('sender_menu');

        // 2. store
        this._aTabs = document.querySelectorAll('.sender_menu_tab', elSenderMenu);

        // 3. manage
        for (let nTabIndex = 0; nTabIndex < this._aTabs.length; nTabIndex++)
        {
            // a. register
            let elTab = this._aTabs[nTabIndex];

            // b. configure
            elTab.addEventListener('click', function(sDataType)
            {
                // I. validate or skip
                if (!this._bUnlocked) return;

                // II. focus
                this._focusTab(sDataType);

            }.bind(this, elTab.getAttribute('data-type')));
        }
    },

    /**
     * Focus requested tab
     * @param sDataType
     * @private
     */
    _focusTab: function(sDataType)
    {
        // 1. validate
        if (this._data.sType === sDataType) return;

        // 2. disable
        this._toggleSendButton(false);

        // 3. cleanup
        this._discardAllInput();

        // 4. change focus
        for (let nTabIndex = 0; nTabIndex < this._aTabs.length; nTabIndex++)
        {
            // a. register
            let elTab = this._aTabs[nTabIndex];

            // b. verify
            if (elTab.getAttribute('data-type') === sDataType)
            {
                // 1. toggle
                elTab.classList.add('selected');

                // 2. focus
                this._focusDataInput(sDataType);
            }
            else
            {
                // I. toggle
                elTab.classList.remove('selected');
            }
        }
    },

    /**
     * Focus data input type
     * @param sDataType
     * @private
     */
    _focusDataInput: function(sDataType)
    {
        // 1. store
        this._data.sType = sDataType;

        // 2. init
        let aInputs = [this.DATATYPE_PASSWORD, this.DATATYPE_TEXT, this.DATATYPE_FILE];

        // 3. toggle state
        for (let nIndex = 0; nIndex < aInputs.length; nIndex++)
        {
            // a. register
            let sInputName = aInputs[nIndex];
            let elInput = this._elRoot.querySelector('[data-mimoto-id="data_input_' + sInputName + '"]');

            // b. verify
            if (sInputName === sDataType)
            {
                // I. store
                this._elCurrentDataInput = elInput;

                // II. show
                this._elCurrentDataInput.classList.add('selected');

                // III. focus
                switch(sDataType)
                {
                    case this.DATATYPE_PASSWORD:
                    case this.DATATYPE_TEXT:

                        // 1. auto-focus
                        this._elCurrentDataInput.focus();
                        break;

                    case this.DATATYPE_FILE:

                        // 1. auto open file select
                        this._elInputFileInputfield.click();
                        break;
                }
            }
            else
            {
                // I. hide
                elInput.classList.remove('selected');
            }
        }
    },

    _onSelectFile: function()
    {
        // 1. validate
        if (this._elInputFileInputfield.files && this._elInputFileInputfield.files[0])
        {
            // a. init
            var reader = new FileReader();

            // b. configure
            reader.onload = function(e)
            {
                // I. store
                this._data.value = {
                    fileName: this._elInputFileInputfield.files[0].name,
                    base64: e.target.result
                };

                // II. show
                this._elInputFile.querySelector('[data-mimoto-id="data_input_file_preview"]').classList.add('data_input_file_preview-visible');
                this._elInputFile.querySelector('[data-mimoto-id="data_input_file_preview_label"]').innerText = this._data.value.fileName;

                // III. toggle
                this._validateFile();

            }.bind(this);

            // c. load
            reader.readAsDataURL(this._elInputFileInputfield.files[0]);
        }
    },

    /**
     * Handle send button `click`
     * @private
     */
    _onButtonSendClick: function()
    {
        // 1. validate
        if (!this._bValidated) return;

        // 2. disable
        this._toggleSendButton(false);


        // --- show progress


        // 3. toggle
        this._bUnlocked = false;
        this._elRoot.classList.remove('unlocked');

        // 4. prepare
        this._elRoot.querySelector('[data-mimoto-id="sender_data_label_data"]').classList.add('showProgress');

        // 5. time clearing of value
        let timerValue = setTimeout(function()
        {
            // a. broadcast
            this.dispatchEvent(this.REQUEST_DATABROADCAST, this._data);

            // b. clear
            this._data.value = null;

            // c. cleanup
            this._discardAllInput(this._data.sType);

        }.bind(this), 600);
    },

    _discardAllInput: function(sType)
    {
        if (sType === this.DATATYPE_PASSWORD || !sType) this._elInputPassword.value = '';
        if (sType === this.DATATYPE_TEXT || !sType) this._elInputText.value = '';
        if (sType === this.DATATYPE_FILE || !sType)
        {
            this._elInputFile.querySelector('[data-mimoto-id="data_input_file_preview"]').classList.remove('data_input_file_preview-visible');
            this._elInputFileInputfield.value = null;
        }
    },

    _validatePassword: function()
    {
        // 1. toggle
        this._toggleSendButton(this._elInputPassword.value.length > 0);

        // 2. store
        this._data.value = this._elInputPassword.value;
    },

    _validateText: function()
    {
        // 1. toggle
        this._toggleSendButton(this._elInputText.value.length > 0);

        // 2. store
        this._data.value = this._elInputText.value;
    },

    _validateFile: function()
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
