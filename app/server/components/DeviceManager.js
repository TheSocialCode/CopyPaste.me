/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';


// import project classes
const Device = require('./Device');
const ConnectorEvents = require('./../../client/components/Connector/ConnectorEvents');

// import extenders
const EventDispatcherExtender = require('./../../common/extenders/EventDispatcherExtender');




module.exports = function()
{
    // start
    this.__construct();
};

module.exports.prototype = {

    // source
    _aDevicesBySocketID: [],
    _aDevicesByDeviceID: [],
    _aOfflineDevices: [],

    // utils
    _timer: null,

    // events
    DEVICE_OFFLINE: 'DEVICE_OFFLINE',
    DEVICE_REMOVED: 'DEVICE_REMOVED',

    // config
    OFFLINE_DEVICE_LIFETIME: 0.5 * 60 * 60 * 1000,



    // ----------------------------------------------------------------------------
    // --- Constructor ------------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Constructor
     */
    __construct: function ()
    {
        // 1. extend
        new EventDispatcherExtender(this);

        // ---

        // 2. run garbage collection
        this._timer = setInterval(this._cleanupExpiredOfflineDevices.bind(this), 10 * 1000);
    },



    // ----------------------------------------------------------------------------
    // --- Public methods ---------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Register socket
     * @param socket
     */
    registerSocket: function(socket)
    {
        // 1. create
        let device = new Device(socket);

        // 2. store
        this._aDevicesBySocketID[socket.id] = device;
        this._aDevicesByDeviceID[device.getID()] = device;
    },

    /**
     * Unregister socket
     * @param socket
     */
    unregisterSocket: function(socket)
    {
        // 1. load
        let device = this._aDevicesBySocketID[socket.id];

        // 2. validate - OFFLINE_RESCUE_#1 - The device has been cleanup up when restoring an offline device
        if (!device)
        {
            // a. report
            this.Mimoto.logger.log('ALERT - An old offline socket tried to disconnect very late, but the connection was already restored. Skipping this one! socket.id = ' + socket.id);

            // b. exit
            return;
        }

        // 3. move and set moment of expiry
        this._aOfflineDevices[device.getID()] = {
            device: this._aDevicesByDeviceID[device.getID()],
            nExpires: new Date().getTime() + this.OFFLINE_DEVICE_LIFETIME
        };

        // 4. cleanup
        delete this._aDevicesBySocketID[socket.id];
        delete this._aDevicesByDeviceID[device.getID()];

        // 5. broadcast
        this.dispatchEvent(this.DEVICE_OFFLINE, device);
    },

    /**
     * Restore original device and merge new device into it
     * @param originalDevice
     * @param newDevice
     * @return object
     */
    restoreAndMerge: function(originalDevice, newDevice)
    {
        // 1. transfer
        originalDevice.updateSocket(newDevice.getSocket());

        // 2. cleanup
        delete this._aDevicesBySocketID[newDevice.getSocketID()];
        delete this._aDevicesByDeviceID[newDevice.getID()];

        // 3. cleanup
        delete this._aOfflineDevices[originalDevice.getID()];

        // 4. copy
        this._aDevicesBySocketID[originalDevice.getSocketID()] = originalDevice;
        this._aDevicesByDeviceID[originalDevice.getID()] = originalDevice;

        // 5. send
        return originalDevice;
    },

    /**
     * Get device by socket ID
     * @param sSocketID
     * @returns {*}
     */
    getDeviceBySocketID: function(sSocketID)
    {
        // 1. validate and send
        return (this._aDevicesBySocketID[sSocketID]) ? this._aDevicesBySocketID[sSocketID] : false;
    },

    /**
     * Get device by device ID
     * @param sDeviceID
     * @returns {*}
     */
    getDeviceByDeviceID: function(sDeviceID)
    {
        // 1. validate and send
        return (this._aDevicesByDeviceID[sDeviceID]) ? this._aDevicesByDeviceID[sDeviceID] : false;
    },

    /**
     * Get offline device by device ID
     * @param sDeviceID
     * @returns {*}
     */
    getOfflineDeviceByDeviceID: function(sDeviceID)
    {
        // 1. validate and send
        return (this._aOfflineDevices[sDeviceID]) ? this._aOfflineDevices[sDeviceID].device : false;
    },

    /**
     * Destroy device
     * @param sDeviceID
     */
    destroy: function(sDeviceID)
    {
        // 1. load
        let device = this.getDeviceByDeviceID(sDeviceID);

        // 2. validate
        if (!device) return;

        // 3. load
        let socket = device.getSocket();

        // 4. broadcast
        if (socket)
        {
            socket.emit(ConnectorEvents.prototype.NOTIFICATION_SESSION_EXPIRED);

            // b. cleanup
            delete this._aDevicesBySocketID[socket.id];
        }

        // 5. cleanup
        delete this._aOfflineDevices[sDeviceID];
        delete this._aDevicesByDeviceID[sDeviceID];
    },



    // ----------------------------------------------------------------------------
    // --- Private methods --------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Cleanup expired offline devices
     * @private
     */
    _cleanupExpiredOfflineDevices: function()
    {
        // 1. parse all
        for (let sKey in this._aOfflineDevices)
        {
            // a. register
            let offlineDeviceData = this._aOfflineDevices[sKey];

            // b.
            if (offlineDeviceData.device && offlineDeviceData.device.getPairID()) continue;

            // b. validate
            if (offlineDeviceData.nExpires >= new Date().getTime()) continue;

            // c. cleanup
            delete this._aOfflineDevices[sKey];

            // d. broadcast
            this.dispatchEvent(this.DEVICE_REMOVED, offlineDeviceData.device);
        }
    },



    // ----------------------------------------------------------------------------
    // --- Helpers for logging purposes -------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Get number of register devices
     * @returns number
     */
    getNumberOfDevices: function()
    {
        return Object.keys(this._aDevicesBySocketID).length;
    },

    /**
     * Get all devices sorted by socket ID
     * @returns array
     */
    getAllDevicesBySocketID: function()
    {
        return this._aDevicesBySocketID;
    },

    /**
     * Get all devices sorted by device ID
     * @returns array
     */
    getAllDevicesByDeviceID: function()
    {
        return this._aDevicesByDeviceID;
    },

    /**
     * Get all offline devices
     * @returns array
     */
    getAllOfflineDevices: function()
    {
        return this._aOfflineDevices;
    },

    /**
     * Get number of offline devices
     * @returns number
     */
    getNumberOfOfflineDevices: function()
    {
        return Object.keys(this._aOfflineDevices).length;
    }

};
