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
    DATA_READY_FOR_TRANSFER: 'data_ready_for_transfer',

    // utils
    _timerLog: null,
    _timerManualCodes: null,

    // access
    _aManualCodes: [],

    // logs
    _aConnectedPairs: [],       // which pairs actually had two devices connected at one point
    _aUsedPairs: [],            // which pairs where actually used to share data

    // connection types
    CONNECTIONTYPE_QR: 'qr',
    CONNECTIONTYPE_MANUAL: 'manual',



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
        pair.addEventListener(ConnectorEvents.prototype.SECURITY_COMPROMISED, this._onPairSecurityCompromised.bind(this));

        // 4. store
        this._aPairs['' + pair.getID()] = pair;

        // 5. connect
        pair.setPrimaryDeviceID(device.getID());

        // 6. store
        device.setPairID(pair.getID());

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

        // 3. cleanup
        if (pair.getPrimaryDeviceID() === device.getID()) pair.clearPrimaryDevice();
        if (pair.getSecondaryDeviceID() === device.getID()) pair.clearSecondaryDevice();
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
        if (requestingSocket) requestingSocket.emit(ConnectorEvents.prototype.SECURITY_COMPROMISED);
        
        // 3. verify and broadcast
        if (pair.hasPrimaryDevice()) pair.getPrimaryDevice().emit(ConnectorEvents.prototype.SECURITY_COMPROMISED);

        // 4. verify and broadcast
        if (pair.hasSecondaryDevice()) pair.getSecondaryDevice().emit(ConnectorEvents.prototype.SECURITY_COMPROMISED);
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


        // if (pair.getPrimaryDeviceID())
        // {
        //     this.Mimoto.deviceManager.
        // }
        
        // activepairts -> allpairs
        
        //(inactivepars = subset)
        //aIdlePairs = subset 



        // 3. cleanup connected devices;

        // delete this._aDevicesBySocketID['' + pair.primaryDevice.id];
        // delete this._aDevicesByDeviceID['' + pair.getPrimaryDeviceID()];
        // delete this._aDevicesBySocketID['' + pair.secondaryDevice.id];
        // delete this._aDevicesByDeviceID['' + pair.getSecondaryDeviceID()];





        // 4. cleanup
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
     * Get number of inactive pairs
     * @returns number
     */
    getNumberOfInactivePairs: function()
    {
        return Object.keys(this._aIdlePairs).length;
    },

    getActivePairs: function()
    {
        return this._aPairs;
    }

};



// unregisterSocket: function(socket)
// {
    // // 1. clear configuration
    // socket.removeAllListeners();
    //
    // // 2. load
    // let device = this._aDevicesBySocketID['' + socket.id];
    //
    // // 3. cleanup
    // delete this._aDevicesBySocketID['' + socket.id];
    // delete this._aDevicesByDeviceID['' + device.getDeviceID()];
    //
    // // 4. register
    // let sPairID = device.getPairID();
    //
    // // 5. validate
    // if (!sPairID) return;
    //
    // // 6. register
    // let pair = this._aPairs['' + device.getPairID()];
    //
    // // 7. validate
    // if (pair === false) return;
    //
    //
    //
    // return;
    //
    //
    // // 9. validate
    // if (pair.primaryDevice && pair.primaryDevice.id === socket.id)
    // {
    //     // a. cleanup
    //     pair.primaryDevice = null;
    //
    //     // b. send
    //     if (pair.secondaryDevice) pair.secondaryDevice.emit('primarydevice_disconnected');
    //
    //     // c. log
    //     this._dbCollection_pairs.updateMany(
    //         {
    //             "data.token": sToken
    //         },
    //         {
    //             $push: { logs: { action: this._ACTIONTYPE_PRIMARYDEVICE_DISCONNECTED, timestamp: new Date().toUTCString() } }
    //         },
    //         function(err, result)
    //         {
    //             CoreModule_Assert.equal(err, null);
    //         }
    //     );
    // }
    //
    // // 10. validate
    // if (pair.secondaryDevice && pair.secondaryDevice.id === socket.id)
    // {
    //     // a. cleanup
    //     pair.secondaryDevice = null;
    //
    //     // b. send
    //     if (pair.primaryDevice) pair.primaryDevice.emit('secondarydevice_disconnected');
    //
    //     // c. log
    //     this._dbCollection_pairs.updateMany(
    //         {
    //             "data.token": sToken
    //         },
    //         {
    //             $push: { logs: { action: this._ACTIONTYPE_SECONDARYDEVICE_DISCONNECTED, timestamp: new Date().toUTCString() } }
    //         },
    //         function(err, result)
    //         {
    //             CoreModule_Assert.equal(err, null);
    //         }
    //     );
    // }
    //
    // // 11. validate
    // if (!pair.primaryDevice && !pair.secondaryDevice)
    // {
    //     // a. move
    //     this._aIdlePairs[sToken] = pair;
    //
    //     // b. clear
    //     delete this._aPairs[sToken];
    //
    //     // c. store
    //     pair.log.push( { type: this._ACTIONTYPE_ARCHIVED, timestamp: new Date().toUTCString() } );
    //
    //     // d. log
    //     this._dbCollection_pairs.updateMany(
    //         {
    //             "data.token": sToken
    //         },
    //         {
    //             $set: { "states.archived" : true },
    //             $push: { logs: { action: this._ACTIONTYPE_ARCHIVED, timestamp: new Date().toUTCString() } }
    //         },
    //         function(err, result)
    //         {
    //             CoreModule_Assert.equal(err, null);
    //         }
    //     );
    // }
    //
    //
    // // --- log ---
    //
    //
    // // 12. output
    // this._logUsers('User disconnected (socket.id = ' + socket.id + ')');
//},
