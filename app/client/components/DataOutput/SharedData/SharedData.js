/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';


module.exports = function(elDataContainer, data)
{
    // start
    this.__construct(elDataContainer, data);
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



    // ----------------------------------------------------------------------------
    // --- Constructor ------------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Constructor
     */
    __construct: function (elDataContainer, data)
    {
        // 1. store
        this._elDataContainer = elDataContainer;
        this._data = data;

        // 2. setup
        this._setup();
    },



    // ----------------------------------------------------------------------------
    // --- Public methods ---------------------------------------------------------
    // ----------------------------------------------------------------------------


    addEventListener: function(sEvent, fMethod)
    {
        // 1. verify or init
        if (!this._aEvents[sEvent]) this._aEvents[sEvent] = [];

        // 2. store
        this._aEvents[sEvent].push(fMethod);
    },

    dispatchEvent: function(sEvent)
    {
        // 1. validate
        if (this._aEvents[sEvent])
        {
            // a. find
            let nMethodCount = this._aEvents[sEvent].length;
            for (let nIndex = 0; nIndex < nMethodCount; nIndex++)
            {
                // I. register
                let fMethod = this._aEvents[sEvent][nIndex];

                // II. execute
                fMethod.apply(this, Array.prototype.slice.call(arguments, 1));
            }
        }
    },



    // ----------------------------------------------------------------------------
    // --- Private methods --------------------------------------------------------
    // ----------------------------------------------------------------------------


    _setup: function()
    {
        // 1. init
        var elDataTemplate = document.getElementById('template-data');

        // 2. copy and prepare
        this._elData = elDataTemplate.cloneNode(true);
        this._elData.removeAttribute('id');
        this._elButton = this._elData.querySelector('[data-mimoto-id="receiver_data_button"]');

        // 4. show
        this._elDataContainer.insertBefore(this._elData, this._elDataContainer.firstChild);


        // ---


        // 5. init
        this._nTimeToAutoDestruct = new Date().getTime() + 2 * 60 * 1000 + 900 + ((this._elDataContainer.children.length > 1) ? 1000 : 0);

        // 6. show data or data representation
        switch(this._data.sType)
        {
            case 'password':

                this._elData.querySelector('[data-mimoto-id=receiver_data_label_data]').innerText = '* * * * * * * * *';
                this._elButton.innerText = 'Copy to clipboard';
                break;

            case 'url':

                this._elData.querySelector('[data-mimoto-id=receiver_data_label_data]').innerText = this._data.value;
                this._elButton.innerText = 'Open URL';
                break;

            case 'text':

                this._elData.querySelector('[data-mimoto-id=receiver_data_label_data]').innerText = this._data.value;
                this._elButton.innerText = 'Copy to clipboard';
                break;

            case 'image':

                var elImage = document.createElement('img');

                // loader -> get originalWidth or max width

                elImage.setAttribute('width', 300); // #todo setup default container
                elImage.setAttribute('src', this._data.value.base64);

                this._elData.querySelector('[data-mimoto-id=receiver_data_label_data]').append(elImage);
                this._elButton.innerText = 'Download';

                break;

            case 'document':

                this._elData.querySelector('[data-mimoto-id=receiver_data_label_data]').innerText = this._data.value.fileName;
                this._elButton.innerText = 'Download';
                break;
        }

        // 7. configure
        this._elButton.addEventListener('click', this._onButtonClick.bind(this));

        // 8. configure
        this._elData.querySelector('[data-mimoto-id=receiver_data_option_clearnow]').addEventListener('click', function(elData) {

            this._clearData(elData);

        }.bind(this, this._elData));

        // 9. configure
        this._elData.querySelector('[data-mimoto-id=receiver_data_option_extend]').addEventListener('click', function() {

            this._setExtendAutoDestructionDelay()

        }.bind(this));

        // 10. setup
        this._timer = setInterval(function()
        {
            if (this._updateTimer())
            {
                this._clearData();
            }

        }.bind(this), 100);


        // register
        let elContent = this._elData.querySelector('[data-mimoto-id="content"]');

        // 6. verify
        if (this._elDataContainer.children.length === 0)
        {
            elContent.classList.add('show');
        }
        else
        {
            this._show(elContent);
        }
    },

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

    _setExtendAutoDestructionDelay: function()
    {
        // 1. define
        let nExtendedDuration = 60 * 1000;

        // 2. extend
        let nNewTime = Math.round((this._nTimeToAutoDestruct - new Date().getTime()) / nExtendedDuration) * nExtendedDuration + (nExtendedDuration + 900);

        // 3. update and store
        this._nTimeToAutoDestruct = new Date().getTime() + nNewTime;
    },

    _clearData: function()
    {
        // 1. cleanup
        clearInterval(this._timer);

        // 2. hide
        this._hide();
    },

    _onButtonClick: function()
    {
        switch(this._data.sType)
        {
            case 'password':

                this._copyToClipboard(this._data.value);
                break;

            case 'url':

                window.open(this._data.value, '_blank');
                break;

            case 'text':

                this._copyToClipboard(this._data.value);
                break;

            case 'image':


                var link = document.createElement("a");

                link.setAttribute("href", this._data.value.base64);
                link.setAttribute("download", this._data.value.fileName);
                link.click();

                break;

            case 'document':

                var link = document.createElement("a");

                link.setAttribute("href", this._data.value.base64);
                link.setAttribute("download", this._data.value.fileName);
                link.click();

                break;
        }
    },

    _copyToClipboard: function(sValue)
    {
        // copy to clipboard
        const el = document.createElement('textarea');
        el.value = sValue;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);


        // ---


        // 1. prepare
        this._elData.classList.add('clear');

        // 3. time clearing of animation
        let timerCover = setTimeout(function()
        {
            // a. cleanup
            this._elData.classList.remove('clear');

        }.bind(this), 1200);
    },




    _b64toBlob: function(b64Data, contentType, sliceSize) {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;

        var byteCharacters = atob(b64Data);
        var byteArrays = [];

        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);

            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            var byteArray = new Uint8Array(byteNumbers);

            byteArrays.push(byteArray);
        }

        var blob = new Blob(byteArrays, {type: contentType});
        return blob;
    }

};
