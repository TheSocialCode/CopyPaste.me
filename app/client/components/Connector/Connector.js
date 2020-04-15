/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';


// import
const QRCodeGenerator = require('qrcode-generator');
const ManualConnectButton = require('./../ManualConnectButton/ManualConnectButton');
const ManualConnectEvents = require('./../ManualConnectButton/ManualConnectEvents');
const ConnectorEvents = require('./../Connector/ConnectorEvents');

// import extenders
const EventDispatcherExtender = require('./../../../common/extenders/EventDispatcherExtender');


module.exports = function(sToken, nTokenLifetime)
{
    // start
    this.__construct(sToken, nTokenLifetime);
};

module.exports.prototype = {

    // data
    _sTokenURL: null,

    // components
    _qrcode: null,
    _manualConnectButton: null,

    // views
    _elRoot: null,
    _elContainer: null,
    _elFront: null,
    _elBack: null,
    _elManualURL: null,
    _elManualCode: null,
    _elManualCodeCountdown: null,
    _elConnectURL: null,

    // utils
    _timerTokenExpires: null,
    _timerManualCodeCountdown: null,

    // states
    _sCurrentState: '',
    STATE_QR: 'qr',
    STATE_MANUAL: 'manual',

    // data
    _manualCode: null,

    // events
    REQUEST_TOKEN_REFRESH: 'REQUEST_TOKEN_REFRESH',
    REQUEST_TOGGLE_MANUALCONNECT: 'REQUEST_TOGGLE_MANUALCONNECT',



    // ----------------------------------------------------------------------------
    // --- Constructor ------------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Constructor
     */
    __construct: function (sToken, nTokenLifetime)
    {
        // 1. extend
        new EventDispatcherExtender(this);

        // ---

        // 2. init
        this._sCurrentState = this.STATE_QR;

        // 3. register
        this._elRoot = document.querySelector('[data-mimoto-id="component_QR"]');
        this._elContainer = document.querySelector('[data-mimoto-id="component_QR_container"]');
        this._elFront = document.querySelector('[data-mimoto-id="component_QR_front"]');
        this._elBack = document.querySelector('[data-mimoto-id="component_QR_back"]');
        this._elManualURL = document.querySelector('[data-mimoto-id="component_QR_manualurl"]');
        this._elManualCode = this._elRoot.querySelector('[data-mimoto-id="manualcode"]');
        this._elManualCodeCountdown = this._elRoot.querySelector('[data-mimoto-id="countdown"]');
        this._elConnectURL = this._elBack.querySelector('[data-mimoto-id="connect_url"]');

        // 4. setup
        this.setToken(sToken, nTokenLifetime);

        // 5. configure
        this._elContainer.addEventListener(
            'click',
            function(e)
            {
                // copy to clipboard
                let elHelperTextArea = document.createElement('textarea');
                elHelperTextArea.value = this._sTokenURL;
                document.body.appendChild(elHelperTextArea);
                elHelperTextArea.select();
                document.execCommand('copy');
                document.body.removeChild(elHelperTextArea);

            }.bind(this)
        );

        // 6. init
        this._manualConnectButton = new ManualConnectButton();

        // 7. configure
        this._manualConnectButton.addEventListener(ManualConnectEvents.prototype.REQUEST_TOGGLE_MANUALCONNECT, this._onRequestToggleManualConnect.bind(this));

        // 8. output
        this._elConnectURL.innerText = window.location.protocol + '//' + window.location.hostname;
    },



    // ----------------------------------------------------------------------------
    // --- Public methods ---------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Set token
     * @param sToken
     * @param nTokenLifetime
     */
    setToken: function(sToken, nTokenLifetime)
    {
        // 1. compose
        this._sTokenURL = window.location.protocol + '//' + window.location.hostname + '/' + sToken;

        // 2. setup
        var typeNumber = 4;
        var errorCorrectionLevel = 'L';
        var qr = QRCodeGenerator(typeNumber, errorCorrectionLevel);
        qr.addData(this._sTokenURL);
        qr.make();
        this._elContainer.innerHTML = qr.createImgTag(5);

        // 3. start
        this._timerTokenExpires = setTimeout(this._onTimerTokenExpires.bind(this), nTokenLifetime);
    },

    /**
     * Handle timer `token expires`
     * @private
     */
    _onTimerTokenExpires: function()
    {
        this.dispatchEvent(this.REQUEST_TOKEN_REFRESH);
    },








    setManualCode: function(manualCode)
    {
        // 1. store
        this._manualCode = manualCode;

        // 2. output
        this._elManualCode.innerText = manualCode.code.substr(0, 3) + '-' + manualCode.code.substr(3);

        // 3. setup
        this._manualCode.localCreated = new Date().getTime();
        this._manualCode.localExpires = this._manualCode.localCreated + (this._manualCode.expires - this._manualCode.created);

        // 4. reset
        this._manualCode.almostExpired = false;
        this._elManualCodeCountdown.classList.remove('almostexpired');

        // 5. output
        this._updateExpirationLabel();

        // 6. start
        this._timerManualCodeCountdown = setInterval(this._onTimerManualCodeCountdown.bind(this), 1000);
    },

    /**
     * Show component
     */
    show: function()
    {
        // 1. toggle visibility
        this._elRoot.classList.add('show');
        document.body.classList.add('app');

        // 2. apply dimensions to main component
        this._elRoot.style.width = this._elFront.offsetWidth + 'px';
        this._elRoot.style.height = this._elFront.offsetHeight + 'px';

        // 3. register
        let nInitialBackHeight = this._elBack.offsetHeight;

        // 4. resize
        this._elBack.style.height = this._elFront.offsetHeight + 'px';
        this._elManualURL.style.height = (this._elManualURL.offsetHeight + this._elFront.offsetHeight - nInitialBackHeight) + 'px';

        // 5. position
        this._elBack.style.left = (-Math.floor(Math.abs(this._elBack.offsetWidth - this._elFront.offsetWidth) / 2)) + 'px';

        // 6. toggle visibility
        this._manualConnectButton.show();
    },

    /**
     * Hide component
     */
    hide: function()
    {
        // 1. toggle visibility
        this._elRoot.classList.remove('show');
        document.body.classList.remove('app');

        // 2. toggle visibility
        this._manualConnectButton.hide();

        // 3. cleanup
        if (this._timerTokenExpires) clearTimeout(this._timerTokenExpires);
        if (this._timerManualCodeCountdown) clearInterval(this._timerManualCodeCountdown);
    },



    // ----------------------------------------------------------------------------
    // --- Private methods - events -----------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Handle event `request_toggle_manualconnect`
     * @private
     */
    _onRequestToggleManualConnect: function()
    {
        // 1. forward
        if (!this._manualCode) this._requestNewManualCode();

        // 2. store new state
        this._sCurrentState = (this._sCurrentState === this.STATE_QR) ? this.STATE_MANUAL : this.STATE_QR;

        // 3. toggle
        this._elRoot.classList.toggle('flip');
    },



    // ----------------------------------------------------------------------------
    // --- Private methods --------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Request new manual code
     * @private
     */
    _requestNewManualCode: function()
    {
        this.dispatchEvent(ManualConnectEvents.prototype.REQUEST_TOGGLE_MANUALCONNECT);
    },

    /**
     * Handle timer event
     * @private
     */
    _onTimerManualCodeCountdown: function()
    {
        // 1. update
        this._updateExpirationLabel();
    },

    /**
     * Update expiration label
     * @private
     */
    _updateExpirationLabel: function()
    {
        // 1. init
        let nDifference = this._manualCode.localExpires - new Date().getTime();

        // 2. convert
        let nMinutes = Math.floor((nDifference % (1000 * 60 * 60)) / (1000 * 60));
        let nSeconds = Math.floor((nDifference % (1000 * 60)) / 1000);

        // 3. build
        let sRemainingTime = '';
        if (nMinutes > 0) sRemainingTime = nMinutes + ' ' + ((nMinutes === 1) ? 'min' : 'mins') + ' ';
        sRemainingTime += ((nSeconds === 60) ? ((nMinutes !== 0) ? 0 : nSeconds) : nSeconds) + ' ' + ((nSeconds === 1) ? 'sec' : 'secs');

        // 4. output
        this._elManualCodeCountdown.innerText = '(valid for ' + sRemainingTime + ')';

        // 5. show warning
        if (!this._manualCode.almostExpired && nMinutes === 0 && nSeconds <= 10)
        {
            // a. toggle
            this._manualCode.almostExpired = true;

            // b. output
            this._elManualCodeCountdown.classList.add('almostexpired');
        }

        // 6. verify and stop countdown
        if (nDifference <= 0)
        {
            // a. cleanup
            this._manualCode = null;

            // b. clear
            clearInterval(this._timerManualCodeCountdown);
            this._timerManualCodeCountdown = null;

            // c. output
            this._elManualCodeCountdown.innerText = '(expired)';

            // d. request new
            if (this._sCurrentState === this.STATE_MANUAL) this._requestNewManualCode();
        }
    }

};
