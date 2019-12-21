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

        // 4. show
        this._elDataContainer.insertBefore(this._elData, this._elDataContainer.firstChild);

        // 5. init
        this._nTimeToAutoDestruct = new Date().getTime() + 5 * 60 * 1000;


        console.log('Data type ' + this._data.sType + ' received:', this._data.value);


        //list = document.querySelectorAll('[data-action="delete"]');



        switch(this._data.sType)
        {
            case 'password':

                this._elData.querySelector('[data-mimoto-id=receiver_data_label_data]').innerText = '* * * * * * * * *';
                break;

            case 'url':
            case 'text':

                this._elData.querySelector('[data-mimoto-id=receiver_data_label_data]').innerText = this._data.value;
                break;

            case 'image':


                var elImage = document.createElement('img');

                // loader -> get originalWidth or max width

                elImage.setAttribute('width', 400);
                elImage.setAttribute('src', this._data.value);

                this._elData.querySelector('[data-mimoto-id=receiver_data_label_data]').append(elImage);

                break;

            case 'document':
        }



        // 7. configure
        this._elData.querySelector('[data-mimoto-id=receiver_data_button]').addEventListener('click', this._onClickCopyToClipboard);


        this._elData.querySelector('[data-mimoto-id=receiver_data_option_clearnow]').addEventListener('click', function(elData) {

            this._clearData(elData);

        }.bind(this, this._elData));

        this._elData.querySelector('[data-mimoto-id=receiver_data_option_extend]').addEventListener('click', function(elData) {

            this._setExtendAutoDestructionDelay(elData)

        }.bind(this, this._elData));


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


        //console.log(nDifference, 'Minutes = ' + nMinutes, 'Seconds = ' + nSeconds);

        // build
        let sRemainingTime = '';
        if (nMinutes > 0) sRemainingTime = nMinutes + ' ' + ((nMinutes === 1) ? 'min' : 'mins') + ' ';
        sRemainingTime += ((nSeconds === 60) ? ((nMinutes !== 0) ? 0 : nSeconds) : nSeconds) + ' ' + ((nSeconds === 1) ? 'sec' : 'secs');


        this._elData.querySelector('[data-mimoto-id=receiver_data_lifetime]').innerText = sRemainingTime;

        // verify and send
        return (nDifference <= 0);
    },

    _setExtendAutoDestructionDelay: function(elData)
    {
        // define and store
        //this._nTimeToAutoDestruct;


        //indien kleiner dan 95% dan aanvullen tot 5, ander +5

        //this._nTimeToAutoDestruct = Math.ceil(this._nTimeToAutoDestruct)


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


    _onClickCopyToClipboard: function()
    {
        // copy to clipboard
        const el = document.createElement('textarea');
        el.value = document.getElementById('received_data_label_data').getAttribute('data-data');
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);



        // register
        let elTooltip = document.getElementById('tooltip');

        elTooltip.classList.remove('tooltip-fade');
        elTooltip.style.display = 'inline-block';
        //elTooltip.style.opacity = 0.5;

        elTooltip.classList.add('tooltip-fade');
    }

};
