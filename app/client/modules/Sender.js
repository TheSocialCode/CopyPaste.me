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
            document.getElementById('interface-sender').style.display = 'inline-block';


            document.getElementById('button_input_password').addEventListener('click', function(){


                // todo
                // 1. disable button on empty value
                // 2. option to clear value
                // 3. clear value after send


                let value = null;

                switch(this._sCurrentDataType)
                {
                    case 'password':
                    case 'url':
                    case 'text':

                        value = this._elCurrentDataInput.value;
                        break;

                    case 'image':

                        value = document.getElementById('data_input_image_file', this._elCurrentDataInput).value;
                        break;

                    case 'document':

                        value = document.getElementById('data_input_document_file', this._elCurrentDataInput).value;
                        break;
                }

                console.log('Type = ' + this._sCurrentDataType, 'value = ' + value);

                this._socket.emit('data', { sType:this._sCurrentDataType, value:value, sToken:sToken });


                // rooms


            }.bind(this));


            this._setupTabMenu();
        }


        // 4. open url (also show URL)
        // 6. show version in bottom/footer
        // 7. onConnect remove QR code -> you are now connected -> check 4 character code
        // 8. change URL to token
        // 10. register token in server
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
            let elInput = document.getElementById(sInputName);

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
    }

};
