/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';


// import
const SocketIO = require('socket.io-client');
const Connector = require('./Connector/Connector');
const DataOutput = require('./DataOutput/DataOutput');
const DataInput = require('./DataInput/DataInput');
const Module_Crypto = require('asymmetric-crypto');
const Module_GenerateUniqueID = require('generate-unique-id');
const ToggleDirectionButton = require('./ToggleDirectionButton/ToggleDirectionButton');
const ToggleDirectionEvents = require('./ToggleDirectionButton/ToggleDirectionEvents');
const ToggleDirectionStates = require('./ToggleDirectionButton/ToggleDirectionStates');
const ManualConnectInput = require('./ManualConnectInput/ManualConnectInput');
const ManualConnectEvents = require('./ManualConnectButton/ManualConnectEvents');
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
    _sManualCode: '',
    _bIsPrimaryDevice: null,
    _bIsManualConnect: false,
    _sDirection: ToggleDirectionStates.prototype.DEFAULT,

    // components
    _connector: null,
    _dataOutput: null,
    _dataInput: null,
    _alertMessage: null,
    _toggleDirectionButton: null,

    // security
    _myKeyPair: null,
    _sTheirPublicKey: '',

    // views
    _elRoot: null,

    // data
    _aReceivedDataPackages: [],



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
        this._socket = new SocketIO(sGateway, {secure: true});

        // 4. configure
        this._socket.on('connect', this._onSocketConnect.bind(this));
        this._socket.on('connect_failed', this._socketConnectFailed.bind(this));
        this._socket.on('connect_error', this._onSocketConnectError.bind(this));
        this._socket.on('disconnect', this._onSocketDisconnect.bind(this));
        this._socket.on('manualcode', this._onManualCode.bind(this));
        this._socket.on('security_compromised', this._onSecurityCompromised.bind(this));
        this._socket.on('data', this._onData.bind(this));

        // 5. verify
        let sConnectPath = 'connect';
        if (window.location.pathname.substr(1, sConnectPath.length).toLowerCase() === sConnectPath)
        {
            // a. configure
            this._bIsManualConnect = true;

            // b. setup
            this._setupDevice(false);
        }
        else
        {
            // a. register
            this._sToken = window.location.pathname.substr(1);

            // b. init
            if (!this._sToken || this._sToken.length === 0)
            {
                // I. setup
                this._setupDevice(true);
            }
            else
            {
                // I. validate
                if (!new RegExp(/^[0-9a-z]{32}$/g).test(this._sToken))
                {
                    // 1. open
                    window.open('/', '_self');
                    return;
                }

                // II. setup
                this._setupDevice(false);
            }
        }

        // 6. run
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
            // a. verify
            if (!this._bIsManualConnect)
            {
                // I. broadcast
                this._socket.emit('secondarydevice_connect_to_token', this._sToken, this._myKeyPair.publicKey);
            }
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
        // 1. preset
        const nSizePerPackage = 200000;


        // ---


        // 2. clone
        let dataToTransfer = JSON.parse(JSON.stringify(data));

        // 3. prepare
        dataToTransfer.value = JSON.stringify(dataToTransfer.value);

        // 4. encrypt
        dataToTransfer.value = Module_Crypto.encrypt(dataToTransfer.value, this._sTheirPublicKey, this._myKeyPair.secretKey);

        // 3. prepare
        dataToTransfer.value = JSON.stringify(dataToTransfer.value);

        // 5. setup
        dataToTransfer.id = Module_GenerateUniqueID({ length: 32 });
        dataToTransfer.packageCount = Math.ceil(dataToTransfer.value.length / nSizePerPackage);

        // 6. split and transfer
        for (let nPackageIndex = 0; nPackageIndex < dataToTransfer.packageCount; nPackageIndex++)
        {
            console.log('Package #' + (nPackageIndex + 1) + ' of ' + dataToTransfer.packageCount);



            // update interface -> _dataInput.setProgress(nPackageIndex / dataToTransfer.packageCount)



            // a. setup
            dataToTransfer.packageNumber = nPackageIndex;

            // b. clone
            let packageToTransfer = JSON.parse(JSON.stringify(dataToTransfer));

            // c. split
            packageToTransfer.value = dataToTransfer.value.substr(nPackageIndex * nSizePerPackage, nSizePerPackage);

            // d. store
            dataToTransfer.packageSize = packageToTransfer.value.length;

            // e. broadcast
            this._socket.emit('data', packageToTransfer);
        }
    },

    /**
     * Handle event `data`
     * @param receivedData
     * @private
     */
    _onData: function(receivedData)
    {
        // 1. verify or init
        if (!this._aReceivedDataPackages[receivedData.id])
        {
            // a. init and store
            this._aReceivedDataPackages[receivedData.id] = {
                id: receivedData.id,
                sType: receivedData.sType,
                packageCount: receivedData.packageCount,
                receivedCount: 0,
                packages: []
            };
        }

        // 2. store
        this._aReceivedDataPackages[receivedData.id].packages[receivedData.packageNumber] = receivedData;

        // 3. update
        this._aReceivedDataPackages[receivedData.id].receivedCount++;

        // 4. validate
        if (this._aReceivedDataPackages[receivedData.id].receivedCount === this._aReceivedDataPackages[receivedData.id].packageCount)
        {
            // a. compose
            let sValue = '';
            for (let nPackageIndex = 0; nPackageIndex < this._aReceivedDataPackages[receivedData.id].packageCount; nPackageIndex++)
            {
                // I. register
                let receivedPackage = this._aReceivedDataPackages[receivedData.id].packages[nPackageIndex];

                // II. build
                sValue += receivedPackage.value;
            }


            // ---


            // b. init
            let data = {
                sType: this._aReceivedDataPackages[receivedData.id].sType,
                value: sValue
            };

            // c. restore
            data.value = JSON.parse(data.value);

            // d. decrypt
            data.value = Module_Crypto.decrypt(data.value.data, data.value.nonce, this._sTheirPublicKey, this._myKeyPair.secretKey);

            // e. restore
            data.value = JSON.parse(data.value);

            // f. forward
            this._dataOutput.showData(data);

            // g. cleanup
            delete this._aReceivedDataPackages[receivedData.id];
        }
    },

    /**
     * Handle event `request_toggle_direction`
     * @private
     */
    _onRequestToggleDirection: function()
    {
        // 1. broadcast
        this._socket.emit(ToggleDirectionEvents.prototype.REQUEST_TOGGLE_DIRECTION);
    },

    /**
     * Handle event `request_toggle_manualconnect`
     * @private
     */
    _onRequestToggleManualConnect: function()
    {
        // 1. verify and request
        if (!this._sManualCode) this._socket.emit(ManualConnectEvents.prototype.REQUEST_MANUALCODE);
    },

    /**
     * Handle event `manualcode`
     * @param sManualCode
     * @private
     */
    _onManualCode: function(sManualCode)
    {
        // 1. update
        this._connector.setManualCode(sManualCode)
    },

    _onRequestConnectUsingManualCode: function(sManualCode)
    {
        // 1. request
        this._socket.emit(ManualConnectEvents.prototype.REQUEST_CONNECTION_BY_MANUALCODE, sManualCode, this._myKeyPair.publicKey);
    },

    _onManualCodeNotFound: function()
    {
        // 1. toggle
        this._manualConnectInput.enable('The code you are trying to use is not working.<br>Please try again.');
    },

    _onManualCodeExpired: function()
    {
        // 1. toggle
        this._manualConnectInput.enable('The code you are trying to use has expired.<br>Please try again.');
    },

    _onSecondaryDeviceConnectedManually: function(sPrimaryDevicePublicKey, sDirection)
    {
        // 1. hide
        this._manualConnectInput.hide();

        // 2. forward
        this._onSecondaryDeviceConnectedToToken(sPrimaryDevicePublicKey, sDirection)
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
        if (sDirection !== ToggleDirectionStates.prototype.SWAPPED)
        {
            // a. toggle visibility
            if (this._bIsPrimaryDevice)
            {
                this._toggleDirectionButton.show();
                this._dataInput.hide();
                this._dataOutput.unmute();
                this._dataOutput.show();
            }
            else
            {
                this._toggleDirectionButton.hide();
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
                this._toggleDirectionButton.hide();
                this._dataInput.show();
                this._dataOutput.mute();
                this._dataOutput.hide();
            }
            else
            {
                this._toggleDirectionButton.show();
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
            this._socket.on(ManualConnectEvents.prototype.MANUALCODE_NOT_FOUND, this._onManualCodeNotFound.bind(this));
            this._socket.on(ManualConnectEvents.prototype.MANUALCODE_EXPIRED, this._onManualCodeExpired.bind(this));
        }

        // 3. configure primary device
        this._socket.on('secondarydevice_connected', this._onSecondaryDeviceConnected.bind(this));
        this._socket.on('secondarydevice_disconnected', this._onSecondaryDeviceDisconnected.bind(this));
        this._socket.on('secondarydevice_reconnected', this._onSecondaryDeviceReconnected.bind(this));

        // 4. configure secondary device
        this._socket.on('token_connected', this._onSecondaryDeviceConnectedToToken.bind(this));
        this._socket.on(ManualConnectEvents.prototype.MANUALCODE_CONNECTED, this._onSecondaryDeviceConnectedManually.bind(this));
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
        this._toggleDirectionButton = new ToggleDirectionButton();

        // 10. configure
        this._socket.on(ToggleDirectionEvents.prototype.TOGGLE_DIRECTION, this._onToggleDirection.bind(this));

        // 11. configure
        this._toggleDirectionButton.addEventListener(ToggleDirectionEvents.prototype.REQUEST_TOGGLE_DIRECTION, this._onRequestToggleDirection.bind(this));


        if (this._bIsManualConnect)
        {
            // 12. init
            this._manualConnectInput = new ManualConnectInput(); // ### toggle connection type

            // 13. configure
            this._manualConnectInput.addEventListener(ManualConnectInput.prototype.REQUEST_CONNECTION_USING_MANUALCODE, this._onRequestConnectUsingManualCode.bind(this));

            // 14. toggle
            this._manualConnectInput.show();
        }

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
        this._connector = new Connector(window.location.protocol + '//' + window.location.hostname + '/' + this._sToken);

        // 3. configure
        this._connector.addEventListener(ManualConnectEvents.prototype.REQUEST_TOGGLE_MANUALCONNECT, this._onRequestToggleManualConnect.bind(this));

        // 4. show
        this._connector.show();
    },

    /**
     * Handle event `token_not_found`
     * @private
     */
    _onPrimaryDeviceTokenNotFound: function()
    {
        // 1. hide
        this._dataInput.hide();
        this._toggleDirectionButton.hide();

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
        this._toggleDirectionButton.hide();

        // 2. output
        this._alertMessage.show('The link you are trying to use is not working. Please try again.', true);
    },

    /**
     * Handle event `secondarydevice_connected`
     * @param sSenderPublicKey
     * @private
     */
    _onSecondaryDeviceConnected: function(sSecondaryPublicKey)
    {
        // 1. store
        this._sTheirPublicKey = sSecondaryPublicKey;

        // 2. toggle visibility
        this._alertMessage.hide();
        this._connector.hide();
        this._dataOutput.show();
        if (this._isOutputDevice()) this._toggleDirectionButton.show();
    },

    /**
     * Handle event `secondarydevice_disconnected`
     * @private
     */
    _onSecondaryDeviceDisconnected: function()
    {
        // 1. toggle visibility
        this._dataOutput.hide();
        this._toggleDirectionButton.hide();

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
        if (this._isOutputDevice()) this._toggleDirectionButton.show();
    },

    _onPrimaryDeviceDisconnected: function()
    {
        // 1. toggle visibility
        this._dataOutput.hide();
        this._toggleDirectionButton.hide();

        // 2. output
        this._alertMessage.show('The other device has been disconnected. Is it still online?');
    },

    _onPrimaryDeviceReconnected: function()
    {
        // 1. toggle visibility
        this._alertMessage.hide();
        this._dataOutput.show();
        if (this._isOutputDevice()) this._toggleDirectionButton.show();
    },

    _onTokenNotFound: function()
    {
        // 1. toggle visibility
        this._dataOutput.hide();
        this._toggleDirectionButton.hide();

        // 2. output
        this._alertMessage.show('The link you are trying to use is not working. Please try again.', true);
    },

    _onSecondaryDeviceConnectedToToken: function(sPrimaryDevicePublicKey, sDirection)
    {
        // 1. store
        this._sTheirPublicKey = sPrimaryDevicePublicKey;
        this._sDirection = sDirection;

        // 2. toggle visibility
        if (this._isOutputDevice())
        {
            this._dataOutput.show();
            this._toggleDirectionButton.show();
        }
        else
        {
            this._dataInput.show();
        }
    },

    /**
     * Check is the current device is the output device
     * @returns {boolean}
     * @private
     */
    _isOutputDevice: function()
    {
        // 1. verify
        if (this._sDirection !== ToggleDirectionStates.prototype.SWAPPED)
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
