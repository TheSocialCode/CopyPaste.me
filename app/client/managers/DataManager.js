/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';


// import extenders
const EventDispatcherExtender = require('./../extenders/EventDispatcherExtender');

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
    _aReceivedDataPackages: [],
    _aPackagesReadyForTransfer: [],

    // security
    _myKeyPair: null,
    _sTheirPublicKey: '',

    // settings
    _nSizePerPackage: 200000,

    // utils
    _timerPackageTransfer: null,

    // events
    DATA_READY_FOR_TRANSFER: 'data_ready_for_transfer',
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
     * Prepare data for transfer
     * @param data
     */
    prepareDataForTransfer: function(data)
    {
        // 1. clone
        let dataToTransfer = JSON.parse(JSON.stringify(data));

        // 2. prepare
        let sJSONValueToTransfer = JSON.stringify(dataToTransfer.value);

        // 3. setup
        dataToTransfer.id = Module_GenerateUniqueID({ length: 32 });
        dataToTransfer.packageCount = Math.ceil(sJSONValueToTransfer.length / this._nSizePerPackage);

        // 4. split and transfer
        for (let nPackageIndex = 0; nPackageIndex < dataToTransfer.packageCount; nPackageIndex++)
        {
            // a. store
            dataToTransfer.packageNumber = nPackageIndex;

            // b. split
            let sValueToEncrypt = sJSONValueToTransfer.substr(nPackageIndex * this._nSizePerPackage, this._nSizePerPackage);

            // c. store
            dataToTransfer.packageSize = sValueToEncrypt.length;

            // d. encrypt
            dataToTransfer.value = Module_Crypto.encrypt(sValueToEncrypt, this._sTheirPublicKey, this._myKeyPair.secretKey);

            // e. clone and store
            this._aPackagesReadyForTransfer.push(JSON.parse(JSON.stringify(dataToTransfer)));
        }

        // 5. configure
        if (this._timerPackageTransfer === null) this._timerPackageTransfer = setInterval(this._transferPackages.bind(this), 10);
    },

    /**
     * Transfer packages
     * @private
     */
    _transferPackages: function()
    {
        // verify
        if (this._aPackagesReadyForTransfer.length > 0)
        {
            // a. load and remove
            let packageToTransfer = this._aPackagesReadyForTransfer.shift();

            // b. broadcast
            this.dispatchEvent(this.DATA_READY_FOR_TRANSFER, packageToTransfer);
        }
        else
        {
            // a. stop
            clearInterval(this._timerPackageTransfer);

            // b. cleanup
            this._timerPackageTransfer = null;
        }
    },

    /**
     * Add event listener
     * @param receivedData
     */
    addPackage: function(receivedData)
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


        // --- recombine


        // 4. validate
        if (this._aReceivedDataPackages[receivedData.id].receivedCount === this._aReceivedDataPackages[receivedData.id].packageCount)
        {
            // a. init
            let sJSONReceivedValue = '';

            // b. recombine
            let sValue = '';
            for (let nPackageIndex = 0; nPackageIndex < this._aReceivedDataPackages[receivedData.id].packageCount; nPackageIndex++)
            {
                // I. register
                let receivedPackage = this._aReceivedDataPackages[receivedData.id].packages[nPackageIndex];

                // II. decrypt and combine
                sJSONReceivedValue += Module_Crypto.decrypt(receivedPackage.value.data, receivedPackage.value.nonce, this._sTheirPublicKey, this._myKeyPair.secretKey);
            }

            // c. init and compose
            let data = {
                sType: this._aReceivedDataPackages[receivedData.id].sType,
                value: JSON.parse(sJSONReceivedValue)
            };

            // d. cleanup
            delete this._aReceivedDataPackages[receivedData.id];

            // e. broadcast event
            this.dispatchEvent(this.DATA_READY_FOR_DISPLAY, data);
        }
    }

};
