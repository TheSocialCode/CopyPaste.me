/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';


// import extenders
const EventDispatcherExtender = require('./../../../extenders/EventDispatcherExtender');

// import helpers
const Module_FileSaver = require('file-saver');
const Module_ClipboardCopy = require('clipboard-copy');
const DataInput = require('./../../DataInput/DataInput');


module.exports = function(elDataContainer)
{
    // start
    this.__construct(elDataContainer);
};

module.exports.prototype = {

    // connection
    _elDataContainer: null,
    _elButton: null,
    _elData: null,
    _data: null,
    _timer: null,
    _nTimeToAutoDestruct: 0,

    // utils
    _aEvents: [],

    // events
    CLEARED: 'onCleared',
    USED_CLIPBOARD: 'onUsedClipboard',



    // ----------------------------------------------------------------------------
    // --- Constructor ------------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Constructor
     */
    __construct: function (elDataContainer)
    {
        // 1. extend
        new EventDispatcherExtender(this);

        // 2. store
        this._elDataContainer = elDataContainer;

        // 3. init
        var elDataTemplate = document.getElementById('template-data');

        // 4. copy and prepare
        this._elData = elDataTemplate.cloneNode(true);
        this._elData.removeAttribute('id');
        this._elButton = this._elData.querySelector('[data-mimoto-id="receiver_data_button"]');

        // 5. show
        this._elDataContainer.insertBefore(this._elData, this._elDataContainer.firstChild);


    // case DataInput.prototype.DATATYPE_DOCUMENT:
    //
    //     this._elData.querySelector('[data-mimoto-id=receiver_data_label_data]').innerText = this._data.value.fileName;
    //     this._elButton.innerText = 'Download';
    //     break;


        // TEMP
        //this.showData(data);
    },


    // ----------------------------------------------------------------------------
    // --- Public methods ---------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Show data
     * @private
     */
    showData: function(data)
    {
        // 1. store
        this._data = data;

        // 2. init
        this._nTimeToAutoDestruct = new Date().getTime() + 2 * 60 * 1000 + 900 + ((this._elDataContainer.children.length > 1) ? 1000 : 0);

        // 3. select
        switch(this._data.sType)
        {
            case DataInput.prototype.DATATYPE_PASSWORD:

                this._elData.querySelector('[data-mimoto-id=receiver_data_label_data]').innerText = '* * * * * * * * *';
                this._elButton.innerText = 'Copy to clipboard';
                break;

            case DataInput.prototype.DATATYPE_URL:

                this._elData.querySelector('[data-mimoto-id=receiver_data_label_data]').innerText = this._data.value;
                this._elButton.innerText = 'Open URL';
                break;

            case DataInput.prototype.DATATYPE_TEXT:

                this._elData.querySelector('[data-mimoto-id=receiver_data_label_data]').innerText = this._data.value;
                this._elButton.innerText = 'Copy to clipboard';
                break;

            case DataInput.prototype.DATATYPE_IMAGE:

                var elImage = document.createElement('img');

                // loader -> get originalWidth or max width

                elImage.setAttribute('width', 300); // #todo setup default container
                elImage.setAttribute('src', this._data.value.base64);

                this._elData.querySelector('[data-mimoto-id=receiver_data_label_data]').append(elImage);
                this._elButton.innerText = 'Download';

                break;

            case DataInput.prototype.DATATYPE_DOCUMENT:

                this._elData.querySelector('[data-mimoto-id=receiver_data_label_data]').innerText = this._data.value.fileName;
                this._elButton.innerText = 'Download';
                break;
        }

        // 4. configure
        this._elButton.addEventListener('click', this._onButtonClick.bind(this));

        // 5. configure
        this._elData.querySelector('[data-mimoto-id=receiver_data_option_clearnow]').addEventListener('click', function(elData) {

            this._clearData(elData);

        }.bind(this, this._elData));

        // 6. configure
        this._elData.querySelector('[data-mimoto-id=receiver_data_option_extend]').addEventListener('click', function() {

            this._extendAutoDestructionDelay()

        }.bind(this));

        // 7. setup
        this._timer = setInterval(function()
        {
            if (this._updateTimer())
            {
                this._clearData();
            }

        }.bind(this), 100);


        // 8. register
        let elContent = this._elData.querySelector('[data-mimoto-id="content"]');

        // 9. verify
        if (this._elDataContainer.children.length === 0)
        {
            elContent.classList.add('show');
        }
        else
        {
            this._show(elContent);
        }
    },



    // ----------------------------------------------------------------------------
    // --- Private methods --------------------------------------------------------
    // ----------------------------------------------------------------------------



    /**
     * Show
     * @param elContent
     * @private
     */
    _show: function(elContent)
    {
        // 5. register
        let nPlaceholderHeight = this._elData.offsetHeight + 10;

        // a. register
        let elPlaceholder = this._elData.querySelector('[data-mimoto-id="placeholder"]');

        // b. hide
        elContent.style.display = 'none'; // #todo - move to css class

        // c. start animation
        let timerIntro = setTimeout(function(elPlaceholder)
        {
            elPlaceholder.style.height = nPlaceholderHeight + 'px';

        }.bind(this, elPlaceholder), 10);

        // d. show actual element
        let timerIntroEnd = setTimeout(function(elPlaceholder, elContent)
        {
            elPlaceholder.style.display = 'none';
            elContent.style.display = 'block';

            // c. start animation
            let fadeInIntro = setTimeout(function(elContent)
            {
                elContent.classList.add('show');

            }.bind(this, elContent), 10);

        }.bind(this, elPlaceholder, elContent), 310);
    },

    /**
     * Hide
     * @private
     */
    _hide: function()
    {
        // 1. register
        let nPlaceholderHeight = this._elData.offsetHeight + 10;

        // 2. register
        let elContent = this._elData.querySelector('[data-mimoto-id="content"]');
        let elPlaceholder = this._elData.querySelector('[data-mimoto-id="placeholder"]');

        // 3. hide
        elContent.style.display = 'none'; // #todo - move to css class

        // 4. setup
        elPlaceholder.style.height = nPlaceholderHeight;
        elPlaceholder.style.display = 'block';

        // 5. start animation
        let timerOutro = setTimeout(function(elPlaceholder)
        {
            elPlaceholder.style.height = 0;

        }.bind(this, elPlaceholder), 10);

        // 7. show actual element
        let timerOutroEnd = setTimeout(function()
        {
            // 2. clear
            this._elDataContainer.removeChild(this._elData);

            // 3.
            this.dispatchEvent(this.CLEARED);

        }.bind(this), 310);
    },

    /**
     * Update auto desctruction timer
     * @returns {boolean}
     * @private
     */
    _updateTimer: function()
    {
        // 1. init
        let nDifference = this._nTimeToAutoDestruct - new Date().getTime();

        // 2. convert
        let nMinutes = Math.floor((nDifference % (1000 * 60 * 60)) / (1000 * 60));
        let nSeconds = Math.floor((nDifference % (1000 * 60)) / 1000);

        // 3. build
        let sRemainingTime = '';
        if (nMinutes > 0) sRemainingTime = nMinutes + ' ' + ((nMinutes === 1) ? 'min' : 'mins') + ' ';
        sRemainingTime += ((nSeconds === 60) ? ((nMinutes !== 0) ? 0 : nSeconds) : nSeconds) + ' ' + ((nSeconds === 1) ? 'sec' : 'secs');

        // 4. update
        this._elData.querySelector('[data-mimoto-id=receiver_data_lifetime]').innerText = sRemainingTime;

        // 5. verify and send
        return (nDifference <= 0);
    },

    /**
     * Extend auto destruction delay
     * @private
     */
    _extendAutoDestructionDelay: function()
    {
        // 1. define
        let nExtendedDuration = 60 * 1000;

        // 2. extend
        let nNewTime = Math.round((this._nTimeToAutoDestruct - new Date().getTime()) / nExtendedDuration) * nExtendedDuration + (nExtendedDuration + 900);

        // 3. update and store
        this._nTimeToAutoDestruct = new Date().getTime() + nNewTime;
    },

    /**
     * Clear data
     * @private
     */
    _clearData: function()
    {
        // 1. cleanup
        clearInterval(this._timer);

        // 2. hide
        this._hide();
    },

    /**
     * Handle button event `click`
     * @private
     */
    _onButtonClick: function()
    {
        // 1. select
        switch(this._data.sType)
        {
            case DataInput.prototype.DATATYPE_PASSWORD:

                // a. copy
                this._copyToClipboard(this._data.value);

                // b. broadcast
                this.dispatchEvent(this.USED_CLIPBOARD);
                break;

            case DataInput.prototype.DATATYPE_URL:

                // a. open
                window.open(this._data.value, '_blank');
                break;

            case DataInput.prototype.DATATYPE_TEXT:

                // a. copy
                this._copyToClipboard(this._data.value);

                // b. broadcast
                this.dispatchEvent(this.USED_CLIPBOARD);
                break;

            case DataInput.prototype.DATATYPE_IMAGE:

                // a. download
                Module_FileSaver.saveAs(this._data.value.base64, this._data.value.fileName);
                break;

            case DataInput.prototype.DATATYPE_DOCUMENT:

                // a. download
                Module_FileSaver.saveAs(this._data.value.base64, this._data.value.fileName);
                break;
        }
    },

    /**
     * Copy to clipboard
     * @param sValue
     * @private
     */
    _copyToClipboard: function(sValue)
    {
        // 1. copy
        Module_ClipboardCopy(this._data.value);

        // 2. prepare
        this._elData.classList.add('clear');

        // 3. time clearing of animation
        let timerCover = setTimeout(function()
        {
            // a. cleanup
            this._elData.classList.remove('clear');

        }.bind(this), 1200);
    }

};
