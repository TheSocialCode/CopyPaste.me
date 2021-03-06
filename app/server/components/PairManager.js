/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';


// import project classes
const Device = require('./Device');
const DeviceManager = require('./DeviceManager');
const Pair = require('./Pair');
const ConnectorEvents = require('./../../client/components/Connector/ConnectorEvents');

// import extenders
const EventDispatcherExtender = require('./../../common/extenders/EventDispatcherExtender');

// import core module
const CoreModule_Assert = require('assert');

// import utils
const Module_Crypto = require('asymmetric-crypto');
const Module_GenerateUniqueID = require('generate-unique-id');



module.exports = function()
{
    // start
    this.__construct();
};

module.exports.prototype = {

    // data
    _aPairs: [],
    _aIdlePairs: [],

    // events
    DATA_READY_FOR_TRANSFER: 'DATA_READY_FOR_TRANSFER',

    // utils
    _timerLog: null,
    _timerManualCodes: null,

    // access
    _aManualCodes: [],

    // logs
    _aConnectedPairs: [],       // which pairs actually had two devices connected at one point
    _aUsedPairs: [],            // which pairs where actually used to share data



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
        
        // ---

        // 2. configure
        this.Mimoto.deviceManager.addEventListener(DeviceManager.prototype.DEVICE_OFFLINE, this._onDeviceManagerDeviceOffline.bind(this));
        this.Mimoto.deviceManager.addEventListener(DeviceManager.prototype.DEVICE_REMOVED, this._onDeviceManagerDeviceRemoved.bind(this));
    },



    // ----------------------------------------------------------------------------
    // --- Public methods ---------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Init pair
     * @param primaryDeviceSocket
     * @param sPrimaryDevicePublicKey
     * @return object Pair
     */
    initPair: function(primaryDeviceSocket, sPrimaryDevicePublicKey)
    {
        // 1. load
        let device = this.Mimoto.deviceManager.getDeviceBySocketID(primaryDeviceSocket.id);

        // 2. init
        let pair = new Pair(primaryDeviceSocket, sPrimaryDevicePublicKey, device.getID());

        // 3. configure
        pair.addEventListener(Pair.prototype.ACTIVE, this._onPairActive.bind(this, pair));
        pair.addEventListener(Pair.prototype.IDLE, this._onPairIdle.bind(this, pair));
        pair.addEventListener(Pair.prototype.EXPIRED, this._onPairExpired.bind(this, pair));
        pair.addEventListener(ConnectorEvents.prototype.ERROR_SECURITY_COMPROMISED, this._onPairSecurityCompromised.bind(this));

        // 4. store
        this._aPairs['' + pair.getID()] = pair;

        // 5. connect
        pair.setPrimaryDeviceID(device.getID());

        // 6. store
        device.setPairID(pair.getID());
        device.setType(Device.prototype.PRIMARYDEVICE);

        // 7. send
        return pair;
    },

    /**
     * Get pair by device ID
     * @param sDeviceID
     * @returns {boolean}
     */
    getPairByDeviceID: function(sDeviceID)
    {
        // 1. load
        let device = this.Mimoto.deviceManager.getDeviceByDeviceID(sDeviceID);

        // 2. validate
        if (device === false || !device.getPairID()) return false;

        // 3. load
        let pair = this._aPairs['' + device.getPairID()];

        // 4. validate
        if (!pair) return false;

        // 5. send
        return pair;
    },

    /**
     * Get pair by socket ID
     * @param sSocketID
     * @returns {boolean}
     */
    getPairBySocketID: function(sSocketID)
    {
        // 1. load
        let device = this.Mimoto.deviceManager.getDeviceBySocketID(sSocketID);

        // 2. validate
        if (device === false || !device.getPairID()) return false;

        // 3. load
        let pair = this._aPairs['' + device.getPairID()];

        // 4. validate
        if (!pair) return false;

        // 5. send
        return pair;
    },



    // ----------------------------------------------------------------------------
    // --- Event handlers - Pairing -----------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Handle device manager `DEVICE_OFFLINE`
     * @param device
     * @private
     */
    _onDeviceManagerDeviceOffline: function(device)
    {
        // 1. load
        let pair = this._aPairs['' + device.getPairID()];

        // 2. verify
        if (!pair) return;

        // 3. verify
        if (pair.getPrimaryDeviceID() === device.getID())
        {
            // a. cleanup
            pair.clearPrimaryDevice();

            // b. report
            if (pair.hasSecondaryDevice()) pair.getSecondaryDevice().emit(ConnectorEvents.prototype.UPDATE_OTHERDEVICE_DISCONNECTED);
        }

        // 4. verify
        if (pair.getSecondaryDeviceID() === device.getID())
        {
            // a. cleanup
            pair.clearSecondaryDevice();

            // b. report
            if (pair.hasPrimaryDevice()) pair.getPrimaryDevice().emit(ConnectorEvents.prototype.UPDATE_OTHERDEVICE_DISCONNECTED);
        }
    },

    /**
     * Handle device manager `DEVICE_REMOVED`
     * @param device
     * @private
     */
    _onDeviceManagerDeviceRemoved: function(device)
    {
        // 1. load
        let pair = this._aPairs['' + device.getPairID()];

        // 2. verify
        if (!pair) return;


        // 1. also cleanup other device (check if hasPrimary) -> get deviceBySocketID -> remove


        // 3. cleanup
        if (pair.getPrimaryDeviceID() === device.getID()) pair.clearPrimaryDevice();
        if (pair.getSecondaryDeviceID() === device.getID()) pair.clearSecondaryDevice();


    },

    /**
     * Handle pair `ERROR_SECURITY_COMPROMISED`
     * @param requestingDevice
     * @param pair
     * @private
     */
    _onPairSecurityCompromised: function(requestingDevice, pair)
    {
        // 1. warn
        this._broadcastSecurityWarning(requestingDevice, pair);

        // 2. cleanup
        this.destroy(pair.getID());
    },

    /**
     * Broadcast security warning
     * @param requestingDevice
     * @param pair
     * @private
     */
    _broadcastSecurityWarning: function(requestingDevice, pair)
    {
        // 1. load
        let requestingSocket = requestingDevice.getSocket();
        
        // 2. verify and broadcast
        if (requestingSocket) requestingSocket.emit(ConnectorEvents.prototype.ERROR_SECURITY_COMPROMISED);
        
        // 3. verify and broadcast
        if (pair.hasPrimaryDevice()) pair.getPrimaryDevice().emit(ConnectorEvents.prototype.ERROR_SECURITY_COMPROMISED);

        // 4. verify and broadcast
        if (pair.hasSecondaryDevice()) pair.getSecondaryDevice().emit(ConnectorEvents.prototype.ERROR_SECURITY_COMPROMISED);
    },

    /**
     * Destroy pair (used after possible security compromise)
     * @param sPairID
     */
    destroy: function(sPairID)
    {
        // 1. load
        let pair = this._aPairs['' + sPairID];

        // 2. verify
        if (!pair) return;

        // 3. cleanup
        if (this._aPairs[pair.getID()]) delete this._aPairs[pair.getID()];
        if (this._aIdlePairs[pair.getID()]) delete this._aIdlePairs[pair.getID()];

        // 4. cleanup
        this.Mimoto.deviceManager.destroy(pair.getPrimaryDeviceID());
        this.Mimoto.deviceManager.destroy(pair.getSecondaryDeviceID());

        // 5. cleanup
        delete this._aPairs['' + sPairID];
    },

    /**
     * Get number of active pairs
     * @returns number
     */
    getNumberOfActivePairs: function()
    {
        return Object.keys(this._aPairs).length;
    },

    /**
     * Get number of idle pairs
     * @returns number
     */
    getNumberOfIdlePairs: function()
    {
        return Object.keys(this._aIdlePairs).length;
    },

    getActivePairs: function()
    {
        return this._aPairs;
    },



    // ----------------------------------------------------------------------------
    // --- Private functions ------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Handle pair `ACTIVE`
     * @param pair
     * @private
     */
    _onPairActive: function(pair)
    {
        // 1. cleanup
        if (this._aIdlePairs[pair.getID()]) delete this._aIdlePairs[pair.getID()];
    },

    /**
     * Handle pair `IDLE`
     * @param pair
     * @private
     */
    _onPairIdle: function(pair)
    {
        // 1. store
        if (!this._aIdlePairs[pair.getID()]) this._aIdlePairs[pair.getID()] = pair;
    },

    /**
     * Handle pair `EXPIRED`
     * @param pair
     * @private
     */
    _onPairExpired: function(pair)
    {
        // 1. load
        let primaryDevice = this.Mimoto.deviceManager.getDeviceByDeviceID(pair.getPrimaryDeviceID());
        let secondaryDevice = this.Mimoto.deviceManager.getDeviceByDeviceID(pair.getSecondaryDeviceID());

        // 2. notify
        if (primaryDevice && primaryDevice.getSocket()) primaryDevice.getSocket().emit(ConnectorEvents.prototype.NOTIFICATION_SESSION_EXPIRED);
        if (secondaryDevice && secondaryDevice.getSocket()) secondaryDevice.getSocket().emit(ConnectorEvents.prototype.NOTIFICATION_SESSION_EXPIRED);

        // 3. cleanup
        this.destroy(pair.getID());
    }

};
