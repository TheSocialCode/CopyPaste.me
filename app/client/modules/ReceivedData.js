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
                fMethod();
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

        // 5. init
        this._nTimeToAutoDestruct = new Date().getTime() + 2 * 60 * 1000 + 900;

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

    },

    _updateTimer: function()
    {
        // 1. calculate
        let nDifference = this._nTimeToAutoDestruct - new Date().getTime();

        // 2.
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

        // 2. clear
        this._elDataContainer.removeChild(this._elData);

        // 3.
        this.dispatchEvent(this.CLEARED);
    },

    _onButtonClick: function()
    {
        switch(this._data.sType)
        {
            case 'password':

                this._copyToClipboard(this._data.value);
                break;

            case 'url':

                console.log('url', this._data.value);
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



        //
        //
        // // register
        // let elTooltip = document.getElementById('tooltip');
        //
        // elTooltip.classList.remove('tooltip-fade');
        // elTooltip.style.display = 'inline-block';
        // //elTooltip.style.opacity = 0.5;
        //
        // elTooltip.classList.add('tooltip-fade');
    },

    _copyToClipboard: function(sValue)
    {
        // copy to clipboard
        const el = document.createElement('textarea');
        el.value = sValue; //document.getElementById('received_data_label_data').getAttribute('data-data');
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
    }

};
