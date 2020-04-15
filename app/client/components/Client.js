/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';


// import
const Connector = require('./Connector/Connector');
const ConnectorEvents = require('./Connector/ConnectorEvents');
const DataInput = require('./DataInput/DataInput');
const DataOutput = require('./DataOutput/DataOutput');
const ToggleDirectionButton = require('./ToggleDirectionButton/ToggleDirectionButton');
const ToggleDirectionStates = require('./ToggleDirectionButton/ToggleDirectionStates');
const ManualConnectInput = require('./ManualConnectInput/ManualConnectInput');
const ManualConnectHandshake = require('./ManualConnectHandshake/ManualConnectHandshake');
const ManualConnectEvents = require('./ManualConnectButton/ManualConnectEvents');
const AlertMessage = require('./AlertMessage/AlertMessage');

// import managers
const DataManager = require('./../managers/DataManager');

// import utils
const SocketIO = require('socket.io-client');


module.exports = function(sGateway)
{
    // start
    this.__construct(sGateway);
};

module.exports.prototype = {

    // connection
    _socket: null,
    _sToken: null,
    _nTokenLifetime: null,
    _sDeviceID: null,

    _sManualCode: '',
    _bIsPrimaryDevice: null,
    _bIsManualConnect: false,
    _sDirection: ToggleDirectionStates.prototype.DEFAULT,

    // components
    _connector: null,
    _manualConnectInput: null,
    _manualConnectHandshake: null,
    _dataOutput: null,
    _dataInput: null,
    _alertMessage: null,
    _toggleDirectionButton: null,

    // security
    _myKeyPair: null,
    _sTheirPublicKey: '',

    // views
    _elRoot: null,

    // utils
    _packageManager: null,



    // ----------------------------------------------------------------------------
    // --- Constructor ------------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Constructor
     */
    __construct: function(sGateway)
    {
        // 1. register
        this._elRoot = document.querySelector('[data-mimoto-id="component_Client"]');

        // 2. setup
        this._socket = new SocketIO(sGateway, {secure: true});

        // 3. configure
        this._socket.on('connect', this._onSocketConnect.bind(this));
        this._socket.on('connect_failed', this._socketConnectFailed.bind(this));
        this._socket.on('connect_error', this._onSocketConnectError.bind(this));
        this._socket.on('disconnect', this._onSocketDisconnect.bind(this));

        // 4. init
        this._dataManager = new DataManager();

        // 5. configure
        this._dataManager.addEventListener(DataManager.prototype.DATA_READY_FOR_TRANSFER, this._onDataManagerDataReadyForTransfer.bind(this));
        this._dataManager.addEventListener(DataManager.prototype.DATA_PREPARE_FOR_DISPLAY, this._onDataManagerDataPrepareForDisplay.bind(this));
        this._dataManager.addEventListener(DataManager.prototype.DATA_READY_FOR_DISPLAY, this._onDataManagerDataReadyForDisplay.bind(this));

        // 6. verify
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

        // 7. run
        this._socket.connect();
    },


    // ----------------------------------------------------------------------------
    // --- Private methods --------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Setup this client's device
     * @private
     */
    _setupDevice: function(bIsPrimaryDevice)
    {
        // 1. set state
        this._bIsPrimaryDevice = bIsPrimaryDevice;

        // 2. select
        if (this._bIsPrimaryDevice)
        {
            // a. configure
            this._socket.on(ConnectorEvents.prototype.UPDATE_PRIMARYDEVICE_CONNECTED, this._onUpdatePrimaryDeviceConnected.bind(this));
            this._socket.on(ConnectorEvents.prototype.UPDATE_PRIMARYDEVICE_FRESH_TOKEN, this._onReceiveTokenRefreshed.bind(this));
            this._socket.on(ConnectorEvents.prototype.UPDATE_OTHERDEVICE_CONNECTED, this._onUpdateOtherDeviceConnected.bind(this));
        }
        else
        {
            // a. configure
            this._socket.on(ConnectorEvents.prototype.ERROR_SECONDARYDEVICE_CONNECT_BY_QR_TOKEN_NOT_FOUND, this._onErrorSecondaryDeviceConnectByQRTokenNotFound.bind(this));


            this._socket.on(ConnectorEvents.prototype.UPDATE_SECONDARYDEVICE_CONNECTED_BY_QR, this._onUpdateSecondaryDeviceConnectedByQR.bind(this));

            //UPDATE_SECONDARYDEVICE_CONNECTED_BY_QR: 'UPDATE_SECONDARYDEVICE_CONNECTED_BY_QR',


            this._socket.on(ManualConnectEvents.prototype.MANUALCODE_NOT_FOUND, this._onManualCodeNotFound.bind(this));
            this._socket.on(ManualConnectEvents.prototype.MANUALCODE_EXPIRED, this._onManualCodeExpired.bind(this));




        }

        // 3. configure
        this._socket.on(ConnectorEvents.prototype.ERROR_DEVICE_RECONNECT_DEVICEID_NOT_FOUND, this._onErrorDeviceReconnectDeviceIDNotFound.bind(this));



        this._socket.on(ConnectorEvents.prototype.ERROR_SECURITY_COMPROMISED, this._onErrorSecurityCompromised.bind(this));
        this._socket.on(ConnectorEvents.prototype.DATA, this._onData.bind(this));



        this._socket.on('manualcode', this._onManualCode.bind(this));


        // 3. configure primary device

        this._socket.on(ConnectorEvents.prototype.UPDATE_OTHERDEVICE_DISCONNECTED, this._onUpdateOtherDeviceDisconnected.bind(this));
        this._socket.on(ConnectorEvents.prototype.UPDATE_OTHERDEVICE_RECONNECTED, this._onUpdateOtherDeviceReconnected.bind(this));


        this._socket.on(ManualConnectEvents.prototype.REQUEST_MANUALCODE_CONFIRMATION, this._onRequestManualCodeConfirmation.bind(this));




        // 4. configure secondary device
        this._socket.on('token_connected', this._onSecondaryDeviceConnectedToToken.bind(this)); // nodig?
        this._socket.on(ManualConnectEvents.prototype.MANUALCODE_ACCEPTED, this._onSecondaryDeviceManualCodeAccepted.bind(this));
        this._socket.on(ManualConnectEvents.prototype.MANUALCODE_CONNECTED, this._onSecondaryDeviceConnectedManually.bind(this));



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
        this._socket.on(ConnectorEvents.prototype.REQUEST_TOGGLE_DIRECTION, this._onToggleDirection.bind(this));

        // 11. configure
        this._toggleDirectionButton.addEventListener(ToggleDirectionButton.prototype.TOGGLE_DIRECTION, this._onRequestToggleDirection.bind(this));


        // --- manual connect

        // 12. verify
        if (this._bIsManualConnect)
        {
            // a. init
            this._manualConnectInput = new ManualConnectInput(); // ### toggle connection type

            // b. configure
            this._manualConnectInput.addEventListener(ManualConnectInput.prototype.REQUEST_CONNECTION_USING_MANUALCODE, this._onRequestConnectUsingManualCode.bind(this));

            // c. toggle
            this._manualConnectInput.show();
        }
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

        // 2. select
        if (!this._isRegisteredDevice())
        {
            // 2. select
            if (this._bIsPrimaryDevice)
            {
                // I. request
                this._socket.emit(ConnectorEvents.prototype.REQUEST_PRIMARYDEVICE_CONNECT, this._dataManager.getMyPublicKey());
            }
            else
            {
                // I. broadcast
                this._socket.emit(ConnectorEvents.prototype.REQUEST_SECONDARYDEVICE_CONNECT_BY_QR, this._dataManager.getMyPublicKey(), this._sToken);
            }
        }
        else
        {
            // I. request
            this._socket.emit(ConnectorEvents.prototype.REQUEST_DEVICE_RECONNECT, this._sDeviceID);
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
        // 1. hide
        this._dataInput.hide();
        this._dataOutput.hide();
        this._toggleDirectionButton.hide();
        if (this._isOutputDevice()) this._connector.hide();

        // 2. output
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
     * Handle event `ERROR_SECURITY_COMPROMISED`
     * @private
     */
    _onErrorSecurityCompromised: function()
    {
        // 1. cleanup
        this._killConnection();

        // 2. disable interface
        document.querySelector('[data-mimoto-id="component_Client"]').remove();
        document.querySelector('[data-mimoto-id="main-information"]').remove();
        document.querySelector('[data-mimoto-id="main-interface-header-background"]').remove();

        // 3. swap logo
        document.querySelector('[data-mimoto-id="logo"]').src = 'static/images/copypaste-logo-white.png';

        // 4. show warning
        document.body.classList.add('security_compromised');

        // 5. output warning
        document.querySelector('[data-mimoto-id="warning_security_compromised"]').innerHTML = '' +
            '<div class="warning_security_compromised_title">WARNING: Security compromised</div>' +
            '<p>It appears a third device tried to connect to your session.</p>' +
            '<p>Just to be sure, we shut it down.</p>' +
            '<p>Your data is safe!</p>' +
            '<br>' +
            '<p>To start a new session, <a href="/">reload</a> this page!</p>';
        
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
        // 1. forward
        this._dataManager.prepareDataForTransfer(data);
    },

    /**
     * Handle event `data`
     * @param receivedData
     * @private
     */
    _onData: function(receivedData)
    {
        // 1. store
        this._dataManager.addPackage(receivedData);
    },

    /**
     * Handle event `request_toggle_direction`
     * @private
     */
    _onRequestToggleDirection: function()
    {
        // 1. broadcast
        this._socket.emit(ConnectorEvents.prototype.REQUEST_TOGGLE_DIRECTION);
    },

    /**
     * Handle connector `REQUEST_TOGGLE_MANUALCONNECT`
     * @private
     */
    _onConnectorRequestToggleManualConnect: function()
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
        this._socket.emit(ManualConnectEvents.prototype.REQUEST_CONNECTION_BY_MANUALCODE, sManualCode, this._dataManager.getMyPublicKey());
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

    /**
     * Handle manualcode event `MANUALCODE_ACCEPTED`
     * @private
     */
    _onSecondaryDeviceManualCodeAccepted: function()
    {
        // 1. hide
        this._manualConnectInput.hide();

        // 2. create
        let sCode = '';
        for (let nCharIndex = 0; nCharIndex < 4; nCharIndex++) sCode += Math.floor(Math.random() * 10);

        // 3. init
        this._manualConnectHandshake = new ManualConnectHandshake();

        // 4. show
        this._manualConnectHandshake.show(sCode);

        // 5. communicate
        this._socket.emit(ManualConnectEvents.prototype.REQUEST_MANUALCODE_HANDSHAKE, sCode);
    },


    /**
     * Handle primaryDeviceSocket event `REQUEST_MANUALCODE_CONFIRMATION`
     * @private
     */
    _onRequestManualCodeConfirmation: function(sCode)
    {
        // 1. hide
        this._connector.hide();

        // 2. init
        this._manualConnectHandshake = new ManualConnectHandshake();

        // 3. show
        this._manualConnectHandshake.show(sCode);

        // 4. configure
        this._manualConnectHandshake.addEventListener(ManualConnectHandshake.prototype.REQUEST_CONFIRM_HANDSHAKE, this._ManualConnectHandshakeRequestConfirmHandshake.bind(this));

        // 5. enable
        this._manualConnectHandshake.enableButton();
    },

    /**
     * Handle manualCodeHandshake `REQUEST_CONFIRM_HANDSHAKE`
     * @private
     */
    _ManualConnectHandshakeRequestConfirmHandshake: function()
    {
        // 1. request
        this._socket.emit(ManualConnectEvents.prototype.CONFIRM_MANUALCODE);
    },

    /**
     * Handle primaryDeviceSocket event `SECONDARYDEVICE_CONNECTED`
     * @param sPrimaryDevicePublicKey
     * @param sDirection
     * @param sToken
     * @private
     */
    _onSecondaryDeviceConnectedManually: function(sPrimaryDevicePublicKey, sDirection, sToken)
    {
        // 1. hide
        this._manualConnectHandshake.hide();

        // 2. update
        if (window && window.history && window.history.pushState) window.history.pushState(null, document.getElementsByTagName("title")[0].innerHTML, '/' + sToken);

        // 3. forward
        this._onSecondaryDeviceConnectedToToken(sPrimaryDevicePublicKey, sDirection);
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
    // --- Event handlers - runtime -----------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Handle primary device `UPDATE_PRIMARYDEVICE_CONNECTED`
     * @param sDeviceID
     * @param sToken
     * @param nTokenLifetime
     * @private
     */
    _onUpdatePrimaryDeviceConnected: function(sDeviceID, sToken, nTokenLifetime)
    {
        // 1. store
        this._sDeviceID = sDeviceID;

        // 2. create
        this._connector = new Connector(sToken, nTokenLifetime);

        // 3. configure
        this._connector.addEventListener(Connector.prototype.REQUEST_TOGGLE_MANUALCONNECT, this._onConnectorRequestToggleManualConnect.bind(this));
        this._connector.addEventListener(Connector.prototype.REQUEST_TOKEN_REFRESH, this._onRequestTokenRefresh.bind(this));

        // 4. show
        this._connector.show();
    },

    _onRequestTokenRefresh: function()
    {
        // 1. request
        this._socket.emit(ConnectorEvents.prototype.PRIMARYDEVICE_REQUEST_TOKEN_REFRESH, this._sDeviceID);
    },

    /**
     * Handle event `PRIMARYDEVICE_TOKEN_REFRESHED`
     * @param sToken
     * @param nTokenLifetime
     * @private
     */
    _onReceiveTokenRefreshed: function(sToken, nTokenLifetime)
    {
        // 2. create
        this._connector.setToken(sToken, nTokenLifetime);
    },

    /**
     * Handle device `ERROR_DEVICE_RECONNECT_DEVICEID_NOT_FOUND`
     * @private
     */
    _onErrorDeviceReconnectDeviceIDNotFound: function()
    {
        // 1. hide
        this._dataInput.hide();
        this._dataOutput.hide();
        this._toggleDirectionButton.hide();
        if (this._isOutputDevice()) this._connector.hide();

        // 2. cleanup
        this._killConnection();

        // 3. output
        this._alertMessage.show('This session expired. <a href="/">Reload</a> this page to make a new connection.', true);
    },

    /**
     * Handle secondary device `ERROR_SECONDARYDEVICE_CONNECT_BY_QR_TOKEN_NOT_FOUND`
     * @private
     */
    _onErrorSecondaryDeviceConnectByQRTokenNotFound: function()
    {
        // 1. toggle visibility
        this._dataInput.hide();
        this._toggleDirectionButton.hide();

        // 2. cleanup
        this._killConnection();

        // 3. output
        this._alertMessage.show('The link you are trying to use is not working. Please try again.', true);
    },

    /**
     * Handle secondary device
     * @param sOtherDevicePublicKey
     * @private
     */
    _onUpdateOtherDeviceConnected: function(sOtherDevicePublicKey)
    {
        // 1. store
        this._dataManager.setTheirPublicKey(sOtherDevicePublicKey);

        // 2. toggle visibility
        this._alertMessage.hide();
        if (this._manualConnectHandshake) this._manualConnectHandshake.hide();

        // 3. toggle
        this._connector.hide();
        this._dataOutput.show();
        this._toggleDirectionButton.show();
    },

    /**
     * Handle secondary device `UPDATE_SECONDARYDEVICE_CONNECTED_BY_QR`
     * @param sDeviceID
     * @param sOtherDevicePublicKey
     * @param sDirection
     * @private
     */
    _onUpdateSecondaryDeviceConnectedByQR: function(sDeviceID, sOtherDevicePublicKey, sDirection)
    {
        // 1. store
        this._sDeviceID = sDeviceID;
        this._sDirection = sDirection;

        // 2. store
        this._dataManager.setTheirPublicKey(sOtherDevicePublicKey);

        // 3. toggle visibility
        this._alertMessage.hide();
        if (this._manualConnectHandshake) this._manualConnectHandshake.hide();
        this._dataInput.show();
    },

    /**
     * Handle other device `UPDATE_OTHERDEVICE_DISCONNECTED`
     * @private
     */
    _onUpdateOtherDeviceDisconnected: function()
    {
        // 1. toggle visibility
        this._dataOutput.hide();
        this._toggleDirectionButton.hide();

        // 2. output
        this._alertMessage.show('The other device has been disconnected. Is it still online?');
    },

    /**
     * Handle other device `UPDATE_OTHERDEVICE_RECONNECTED`
     * @private
     */
    _onUpdateOtherDeviceReconnected: function()
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
        this._dataManager.setTheirPublicKey(sPrimaryDevicePublicKey);
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
     * Handle PackageManager event `DATA_READY_FOR TRANSFER`
     * @param packageToTransfer
     * @private
     */
    _onDataManagerDataReadyForTransfer: function(packageToTransfer)
    {
        // 1. broadcast
        this._socket.emit('data', packageToTransfer);

        // 2. update
        this._dataInput.showTransferProgress((packageToTransfer.packageNumber + 1) / packageToTransfer.packageCount);
    },

    /**
     * Handle PackageManager event `DATA_PREPARE_FOR DISPLAY`
     * @param metaData
     * @private
     */
    _onDataManagerDataPrepareForDisplay: function()
    {
        // 1. forward
        //this._dataOutput.prepareData();
    },

    /**
     * Handle PackageManager event `DATA_READY_FOR DISPLAY`
     * @param data
     * @private
     */
    _onDataManagerDataReadyForDisplay: function(data)
    {
        // 1. forward
        this._dataOutput.showData(data);
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
    },

    /**
     * Kill connection
     * @private
     */
    _killConnection: function()
    {
        // 1. clear configuration
        this._socket.removeAllListeners();

        // 2. close
        this._socket.disconnect();

        // 3. cleanup
        delete this._socket;
    },

    /**
     * Check if device is registered
     * @returns {boolean}
     * @private
     */
    _isRegisteredDevice: function()
    {
        return (this._sDeviceID) ? true : false;
    }

};
