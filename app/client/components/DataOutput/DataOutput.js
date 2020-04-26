/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';


// import
const SharedData = require('./SharedData/SharedData');
const ClearClipboard = require('./ClearClipboard/ClearClipboard');
const Waiting = require('./../Waiting/Waiting');
const Module_Crypto = require('asymmetric-crypto');


module.exports = function(socket)
{
    // start
    this.__construct(socket);
};

module.exports.prototype = {

    // views
    _elRoot: null,
    _elContainer: null,
    _elProgress: null,

    // components
    _waiting: null,
    _clearClipboard: null,

    // data
    _aSharedData: [],

    // state
    _bIsMuted: null,



    // ----------------------------------------------------------------------------
    // --- Constructor ------------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Constructor
     */
    __construct: function (socket)
    {
        // 1. register
        this._elRoot = document.querySelector('[data-mimoto-id="component_DataOutput"]');
        this._elContainer = this._elRoot.querySelector('[data-mimoto-id="component_DataOutput_container"]');
        this._elProgress = this._elRoot.querySelector('[data-mimoto-id="progress"]');

        // 2. init
        this._waiting = new Waiting();
        this._clearClipboard = new ClearClipboard();
    },



    // ----------------------------------------------------------------------------
    // --- Public methods ---------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Show component
     */
    show: function()
    {
        // 1. toggle
        this._elRoot.classList.add('show');

        // 2. validate and toggle
        if (this._elContainer.children.length === 0 && !this._bIsMuted) this._waiting.show();
    },

    /**
     * Hide component
     */
    hide: function()
    {
        // 1. validate and toggle
        if (this._elContainer.children.length === 0) this._elRoot.classList.remove('show');

        // 2. toggle
        this._waiting.hide();
    },

    mute: function()
    {
        this._bIsMuted = true;
    },

    unmute: function()
    {
        this._bIsMuted = false;
    },

    /**
     * Show data that was shared with this client
     * @param data
     */
    prepareData: function(data)
    {
        // 1. toggle
        this._waiting.hide();

        // 2. verify
        if (!this._aSharedData[data.id])
        {
            // a. create
            let sharedData = new SharedData(this._elContainer);

            // b. configure
            sharedData.addEventListener(SharedData.prototype.CLEARED, this._onSharedDataCleared.bind(this, sharedData));
            sharedData.addEventListener(SharedData.prototype.USED_CLIPBOARD, this._onSharedDataUsedClipboard.bind(this, sharedData));

            // c. store
            this._aSharedData[data.id] = sharedData;

            // d. init
            this._aSharedData[data.id].initData(data);
        }
        else
        {
            // a. update
            this._aSharedData[data.id].showProgress(data);
        }
    },

    /**
     * Show data that was shared with this client
     * @param data
     */
    showData: function(data)
    {
        // 1. verify and forward
        if (this._aSharedData[data.id]) this._aSharedData[data.id].showData(data);
    },

    /**
     * Handle sharedData event `CLEARED`
     * @param sharedData
     */
    _onSharedDataCleared: function(sharedData)
    {
        // a. verify and show
        if (this._elContainer.children.length === 0 && !this._bIsMuted) this._waiting.show();

        // b. find
        for (let nIndex = 0; nIndex < this._aSharedData.length; nIndex++)
        {
            if (this._aSharedData[nIndex] === sharedData)
            {
                this._aSharedData.splice(nIndex, 1);
            }
        }
    },

    /**
     * Handle sharedData event 'USED_CLIPBOARD'
     * @private
     */
    _onSharedDataUsedClipboard: function()
    {
        // 1. toggle visibility
        this._clearClipboard.show();
    }

};
