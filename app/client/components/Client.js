/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';


// import
const SocketIO = require('socket.io-client');
const QRCode = require('./QRCode/QRCode');
const DataOutput = require('./DataOutput/DataOutput');
const DataInput = require('./DataInput/DataInput');
const Module_Crypto = require('asymmetric-crypto');
const ToggleDirection = require('./ToggleDirection/ToggleDirection');
const AlertMessage = require('./AlertMessage/AlertMessage');


module.exports = function(sGateway)
{
    // start
    this.__construct(sGateway);
};

module.exports.prototype = {

    // connection
    _socket: null,
    _sToken: '',
    _bIsPrimaryDevice: null,
    _sDirection: ToggleDirection.prototype.DEFAULT,

    // components
    _qrcode: null,
    _dataOutput: null,
    _dataInput: null,
    _alertMessage: null,
    _toggleDirection: null,

    // security
    _myKeyPair: null,
    _sTheirPublicKey: '',

    // views
    _elRoot: null,



    // ----------------------------------------------------------------------------
    // --- Constructor ------------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Constructor
     */
    __construct: function (sGateway)
    {
        // 1. create
        this._myKeyPair = Module_Crypto.keyPair();

        // 2. register
        this._elRoot = document.querySelector('[data-mimoto-id="component_Client"]');

        // 3. setup
        this._socket = new SocketIO(sGateway, {secure: true });

        // 4. configure
        this._socket.on('connect', this._onSocketConnect.bind(this));
        this._socket.on('connect_failed', this._socketConnectFailed.bind(this));
        this._socket.on('connect_error', this._onSocketConnectError.bind(this));
        this._socket.on('disconnect', this._onSocketDisconnect.bind(this));
        this._socket.on('security_compromised', this._onSecurityCompromised.bind(this));
        this._socket.on('data', this._onData.bind(this));

        // 5. register
        this._sToken = window.location.href.substr(window.location.href.lastIndexOf('/') + 1);

        // 6. init
        if (!this._sToken || this._sToken.length === 0)
        {
            // a. setup
            this._setupDevice(true);
        }
        else
        {
            // a. validate
            if (!new RegExp(/^[0-9a-z]{32}$/g).test(this._sToken))
            {
                // I. open
                window.open('/', '_self');
                return;
            }

            // b. setup
            this._setupDevice(false);
        }

        // 7. run
        this._socket.connect();
    },



    // ----------------------------------------------------------------------------
    // --- Event handlers - Socket ------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Handle event `connect`
     * @private
     */
    _onSocketConnect: function ()
    {
        // 1. hide
        this._alertMessage.hide();

        // 2. toggle
        if (this._bIsPrimaryDevice)
        {
            // a. validate
            if (!this._sToken)
            {
                // I. request
                this._socket.emit('primarydevice_request_token', this._myKeyPair.publicKey);
            }
            else
            {
                // I. request
                this._socket.emit('primarydevice_reconnect_to_token', this._sToken);
            }
        }
        else
        {
            // a. broadcast
            this._socket.emit('secondarydevice_connect_to_token', this._sToken, this._myKeyPair.publicKey);
        }
    },

    /**
     * Handle event `connect_failed`
     * @private
     */
    _socketConnectFailed: function()
    {
        this._alertMessage.show('Connection failed. Please try again later!');
    },

    /**
     * Handle event `connect_error`
     * @param err
     * @private
     */
    _onSocketConnectError: function(err)
    {
        this._alertMessage.show('Error connecting to server. Please try again!');
    },

    /**
     * Handle event `disconnect`
     * @private
     */
    _onSocketDisconnect: function()
    {
        this._alertMessage.show('Connection with server was lost .. reconnecting ..');
    },



    // ----------------------------------------------------------------------------
    // --- Event handlers: Security -----------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Handle event `security_compromised`
     * @private
     */
    _onSecurityCompromised: function()
    {
        // 1. disconnect
        delete this._socket;

        // 2. disable interface
        document.querySelector('[data-mimoto-id="component_Client"]').remove();

        // 3. swap logo
        document.querySelector('[data-mimoto-id="logo"]').src = 'static/images/copypaste-logo-white.png';

        // 4. show warning
        document.body.classList.add('security_compromised');

    },


    // ----------------------------------------------------------------------------
    // --- Event handlers: Data ---------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Handle event `DataInput.REQUEST_DATABROADCAST`
     * @param data
     * @private
     */
    _onRequestDataBroadcast: function(data)
    {
        // 3. verify
        if (data.sType === DataInput.prototype.DATATYPE_PASSWORD || data.sType === DataInput.prototype.DATATYPE_TEXT)
        {
            // a. clone
            let encryptedData = JSON.parse(JSON.stringify(data));

            // b. encrypt
            encryptedData.value = Module_Crypto.encrypt(data.value, this._sTheirPublicKey, this._myKeyPair.secretKey);

            // c. broadcast
            this._socket.emit('data', encryptedData);
        }
        else
        {
            // a. broadcast
            this._socket.emit('data', data);
        }
    },

    /**
     * Handle event `data`
     * @param data
     * @private
     */
    _onData: function(encryptedData)
    {
        // 1. copy
        let data = encryptedData;

        // 2. verify
        if (encryptedData.sType === DataInput.prototype.DATATYPE_PASSWORD || encryptedData.sType === DataInput.prototype.DATATYPE_TEXT)
        {
            // a. clone
            data = JSON.parse(JSON.stringify(encryptedData));

            // d. decrypt
            data.value = Module_Crypto.decrypt(encryptedData.value.data, encryptedData.value.nonce, this._sTheirPublicKey, this._myKeyPair.secretKey);
        }

        // 3. forward
        this._dataOutput.showData(data);
    },




    /**
     * Handle event `request_toggle_direction`
     * @private
     */
    _onRequestToggleDirection: function()
    {
        // 1. broadcast
        this._socket.emit(ToggleDirection.prototype.REQUEST_TOGGLE_DIRECTION);
    },

    /**
     * Handle event `toggle_direction`
     * @param sDirection
     * @private
     */
    _onToggleDirection: function(sDirection)
    {
        // 1. store
        this._sDirection = sDirection;

        // 2. verify
        if (sDirection !== ToggleDirection.prototype.SWAPPED)
        {
            // a. toggle visibility
            if (this._bIsPrimaryDevice)
            {
                this._toggleDirection.show();
                this._dataInput.hide();
                this._dataOutput.unmute();
                this._dataOutput.show();
            }
            else
            {
                this._toggleDirection.hide();
                this._dataInput.show();
                this._dataOutput.mute();
                this._dataOutput.hide();
            }
        }
        else
        {
            // a. toggle visibility
            if (this._bIsPrimaryDevice)
            {
                this._toggleDirection.hide();
                this._dataInput.show();
                this._dataOutput.mute();
                this._dataOutput.hide();
            }
            else
            {
                this._toggleDirection.show();
                this._dataInput.hide();
                this._dataOutput.unmute();
                this._dataOutput.show();
            }
        }
    },



    // ----------------------------------------------------------------------------
    // --- Private methods --------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Setup this client's device
     * @param bIsPrimaryDevice
     * @private
     */
    _setupDevice: function(bIsPrimaryDevice)
    {
        // 1. set state
        this._bIsPrimaryDevice = bIsPrimaryDevice;

        // 2. toggle
        if (this._bIsPrimaryDevice)
        {
            // a. configure
            this._socket.on('token', this._onReceiveToken.bind(this));
            this._socket.on('token_not_found', this._onPrimaryDeviceTokenNotFound.bind(this));
        }
        else
        {
            // a. configure
            this._socket.on('token_not_found', this._onSecondaryDeviceTokenNotFound.bind(this));
        }

        // 3. configure primary device
        this._socket.on('secondarydevice_connected', this._onSecondaryDeviceConnected.bind(this));
        this._socket.on('secondarydevice_disconnected', this._onSecondaryDeviceDisconnected.bind(this));
        this._socket.on('secondarydevice_reconnected', this._onSecondaryDeviceReconnected.bind(this));

        // 4. configure secondary device
        this._socket.on('token_connected', this._onSecondaryDeviceConnectedToToken.bind(this));
        this._socket.on('primarydevice_disconnected', this._onPrimaryDeviceDisconnected.bind(this));
        this._socket.on('primarydevice_reconnected', this._onPrimaryDeviceReconnected.bind(this));


        // --- data output


        // 5. init
        this._dataOutput = new DataOutput();


        // --- data input

        // 6. init
        this._dataInput = new DataInput();

        // 7. configure
        this._dataInput.addEventListener(DataInput.prototype.REQUEST_DATABROADCAST, this._onRequestDataBroadcast.bind(this));


        // --- alert message

        // 8. setup
        this._alertMessage = new AlertMessage();


        // --- toggle direction

        // 9. init
        this._toggleDirection = new ToggleDirection();

        // 10. configure
        this._socket.on(ToggleDirection.prototype.TOGGLE_DIRECTION, this._onToggleDirection.bind(this));

        // 11. configure
        this._toggleDirection.addEventListener(ToggleDirection.prototype.REQUEST_TOGGLE_DIRECTION, this._onRequestToggleDirection.bind(this));
    },



    // ----------------------------------------------------------------------------
    // --- Event handlers - runtime -----------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Handle event `token`
     * @param sToken
     * @private
     */
    _onReceiveToken: function (sToken)
    {
        // 1. store
        this._sToken = sToken;

        // 2. create
        this._qrcode = new QRCode(window.location.protocol + '//' + window.location.hostname + '/' + this._sToken);

        // 3. show
        this._qrcode.show();
    },

    /**
     * Handle event `token_not_found`
     * @private
     */
    _onPrimaryDeviceTokenNotFound: function()
    {
        // 1. hide
        this._dataInput.hide();
        this._toggleDirection.hide();

        // 2. output
        this._alertMessage.show('This session expired. <a href="/">Reload</a> this page to make a new connection.', true);
    },

    /**
     * Handle `secondarydevice_disconnected`
     * @private
     */
    _onSecondaryDeviceTokenNotFound: function()
    {
        // 1. toggle visibility
        this._dataInput.hide();
        this._toggleDirection.hide();

        // 2. output
        this._alertMessage.show('The link you are trying to use is not working. Please try again.', true);
    },

    /**
     * Handle event `secondarydevice_connected`
     * @param sSenderPublicKey
     * @private
     */
    _onSecondaryDeviceConnected: function(sSenderPublicKey)
    {
        // 1. store
        this._sTheirPublicKey = sSenderPublicKey;

        // 2. toggle visibility
        this._alertMessage.hide();
        this._qrcode.hide();
        this._dataOutput.show();
        if (this._isOutputDevice()) this._toggleDirection.show();
    },

    /**
     * Handle event `secondarydevice_disconnected`
     * @private
     */
    _onSecondaryDeviceDisconnected: function()
    {
        // 1. toggle visibility
        this._dataOutput.hide();
        this._toggleDirection.hide();

        // 2. output
        this._alertMessage.show("The other device has been disconnected. Is it still online?");
    },

    /**
     * Handle event `secondarydevice_reconnected`
     * @private
     */
    _onSecondaryDeviceReconnected: function()
    {
        // 1. toggle visibility
        this._alertMessage.hide();
        this._dataOutput.show();
        if (this._isOutputDevice()) this._toggleDirection.show();
    },

    _onPrimaryDeviceDisconnected: function()
    {
        // 1. toggle visibility
        this._dataOutput.hide();
        this._toggleDirection.hide();

        // 2. output
        this._alertMessage.show('The other device has been disconnected. Is it still online?');
    },

    _onPrimaryDeviceReconnected: function()
    {
        // 1. toggle visibility
        this._alertMessage.hide();
        this._dataOutput.show();
        if (this._isOutputDevice()) this._toggleDirection.show();
    },

    _onTokenNotFound: function()
    {
        // 1. toggle visibility
        this._dataOutput.hide();
        this._toggleDirection.hide();

        // 2. output
        this._alertMessage.show('The link you are trying to use is not working. Please try again.', true);
    },

    _onSecondaryDeviceConnectedToToken: function(sPrimaryDevicePublicKey)
    {
        // 1. store
        this._sTheirPublicKey = sPrimaryDevicePublicKey;

        // 2. toggle visibility
        this._dataInput.show();
        if (this._isOutputDevice()) this._toggleDirection.show();
    },

    _onTokenReconnected: function()
    {
        //console.log('Sender: Token reconnected');
    },

    /**
     * Check is the current device is the output device
     * @returns {boolean}
     * @private
     */
    _isOutputDevice: function()
    {
        // 1. verify
        if (this._sDirection !== ToggleDirection.prototype.SWAPPED)
        {
            // a. verify and send
            if (this._bIsPrimaryDevice) return true;
        }
        else
        {
            // a. verify and send
            if (!this._bIsPrimaryDevice) return true;
        }

        // 2. send default
        return false;
    }
};
