/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';


// import extenders
const EventDispatcherExtender = require('./../../common/extenders/EventDispatcherExtender');

// import utils
const Module_Crypto = require('asymmetric-crypto');
const Module_GenerateUniqueID = require('generate-unique-id');
const DataInput = require('./../components/DataInput/DataInput');


module.exports = function()
{
    // start
    this.__construct();
};

module.exports.prototype = {

    // data
    _aReceivedPackages: [],
    _aPackagesReadyForTransfer: [],
    _packageCurrentlyInTransfer: null,

    // security
    _myKeyPair: null,
    _sTheirPublicKey: '',

    // settings
    _nSizePerPackage: 100000,

    // utils
    _timerPackageTransfer: null,
    _bPaused: false,

    // events
    DATA_READY_FOR_TRANSFER: 'data_ready_for_transfer',
    DATA_LOADING: 'DATA_LOADING',
    DATA_READY_FOR_DISPLAY: 'data_ready_for_display',



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

        // 2. create
        this._myKeyPair = Module_Crypto.keyPair();
    },



    // ----------------------------------------------------------------------------
    // --- Public methods ---------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Get my public key
     * @returns string
     */
    getMyPublicKey: function()
    {
        // 1. send
        return this._myKeyPair.publicKey;
    },

    setTheirPublicKey: function(sTheirPublicKey)
    {
        // 1. store
        this._sTheirPublicKey = sTheirPublicKey;
    },

    /**
     * Pause transfer
     */
    pause: function()
    {
        // 1. toggle
        this._bPaused = true;

        // 2. cancel
        if (this._timerPackageTransfer) clearInterval(this._timerPackageTransfer);

        // 3. cleanup
        this._timerPackageTransfer = null;
    },

    /**
     * Resume transfer
     * @param bOtherDeviceConnected
     */
    resume: function(bOtherDeviceConnected)
    {
        // 1. toggle
        this._bPaused = (bOtherDeviceConnected) ? false : true;

        // 2. resume
        this._transferPackages();
    },



    // ----------------------------------------------------------------------------
    // --- Sending data -----------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Prepare data for transfer
     * @param dataToTransfer
     */
    prepareDataForTransfer: function(dataToTransfer)
    {
        // 1. prepare
        let sJSONValueToTransfer = JSON.stringify(dataToTransfer.value);

        // 2. encrypt and store
        let fileName = (dataToTransfer.sType ===  DataInput.prototype.DATATYPE_FILE) ? Module_Crypto.encrypt(dataToTransfer.value.fileName, this._sTheirPublicKey, this._myKeyPair.secretKey) : '';

        // 3. cleanup
        dataToTransfer.value = '';

        // 4. setup
        dataToTransfer.id = Module_GenerateUniqueID({ length: 32 });
        dataToTransfer.packageCount = Math.ceil(sJSONValueToTransfer.length / this._nSizePerPackage);
        dataToTransfer.totalSize = sJSONValueToTransfer.length;

        // 5. split
        for (let nPackageIndex = 0; nPackageIndex < dataToTransfer.packageCount; nPackageIndex++)
        {
            // a. clone
            let packageToTransfer = JSON.parse(JSON.stringify(dataToTransfer));

            // a. store
            packageToTransfer.packageNumber = nPackageIndex;

            // b. split
            let sValueToEncrypt = sJSONValueToTransfer.substr(nPackageIndex * this._nSizePerPackage, this._nSizePerPackage);

            // c. store
            packageToTransfer.packageSize = sValueToEncrypt.length;

            // d. store
            packageToTransfer.value = sValueToEncrypt;

            // e. verify
            if (nPackageIndex === 0)
            {
                // I. init
                packageToTransfer.metaData = {};

                // II. verify
                if (dataToTransfer.sType ===  DataInput.prototype.DATATYPE_FILE)
                {
                    // 1. encrypt and store
                    packageToTransfer.metaData.fileName = fileName;
                }
            }

            // f. clone and store
            this._aPackagesReadyForTransfer.push(packageToTransfer);
        }

        // 6. configure
        if (this._timerPackageTransfer === null) this._timerPackageTransfer = setInterval(this._transferPackages.bind(this), 10);
    },

    /**
     * Continue to next package
     * @param data
     */
    continueToNextPackage: function(data)
    {
        // 1. validate
        if (this._packageCurrentlyInTransfer)
        {
            if (data && data.dataID === this._packageCurrentlyInTransfer.id && data.packageNumber === this._packageCurrentlyInTransfer.packageNumber)
            {
                // a. cleanup
                this._packageCurrentlyInTransfer = null;
            }
            else
            {
                // a. exit
                return;
            }
        }

        // 2. validate
        if (this._bPaused) return;

        // 3. start next transfer
        if (this._aPackagesReadyForTransfer.length > 0 && !this._timerPackageTransfer) this._timerPackageTransfer = setInterval(this._transferPackages.bind(this), 100);
    },

    /**
     * Transfer packages
     * @private
     */
    _transferPackages: function()
    {
        // 1. stop
        if (this._timerPackageTransfer) clearInterval(this._timerPackageTransfer);

        // 2. cleanup
        this._timerPackageTransfer = null;

        // 3. validate
        if (this._bPaused) return;

        // 4. verify
        if (this._aPackagesReadyForTransfer.length > 0 || this._packageCurrentlyInTransfer)
        {
            // a. load and remove
            if (!this._packageCurrentlyInTransfer)
            {
                // I. load
                this._packageCurrentlyInTransfer = this._aPackagesReadyForTransfer.shift();

                // II. encrypt
                this._packageCurrentlyInTransfer.value = Module_Crypto.encrypt(this._packageCurrentlyInTransfer.value, this._sTheirPublicKey, this._myKeyPair.secretKey);
            }

            // b. broadcast
            this.dispatchEvent(this.DATA_READY_FOR_TRANSFER, this._packageCurrentlyInTransfer);
        }
    },



    // ----------------------------------------------------------------------------
    // --- Receiving data ---------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Add event listener
     * @param receivedData
     */
    addPackage: function(receivedData)
    {
        // 1. verify or init
        if (!this._aReceivedPackages[receivedData.id])
        {
            // a. init and store
            this._aReceivedPackages[receivedData.id] = {
                id: receivedData.id,
                sType: receivedData.sType,
                packageCount: receivedData.packageCount,
                receivedCount: 0,
                packages: []
            };
        }

        // 2. store
        this._aReceivedPackages[receivedData.id].packages[receivedData.packageNumber] = receivedData;

        // 3. update
        this._aReceivedPackages[receivedData.id].receivedCount = Object.keys(this._aReceivedPackages[receivedData.id].packages).length;

        // 4. init
        let data = {
            id: receivedData.id,
            sType: receivedData.sType,
            receivedCount: this._aReceivedPackages[receivedData.id].receivedCount,
            totalCount: this._aReceivedPackages[receivedData.id].packageCount
        };

        // 5. add metadata
        if (receivedData.sType === DataInput.prototype.DATATYPE_FILE && receivedData.metaData && receivedData.metaData.fileName)
        {
            // a. decrypt
            data.sFileName = Module_Crypto.decrypt(receivedData.metaData.fileName.data, receivedData.metaData.fileName.nonce, this._sTheirPublicKey, this._myKeyPair.secretKey);
        }

        // 6. report
        this.dispatchEvent(this.DATA_LOADING, data);

        // 7. decrypt
        let jsonDecryptedValue = Module_Crypto.decrypt(receivedData.value.data, receivedData.value.nonce, this._sTheirPublicKey, this._myKeyPair.secretKey);

        // 8. store
        receivedData.value = jsonDecryptedValue;


        // 9. validate
        if (this._aReceivedPackages[receivedData.id].receivedCount === this._aReceivedPackages[receivedData.id].packageCount)
        {
            // a. init
            data.value = '';

            // b. recombine
            for (let nPackageIndex = 0; nPackageIndex < this._aReceivedPackages[receivedData.id].packageCount; nPackageIndex++)
            {
                // a. build
                data.value += this._aReceivedPackages[receivedData.id].packages[nPackageIndex].value;
            }

            // c. convert
            data.value = JSON.parse(data.value);

            // d. cleanup
            delete this._aReceivedPackages[receivedData.id];

            // e. broadcast event
            this.dispatchEvent(this.DATA_READY_FOR_DISPLAY, data);
        }
    }

};
