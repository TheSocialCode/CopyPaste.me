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
    _sState: null,
    _sDirection: ToggleDirectionStates.prototype.DEFAULT,
    _socketIDs: {}, // OFFLINE_RESCUE_#1

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

    // managers
    _dataManager: null,
    _packageManager: null,

    // states
    STATE_PRIMARYDEVICE_WAITINGFORSECONDARYDEVICE: 'STATE_PRIMARYDEVICE_WAITINGFORSECONDARYDEVICE',
    STATE_SECONDARYDEVICECONNECTED: 'STATE_SECONDARYDEVICECONNECTED',



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
        this._dataManager.addEventListener(DataManager.prototype.DATA_LOADING, this._onDataManagerDataLoading.bind(this));
        this._dataManager.addEventListener(DataManager.prototype.DATA_READY_FOR_DISPLAY, this._onDataManagerDataReadyForDisplay.bind(this));



        // ---


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

                // II. remove token from URL
                if (window && window.history && window.history.pushState) window.history.pushState(null, document.getElementsByTagName("title")[0].innerHTML, '/');

                // III. setup
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
            this._socket.on(ConnectorEvents.prototype.UPDATE_PRIMARYDEVICE_MANUALCODE, this._onUpdatePrimaryDeviceManualCode.bind(this));
            this._socket.on(ConnectorEvents.prototype.REQUEST_PRIMARYDEVICE_MANUALCODE_CONFIRMATION, this._onRequestPrimaryDeviceManualCodeConfirmation.bind(this));
            this._socket.on(ConnectorEvents.prototype.ERROR_PRIMARYDEVICE_CONNECT_BY_MANUALCODE_SECONDARYDEVICE_NOT_FOUND, this._onErrorPrimaryDeviceConnectByManualCodeSecondaryDeviceNotFound.bind(this));
        }
        else
        {
            // a. configure
            this._socket.on(ConnectorEvents.prototype.ERROR_SECONDARYDEVICE_CONNECT_BY_QR_TOKEN_NOT_FOUND, this._onErrorSecondaryDeviceConnectByQRTokenNotFound.bind(this));
            this._socket.on(ConnectorEvents.prototype.UPDATE_SECONDARYDEVICE_CONNECTED_BY_QR, this._onUpdateSecondaryDeviceConnectedByQR.bind(this));
            this._socket.on(ConnectorEvents.prototype.ERROR_SECONDARYDEVICE_CONNECT_BY_MANUALCODE_TOKEN_NOT_FOUND, this._onErrorSecondaryDeviceConnectByManualCodeTokenNotFound.bind(this));
            this._socket.on(ConnectorEvents.prototype.UPDATE_SECONDARYDEVICE_MANUALCODE_ACCEPTED, this._onUpdateSecondaryDeviceManualCodeAccepted.bind(this));
            this._socket.on(ConnectorEvents.prototype.UPDATE_SECONDARYDEVICE_CONNECTED_BY_MANUALCODE, this._onUpdateSecondaryDeviceConnectedByManualCode.bind(this));
        }

        // 3. configure

        this._socket.on(ConnectorEvents.prototype.UPDATE_DEVICE_RECONNECTED, this._onUpdateDeviceReconnected.bind(this));
        this._socket.on(ConnectorEvents.prototype.UPDATE_OTHERDEVICE_DISCONNECTED, this._onUpdateOtherDeviceDisconnected.bind(this));
        this._socket.on(ConnectorEvents.prototype.UPDATE_OTHERDEVICE_RECONNECTED, this._onUpdateOtherDeviceReconnected.bind(this));
        this._socket.on(ConnectorEvents.prototype.RECEIVE_DATA, this._onReceiveData.bind(this));
        this._socket.on(ConnectorEvents.prototype.DATA_RECEIVED, this._onDataReceived.bind(this));

        // 4. configure security
        this._socket.on(ConnectorEvents.prototype.ERROR_DEVICE_RECONNECT_DEVICEID_NOT_FOUND, this._onErrorDeviceReconnectDeviceIDNotFound.bind(this));
        this._socket.on(ConnectorEvents.prototype.ERROR_SECURITY_COMPROMISED, this._onErrorSecurityCompromised.bind(this));
        this._socket.on(ConnectorEvents.prototype.NOTIFICATION_SESSION_EXPIRED, this._onDeviceNotificationSessionExpired.bind(this));


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
        this._socket.on(ConnectorEvents.prototype.UPDATE_TOGGLE_DIRECTION, this._onUpdateToggleDirection.bind(this));

        // 11. configure
        this._toggleDirectionButton.addEventListener(ToggleDirectionButton.prototype.REQUEST_TOGGLE_DIRECTION, this._onRequestToggleDirection.bind(this));


        // --- manual connect


        // 12. verify
        if (this._bIsManualConnect)
        {
            // a. init
            this._manualConnectInput = new ManualConnectInput();

            // b. configure
            this._manualConnectInput.addEventListener(ManualConnectInput.prototype.REQUEST_CONNECT_BY_MANUALCODE, this._onManualConnectInputRequestConnectByManualCode.bind(this));

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
        // 1. store - OFFLINE_RESCUE_#1
        if (this._socketIDs.current) this._socketIDs.previous = this._socketIDs.current;
        this._socketIDs.current = this._socket.id;

        // 2. hide
        this._alertMessage.hide();

        // 3. select
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
                if (!this._bIsManualConnect) this._socket.emit(ConnectorEvents.prototype.REQUEST_SECONDARYDEVICE_CONNECT_BY_QR, this._dataManager.getMyPublicKey(), this._sToken);
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
        // 1. pause
        this._dataManager.pause();

        // 2. disable
        this._disableInterface();

        // 3. output
        if (this._alertMessage) this._alertMessage.show('No connection. Are you still online?');
    },

    /**
     * Handle event `disconnect`
     * @private
     */
    _onSocketDisconnect: function()
    {
        // 1. pause
        this._dataManager.pause();

        // 2. notify
        if (this._alertMessage) this._alertMessage.show('You seem to have gone offline .. reconnecting ..');
    },



    // ----------------------------------------------------------------------------
    // --- Event handlers - Communication -----------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Handle event `REQUEST_TOGGLE_DIRECTION`
     * @private
     */
    _onRequestToggleDirection: function()
    {
        // 1. broadcast
        this._socket.emit(ConnectorEvents.prototype.REQUEST_TOGGLE_DIRECTION);
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
        this._connector.addEventListener(Connector.prototype.REQUEST_TOKEN_REFRESH, this._onConnectorRequestTokenRefresh.bind(this));
        this._connector.addEventListener(Connector.prototype.REQUEST_MANUALCODE, this._onConnectorRequestManualCode.bind(this));

        // 4. toggle
        this._setState(this.STATE_PRIMARYDEVICE_WAITINGFORSECONDARYDEVICE);
    },

    /**
     * Handle connector `REQUEST_TOKEN_REFRESH`
     * @private
     */
    _onConnectorRequestTokenRefresh: function()
    {
        // 1. request
        this._socket.emit(ConnectorEvents.prototype.REQUEST_PRIMARYDEVICE_FRESH_TOKEN);
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
     * @param bMightHaveBeenUnableToLogOffEarlier - OFFLINE_RESCUE_#1 - this parameter is only passed when the server lost track of a device that didn't manage to properly disconnect and unregister (for instance because the internet got cut off and the device wasn't able to communicate it's change in presence (all related parts of this solution are marked in the comments by OFFLINE_RESCUE_#1
     * @private
     */
    _onErrorDeviceReconnectDeviceIDNotFound: function(bMightHaveBeenUnableToLogOffEarlier)
    {
        // 1. Verify - OFFLINE_RESCUE_#1 - The device might have lost the internet connection earlier and was unable to disconnect to the server, making the server think it's still online and connected
        if (bMightHaveBeenUnableToLogOffEarlier === true)
        {
            // 1. verify
            if (this._socketIDs.previous)
            {
                // I. request
                this._socket.emit(ConnectorEvents.prototype.REQUEST_DEVICE_RECONNECT, this._sDeviceID, this._socketIDs.previous);

                // II. exit
                return;
            }
        }

        // 2. cleanup
        this._killConnection();

        // 3. disable
        this._disableInterface();

        // 4. output
        this._alertMessage.show('Your session expired to ensure the safety of your data', true, { sLabel: 'Start new session', fClickHandler: function() { window.open('/', '_self') } });
    },

    /**
     * Handle secondary device `ERROR_SECONDARYDEVICE_CONNECT_BY_QR_TOKEN_NOT_FOUND`
     * @private
     */
    _onErrorSecondaryDeviceConnectByQRTokenNotFound: function()
    {
        // 1. cleanup
        this._killConnection();

        // 2. disable
        this._disableInterface();

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

        // 2. update interface
        this._setState(this.STATE_SECONDARYDEVICECONNECTED, true);
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

        // 3. update interface
        this._setState(this.STATE_SECONDARYDEVICECONNECTED, true);
    },

    /**
     * Handle other device `UPDATE_DEVICE_RECONNECTED`
     * @param bOtherDeviceConnected
     * @param sDirection
     * @private
     */
    _onUpdateDeviceReconnected: function(bOtherDeviceConnected, sDirection)
    {
        // 1, store
        this._sDirection = sDirection;

        // 2. cleanup - OFFLINE_RESCUE_#1
        delete this._socketIDs.previous;

        // 3. resume
        this._dataManager.resume(bOtherDeviceConnected);

        // 4. update interface
        this._setState(this._sState, bOtherDeviceConnected);
    },

    /**
     * Handle other device `UPDATE_OTHERDEVICE_DISCONNECTED`
     * @private
     */
    _onUpdateOtherDeviceDisconnected: function()
    {
        // 1. pause
        this._dataManager.pause();

        // 2. update interface
        this._setState(this._sState, false);

        // 3. output
        this._alertMessage.show('The other device has been disconnected. Is it still online?');
    },

    /**
     * Handle other device `UPDATE_OTHERDEVICE_RECONNECTED`
     * @private
     */
    _onUpdateOtherDeviceReconnected: function()
    {
        // 1. resume transfer
        this._dataManager.resume(true);

        // 2. update interface
        this._setState(this._sState, true);
    },



    // ----------------------------------------------------------------------------
    // --- Private functions - Settings -------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Handle event `UPDATE_TOGGLE_DIRECTION`
     * @param sDirection
     * @private
     */
    _onUpdateToggleDirection: function(sDirection)
    {
        // 1. store
        this._sDirection = sDirection;

        // 2. update interface
        this._setState(this._sState, true);
    },



    // ----------------------------------------------------------------------------
    // --- Private functions - Manual code ----------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Handle connector `REQUEST_MANUALCODE`
     * @private
     */
    _onConnectorRequestManualCode: function()
    {
        // 1. verify and request
        if (!this._sManualCode) this._socket.emit(ConnectorEvents.prototype.REQUEST_PRIMARYDEVICE_MANUALCODE);
    },

    /**
     * Handle `UPDATE_PRIMARYDEVICE_MANUALCODE`
     * @param sManualCode
     * @param sTokenLifetime
     * @private
     */
    _onUpdatePrimaryDeviceManualCode: function(sManualCode, sTokenLifetime)
    {
        // 1. update
        this._connector.setManualCode(sManualCode, sTokenLifetime)
    },

    /**
     * Handle Manual Connect Input `REQUEST_CONNECT_BY_MANUALCODE`
     * @param sManualCode
     * @private
     */
    _onManualConnectInputRequestConnectByManualCode: function(sManualCode)
    {
        // 1. request
        this._socket.emit(ConnectorEvents.prototype.REQUEST_SECONDARYDEVICE_CONNECT_BY_MANUALCODE, this._dataManager.getMyPublicKey(), sManualCode);
    },

    /**
     * Handle secondary device `ERROR_SECONDARYDEVICE_CONNECT_BY_MANUALCODE_TOKEN_NOT_FOUND`
     * @private
     */
    _onErrorSecondaryDeviceConnectByManualCodeTokenNotFound: function()
    {
        // 1. toggle
        this._manualConnectInput.enable('The code you are trying to use seems to be incorrect or is expired.<br>Please try again.');
    },

    /**
     * Handle `UPDATE_SECONDARYDEVICE_MANUALCODE_ACCEPTED`
     * @private
     */
    _onUpdateSecondaryDeviceManualCodeAccepted: function()
    {
        // 1. hide
        this._manualConnectInput.hide();

        // 2. create
        let sConfirmationCode = '';
        for (let nCharIndex = 0; nCharIndex < 4; nCharIndex++) sConfirmationCode += Math.floor(Math.random() * 10);

        // 3. init
        this._manualConnectHandshake = new ManualConnectHandshake();

        // 4. show
        this._manualConnectHandshake.show(sConfirmationCode);

        // 5. communicate
        this._socket.emit(ConnectorEvents.prototype.REQUEST_SECONDARYDEVICE_MANUALCODE_HANDSHAKE, sConfirmationCode);
    },

    /**
     * Handle primary device `REQUEST_PRIMARYDEVICE_MANUALCODE_CONFIRMATION`
     * @private
     */
    _onRequestPrimaryDeviceManualCodeConfirmation: function(sConfirmationCode)
    {
        // 1. hide
        this._connector.hide();

        // 2. init
        this._manualConnectHandshake = new ManualConnectHandshake();

        // 3. show
        this._manualConnectHandshake.show(sConfirmationCode);

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
        if (this._socket) this._socket.emit(ConnectorEvents.prototype.REQUEST_PRIMARYDEVICE_MANUALCODE_CONFIRMED);
    },

    /**
     * Handle primary device `ERROR_PRIMARYDEVICE_CONNECT_BY_MANUALCODE_SECONDARYDEVICE_NOT_FOUND`
     * @private
     */
    _onErrorPrimaryDeviceConnectByManualCodeSecondaryDeviceNotFound: function()
    {
        // 1. cleanup
        this._killConnection();

        // 2. disable
        this._disableInterface();

        // 3. notify
        this._alertMessage.show('Oops, it seems we lost the other device :/ Let`s try again!', true, { sLabel: 'Start new session', fClickHandler: function() { window.open('/', '_self') } });
    },

    /**
     * Handle `UPDATE_SECONDARYDEVICE_CONNECTED_BY_MANUALCODE`
     * @param sDeviceID
     * @param sOtherDevicePublicKey
     * @param sDirection
     * @private
     */
    _onUpdateSecondaryDeviceConnectedByManualCode: function(sDeviceID, sOtherDevicePublicKey, sDirection)
    {
        // 1. store
        this._sDeviceID = sDeviceID;
        this._sDirection = sDirection;

        // 2. store
        this._dataManager.setTheirPublicKey(sOtherDevicePublicKey);

        // 3. update
        if (window && window.history && window.history.pushState) window.history.pushState(null, document.getElementsByTagName("title")[0].innerHTML, '/');

        // 4. update interface
        this._setState(this.STATE_SECONDARYDEVICECONNECTED, true);
    },



    // ----------------------------------------------------------------------------
    // --- Private functions - Data -----------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Handle PackageManager event `DATA_READY_FOR TRANSFER`
     * @param packageToTransfer
     * @private
     */
    _onDataManagerDataReadyForTransfer: function(packageToTransfer)
    {
        // 1. broadcast
        this._socket.emit(ConnectorEvents.prototype.SEND_DATA, packageToTransfer);

        // 2. verify
        if (packageToTransfer.packageNumber === 0)
        {
            // a. show first percentage (instead of 0%) to let the user know the transfer started
            this._dataInput.showTransferProgress((packageToTransfer.packageNumber + 1) / packageToTransfer.packageCount);
        }
    },

    /**
     * Handle PackageManager event `DATA_LOADING`
     * @param data
     * @private
     */
    _onDataManagerDataLoading: function(data)
    {
        // 1. forward
        this._dataOutput.prepareData(data);
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
     * Handle event `RECEIVE_DATA`
     * @param receivedData
     * @private
     */
    _onReceiveData: function(receivedData)
    {
        // 1. report back
        this._socket.emit(ConnectorEvents.prototype.DATA_RECEIVED, { dataID: receivedData.id, packageNumber: receivedData.packageNumber, packageCount: receivedData.packageCount });

        // 2. store
        this._dataManager.addPackage(receivedData);
    },

    /**
     * Handle `DATA_RECEIVED`
     * @param data
     * @private
     */
    _onDataReceived: function(data)
    {
        // 1. show progress
        this._dataInput.showTransferProgress((data.packageNumber + 1) / data.packageCount);

        // 2. continue transfer
        this._dataManager.continueToNextPackage(data);
    },



    // ----------------------------------------------------------------------------
    // --- Private functions - States ---------------------------------------------
    // ----------------------------------------------------------------------------


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
     * Check if device is registered
     * @returns {boolean}
     * @private
     */
    _isRegisteredDevice: function()
    {
        return (this._sDeviceID) ? true : false;
    },



    // ----------------------------------------------------------------------------
    // --- Private functions - Security -------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Handle device `NOTIFICATION_SESSION_EXPIRED`
     * @private
     */
    _onDeviceNotificationSessionExpired: function()
    {
        // 1. cleanup
        this._killConnection();

        // 2. toggle visibility
        this._disableInterface();

        // 3. output
        this._alertMessage.show('Your session expired to ensure the safety of your data', true, { sLabel: 'Start new session', fClickHandler: function() { window.open('/', '_self') } });
    },

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
     * Disable interface
     * @private
     */
    _disableInterface: function()
    {
        // 1. hide
        if (this._connector) this._connector.hide();
        if (this._manualConnectInput) this._manualConnectInput.hide();
        if (this._manualConnectHandshake) this._manualConnectHandshake.hide();
        if (this._dataOutput) this._dataOutput.hide();
        if (this._dataInput) this._dataInput.hide();
        if (this._toggleDirectionButton) this._toggleDirectionButton.hide();
    },

    /**
     * Set state
     * @param sState
     * @param bBothDevicesOnline
     * @private
     */
    _setState: function(sState, bBothDevicesOnline)
    {
        // 1. store
        this._sState = sState;

        // 2. toggle visibility
        this._alertMessage.hide();

        // 3. select
        switch(this._sState)
        {
            case this.STATE_PRIMARYDEVICE_WAITINGFORSECONDARYDEVICE:

                // a. show
                this._connector.show();
                break;

            case this.STATE_SECONDARYDEVICECONNECTED:

                // a. verify
                if (this._connector)
                {
                    // I. hide
                    this._connector.hide();

                    // 2. cleanup
                    delete this._connector;
                }

                // b. verify
                if (bBothDevicesOnline)
                {
                    // I. toggle visibility
                    if (this._isOutputDevice())
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
                    //console.log('NOT both devices online');
                }

                break;
        }
    }

};
