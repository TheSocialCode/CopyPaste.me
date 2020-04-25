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
    DATA_PREPARE_FOR_DISPLAY: 'data_prepare_for_display',
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
        // 1. clone
        //let dataToTransfer = JSON.parse(JSON.stringify(data));

        // 2. prepare
        let sJSONValueToTransfer = JSON.stringify(dataToTransfer.value);

        // 3. encrypt and store
        let fileName = (dataToTransfer.sType ===  DataInput.prototype.DATATYPE_DOCUMENT) ? Module_Crypto.encrypt(dataToTransfer.value.fileName, this._sTheirPublicKey, this._myKeyPair.secretKey) : '';

        // 4. cleanup
        dataToTransfer.value = '';

        // 5. setup
        dataToTransfer.id = Module_GenerateUniqueID({ length: 32 });
        dataToTransfer.packageCount = Math.ceil(sJSONValueToTransfer.length / this._nSizePerPackage);
        dataToTransfer.totalSize = sJSONValueToTransfer.length;

        // 6. split
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
                if (dataToTransfer.sType ===  DataInput.prototype.DATATYPE_DOCUMENT)
                {
                    // 1. encrypt and store
                    packageToTransfer.metaData.fileName = fileName;
                }
            }

            // f. clone and store
            this._aPackagesReadyForTransfer.push(packageToTransfer);
        }

        // 7. configure
        if (this._timerPackageTransfer === null) this._timerPackageTransfer = setInterval(this._transferPackages.bind(this), 10);
    },

    /**
     * Continue to next package
     * @param data
     */
    continueToNextPackage: function(data)
    {
        // 1. cleanup
        this._packageCurrentlyInTransfer = null;

        // 2. start next transfer
        if (this._aPackagesReadyForTransfer.length > 0 && this._timerPackageTransfer === null) this._timerPackageTransfer = setInterval(this._transferPackages.bind(this), 100);
    },

    /**
     * Transfer packages
     * @private
     */
    _transferPackages: function()
    {
        // 1. stop
        clearInterval(this._timerPackageTransfer);

        // 2. cleanup
        this._timerPackageTransfer = null;

        // 3. verify
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

            // --- prepare

            // // b. init
            // let metaData = {
            //     sType: receivedData.sType
            // };
            //
            // // c. read
            // if (receivedData.sType ===  DataInput.prototype.DATATYPE_DOCUMENT)
            // {
            //     metaData.sFileName = Module_Crypto.decrypt(receivedData.metaData.fileName.data, receivedData.metaData.fileName.nonce, this._sTheirPublicKey, this._myKeyPair.secretKey);
            // }
            //
            // // d. broadcast event
            // this.dispatchEvent(this.DATA_PREPARE_FOR_DISPLAY, metaData);
        }

        // 2. store
        this._aReceivedPackages[receivedData.id].packages[receivedData.packageNumber] = receivedData;

        // 3. update
        this._aReceivedPackages[receivedData.id].receivedCount = Object.keys(this._aReceivedPackages[receivedData.id].packages).length;


        // debugging
        //if (console) console.log('Package # ' + this._aReceivedPackages[receivedData.id].receivedCount + ' of ' + this._aReceivedPackages[receivedData.id].packageCount);

        // b. init
        let metaData = {
            sType: receivedData.sType,
            receivedCount: this._aReceivedPackages[receivedData.id].receivedCount,
            totalCount: this._aReceivedPackages[receivedData.id].packageCount
        };

        this.dispatchEvent(this.DATA_PREPARE_FOR_DISPLAY, metaData);



        // --- recombine


        // 5. validate
        if (this._aReceivedPackages[receivedData.id].receivedCount === this._aReceivedPackages[receivedData.id].packageCount)
        {
            // a. init
            let sJSONReceivedValue = '';

            // b. recombine
            for (let nPackageIndex = 0; nPackageIndex < this._aReceivedPackages[receivedData.id].packageCount; nPackageIndex++)
            {
                // I. register
                let receivedPackage = this._aReceivedPackages[receivedData.id].packages[nPackageIndex];

                // II. decrypt and combine
                sJSONReceivedValue += Module_Crypto.decrypt(receivedPackage.value.data, receivedPackage.value.nonce, this._sTheirPublicKey, this._myKeyPair.secretKey);
            }

            // c. init and compose
            let data = {
                sType: this._aReceivedPackages[receivedData.id].sType,
                value: JSON.parse(sJSONReceivedValue)
            };

            // d. cleanup
            delete this._aReceivedPackages[receivedData.id];

            // e. broadcast event
            this.dispatchEvent(this.DATA_READY_FOR_DISPLAY, data);
        }
    }

};
