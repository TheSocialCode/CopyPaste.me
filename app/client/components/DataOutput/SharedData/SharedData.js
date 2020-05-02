/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';


// import extenders
const EventDispatcherExtender = require('./../../../../common/extenders/EventDispatcherExtender');

// import helpers
const Module_FileSaver = require('file-saver');
const Module_ClipboardCopy = require('clipboard-copy');
const DataInput = require('./../../DataInput/DataInput');


module.exports = function(elRootContainer)
{
    // start
    this.__construct(elRootContainer);
};

module.exports.prototype = {

    // connection
    _elRootContainer: null,
    _elRoot: null,
    _elDataLabel: null,
    _elButton: null,
    _elOptionsMenu: null,
    _elDonate: null,
    _elCoverLabel: null,
    _elCoverIndicator: null,

    // data
    _data: null,

    // utils
    _bLocked: false,
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
     * @param elRootContainer
     */
    __construct: function(elRootContainer)
    {
        // 1. extend
        new EventDispatcherExtender(this);

        // 2. store
        this._elRootContainer = elRootContainer;

        // 3. init
        var elDataTemplate = document.getElementById('template-data');

        // 4. copy and prepare
        this._elRoot = elDataTemplate.cloneNode(true);
        this._elRoot.removeAttribute('id');
        this._elDataLabel = this._elRoot.querySelector('[data-mimoto-id=receiver_data_label_data]');
        this._elButton = this._elRoot.querySelector('[data-mimoto-id="receiver_data_button"]');
        this._elOptionsMenu = this._elRoot.querySelector('[data-mimoto-id="optionsmenu"]');
        this._elCoverLabel = this._elRoot.querySelector('[data-mimoto-id="coverlabel"]');
        this._elCoverIndicator = this._elRoot.querySelector('[data-mimoto-id="indicator"]');
        this._elDonate = this._elRoot.querySelector('[data-mimoto-id="donate"]');

        // 5. show
        this._elRootContainer.insertBefore(this._elRoot, this._elRootContainer.firstChild);
    },


    // ----------------------------------------------------------------------------
    // --- Public methods ---------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Init data
     * @param data
     */
    initData: function(data)
    {
        // 1. store
        this._data = data;

        // 2. select
        switch(this._data.sType)
        {
            case DataInput.prototype.DATATYPE_PASSWORD:

                // a. output
                this._setDataLabel('* * * * * * *');

                // b. setup
                this._elButton.innerText = 'Copy to clipboard';
                break;

            case DataInput.prototype.DATATYPE_TEXT:

                // a. output
                this._setDataLabel(this._data.value);

                // b. setup
                this._elButton.innerText = 'Copy to clipboard';
                break;

            case DataInput.prototype.DATATYPE_FILE:

                // a. output
                this._setDataLabel(this._data.sFileName);

                // b. setup
                this._elButton.innerText = 'Download';
                break;
        }

        // 3. configure
        this._elButton.addEventListener('click', this._onButtonClick.bind(this));

        // 4. configure
        this._elRoot.querySelector('[data-mimoto-id=receiver_data_option_clearnow]').addEventListener('click', function(elData) {

            this._clearData(elData);

        }.bind(this, this._elRoot));

        // 5. configure
        this._elRoot.querySelector('[data-mimoto-id=receiver_data_option_extend]').addEventListener('click', function() {

            this._extendAutoDestructionDelay()

        }.bind(this));

        // 6. register
        let elContent = this._elRoot.querySelector('[data-mimoto-id="content"]');

        // 7. verify
        if (this._elRootContainer.children.length === 0)
        {
            // a. show instantly
            elContent.classList.add('show');
        }
        else
        {
            // a. show animated
            this._show(elContent);
        }

        // 8. verify and start progress notification
        if (data.totalCount > 1)
        {
            // a. disable
            this._toggleSendButton(false);

            // b. prepare
            this._elRoot.classList.add('showProgress');
            this._elDonate.classList.add('show');
        }
    },

    /**
     * Show progress
     * @param data
     */
    showProgress: function(data)
    {
        // 1. store
        this._data = data;

        // 2. output
        this._setCoverLabel('Receiving ' + (Math.round(100 * data.receivedCount / data.totalCount)) + '%', true);
    },

    /**
     * Show data
     * @param data
     */
    showData: function(data)
    {
        // 1. store
        this._data = data;

        // 2. select
        switch(this._data.sType)
        {
            case DataInput.prototype.DATATYPE_PASSWORD:

                break;

            case DataInput.prototype.DATATYPE_TEXT:

                // a. output
                this._setDataLabel(this._data.value);
                break;

            case DataInput.prototype.DATATYPE_FILE:

                break;
        }

        // 3. toggle visibility
        this._elOptionsMenu.classList.add('show');
        this._elDataLabel.classList.add('show');

        // 4. verify and end progress notification
        if (data.totalCount > 1)
        {
            // a. enable
            this._toggleSendButton(true);

            // b. continue animation
            this._elRoot.classList.remove('showProgress');
            this._elRoot.classList.add('hideProgress');
            this._elDonate.classList.remove('show');

            // c. time clearing of animation
            let timerCover = setTimeout(function ()
            {
                // I. cleanup
                this._elRoot.classList.remove('hideProgress');

                // II. toggle
                this._bUnlocked = true;
                this._elRoot.classList.add('unlocked');

            }.bind(this), 900);
        }


        // --- auto-destruct


        // 5. init
        this._nTimeToAutoDestruct = new Date().getTime() + 2 * 60 * 1000 + ((this._elRootContainer.children.length > 1) ? 1000 : 0);

        // 6. setup auto-destruct
        this._timer = setInterval(function()
        {
            if (this._updateTimer())
            {
                this._clearData();
            }

        }.bind(this), 100);
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
        let nPlaceholderHeight = this._elRoot.offsetHeight + 10;

        // a. register
        let elPlaceholder = this._elRoot.querySelector('[data-mimoto-id="placeholder"]');

        // b. hide
        elContent.style.display = 'none';

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
        let nPlaceholderHeight = this._elRoot.offsetHeight + 10;

        // 2. register
        let elContent = this._elRoot.querySelector('[data-mimoto-id="content"]');
        let elPlaceholder = this._elRoot.querySelector('[data-mimoto-id="placeholder"]');

        // 3. hide
        elContent.style.display = 'none';

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
            this._elRootContainer.removeChild(this._elRoot);

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
        this._elRoot.querySelector('[data-mimoto-id=receiver_data_lifetime]').innerText = sRemainingTime;

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
        // 1. validate
        if (this._bLocked) return;

        // 2. select
        switch(this._data.sType)
        {
            case DataInput.prototype.DATATYPE_PASSWORD:

                // a. copy
                this._copyToClipboard(this._data.value);

                // b. broadcast
                this.dispatchEvent(this.USED_CLIPBOARD);
                break;

            case DataInput.prototype.DATATYPE_TEXT:

                // a. copy
                this._copyToClipboard(this._data.value);

                // b. broadcast
                this.dispatchEvent(this.USED_CLIPBOARD);
                break;

            case DataInput.prototype.DATATYPE_FILE:

                // a. download
                Module_FileSaver.saveAs(this._data.value.base64, this._data.value.fileName);
                break;
        }
    },

    /**
     * Set data label
     * @param sLabel
     * @private
     */
    _setDataLabel: function(sLabel, )
    {
        // 1. output
        this._elDataLabel.innerText = sLabel;
    },

    /**
     * Set data label
     * @param sLabel
     * @param bShowProgressIndicator
     * @private
     */
    _setCoverLabel: function(sLabel, bShowProgressIndicator)
    {
        // 1. output
        this._elCoverLabel.innerText = sLabel;

        // 2. toggle
        (bShowProgressIndicator) ? this._elCoverIndicator.classList.add('show') : this._elCoverIndicator.classList.remove('show');
    },

    /**
     * Toggle send button
     * @param bEnable
     * @private
     */
    _toggleSendButton: function(bEnable)
    {
        // 1. store
        this._bLocked = !bEnable;

        // 2. select
        if (bEnable)
        {
            this._elButton.classList.remove('disabled');
        }
        else
        {
            this._elButton.classList.add('disabled');
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

        // 2. output
        this._setCoverLabel('Copied to clipboard!');

        // 3. disable
        this._toggleSendButton(false);

        // 4. animate
        this._elRoot.classList.add('showProgress');

        // 5. time clearing of animation
        setTimeout(function ()
        {
            // a. cleanup
            this._elRoot.classList.remove('showProgress');
            this._elRoot.classList.add('hideProgress');

            setTimeout(function ()
            {
                // a. cleanup
                this._elRoot.classList.remove('hideProgress');

                // b. enable
                this._toggleSendButton(true);

            }.bind(this), 900);

        }.bind(this), 900);
    }

};
