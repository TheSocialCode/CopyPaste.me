/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';


// import
const QRCodeGenerator = require('qrcode-generator');
const ManualConnectButton = require('./../ManualConnectButton/ManualConnectButton');

// import helpers
const Module_ClipboardCopy = require('clipboard-copy');
const Module_Sharer = require('sharer.js');

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
    _elFrontLabel: null,
    _elFrontSublabel: null,
    _elBack: null,
    _elManualURL: null,
    _elManualCode: null,
    _elManualCodeCountdown: null,
    _elConnectURL: null,
    _elSendInvite: null,
    _elButtonRefreshToken: null,
    _elOutputTimeTillExpiration: null,
    _elButtonToggleConnectionView: null,
    _elButtonToggleConnectionView_sendInvite: null,
    _elButtonToggleConnectionView_scanQR: null,
    _elButtonToggleConnectionView_copiedToClipboard: null,

    // channel views
    _elSendInviteChannelWhatsapp: null,
    _elSendInviteChannelTelegram: null,
    _elSendInviteChannelEmail: null,

    // utils
    _timerTokenExpires: null,
    _timerTokenUpdate: null,
    _nTokenQRExpires: 0,

    _timerManualCodeCountdown: null,

    // states
    _sCurrentState: '',
    STATE_QR: 'qr',
    STATE_MANUAL: 'manual',

    _bIsInInviteMode: false,

    // data
    _manualCode: null,

    // events
    REQUEST_TOKEN_REFRESH: 'REQUEST_TOKEN_REFRESH',
    REQUEST_MANUALCODE: 'REQUEST_MANUALCODE',



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
        this._elFrontLabel = document.querySelector('[data-mimoto-id="component_QR_front_label"]');
        this._elFrontSublabel = document.querySelector('[data-mimoto-id="component_QR_front_sublabel"]');
        this._elBack = document.querySelector('[data-mimoto-id="component_QR_back"]');
        this._elManualURL = document.querySelector('[data-mimoto-id="component_QR_manualurl"]');
        this._elManualCode = this._elRoot.querySelector('[data-mimoto-id="manualcode"]');
        this._elManualCodeCountdown = this._elRoot.querySelector('[data-mimoto-id="countdown"]');
        this._elConnectURL = this._elBack.querySelector('[data-mimoto-id="connect_url"]');
        this._elSendInvite = this._elRoot.querySelector('[data-mimoto-id="component_sendinvite"]');
        this._elButtonRefreshToken = this._elRoot.querySelector('[data-mimoto-id="button-refreshtoken"]');
        this._elOutputTimeTillExpiration = this._elRoot.querySelector('[data-mimoto-id="output-timetillexpiration"]');
        this._elButtonCopyLink = this._elSendInvite.querySelector('[data-mimoto-id="button-copylink"]');

        // 4. register
        this._elButtonToggleConnectionView = this._elRoot.querySelector('[data-mimoto-id="button-toggleconnectionview"]');
        this._elButtonToggleConnectionView_sendInvite = this._elButtonToggleConnectionView.querySelector('[data-mimoto-id="button-sendinvite"]');
        this._elButtonToggleConnectionView_scanQR = this._elButtonToggleConnectionView.querySelector('[data-mimoto-id="button-scanqr"]');
        this._elButtonToggleConnectionView_copiedToClipboard = this._elButtonToggleConnectionView.querySelector('[data-mimoto-id="notification-copiedtoclipboard"]');

        // 5. register
        this._elSendInviteChannelWhatsapp = this._elSendInvite.querySelector('[data-mimoto-id="sendinvite-channel-whatsapp"]');
        this._elSendInviteChannelTelegram = this._elSendInvite.querySelector('[data-mimoto-id="sendinvite-channel-telegram"]');
        this._elSendInviteChannelEmail = this._elSendInvite.querySelector('[data-mimoto-id="sendinvite-channel-email"]');

        // 6. setup
        this.setToken(sToken, nTokenLifetime);

        // 7. init
        this._manualConnectButton = new ManualConnectButton();

        // 8. configure
        this._manualConnectButton.addEventListener(ManualConnectButton.prototype.REQUEST_TOGGLE_MANUALCONNECT, this._onRequestToggleManualConnect.bind(this));

        // 9. output
        this._elConnectURL.innerText = window.location.protocol + '//' + window.location.hostname;

        // 10. configure
        this._elContainer.addEventListener('click', this._onButtonToggleConnectionViewClick.bind(this));
        this._elButtonToggleConnectionView.addEventListener('click', this._onButtonToggleConnectionViewClick.bind(this));

        // 11. configure
        this._elButtonCopyLink.addEventListener('click', this._onButtonCopyLinkClick.bind(this));

        // 12. configure
        this._elButtonRefreshToken.addEventListener('click', this._onButtonRefreshTokenClick.bind(this));
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
        // 1. store
        this._nTokenQRExpires = new Date().getTime() + nTokenLifetime;

        // 2. compose
        this._sTokenURL = window.location.protocol + '//' + window.location.hostname + '/' + sToken;

        // 3. setup
        var typeNumber = 4;
        var errorCorrectionLevel = 'L';
        var qr = QRCodeGenerator(typeNumber, errorCorrectionLevel);
        qr.addData(this._sTokenURL);
        qr.make();
        this._elContainer.innerHTML = qr.createImgTag(5);

        // 4. output
        this._elSendInviteChannelWhatsapp.setAttribute('data-url', this._sTokenURL);
        this._elSendInviteChannelTelegram.setAttribute('data-url', this._sTokenURL);
        this._elSendInviteChannelEmail.setAttribute('data-url', this._sTokenURL);

        // 4. start
        this._timerTokenExpires = setTimeout(this._onTimerTokenExpires.bind(this), nTokenLifetime);
        this._timerTokenUpdate = setInterval(this._onTimerTokenUpdate.bind(this), 1000);

        // 5. output
        this._onTimerTokenUpdate();
    },

    /**
     * Handle timer `token expires`
     * @private
     */
    _onTimerTokenExpires: function(bGetInviteToken)
    {
        // 1. cleanup
        if (this._timerTokenExpires) clearTimeout(this._timerTokenExpires);
        if (this._timerTokenUpdate) clearInterval(this._timerTokenUpdate);

        // 2. request
        this.dispatchEvent(this.REQUEST_TOKEN_REFRESH, (bGetInviteToken === true) ? true : false);
    },

    /**
     * Handle timer `token update`
     * @private
     */
    _onTimerTokenUpdate: function()
    {
        // 1. define
        let nDifference = this._nTokenQRExpires - new Date().getTime();

        // 2. if in send invite state -> auto renew
        if (this._bIsInInviteMode && nDifference < 3 * 60 * 1000)
        {
            // a. auto refresh
            this._onTimerTokenExpires(true);

            // b. exit
            return;
        }

        // 3. convert
        let nMinutes = Math.round(10 * (nDifference % (1000 * 60 * 60)) / (1000 * 60)) / 10;

        // 4. output
        this._elOutputTimeTillExpiration.innerText = nMinutes + ' mins';
    },

    /**
     * Set manual code
     * @param sToken
     * @param nTokenLifetime
     */
    setManualCode: function(sToken, nTokenLifetime)
    {
        // 1. store
        this._manualCode = {};

        // 2. output
        this._elManualCode.innerText = sToken.substr(0, 3) + '-' + sToken.substr(3);

        // 3. setup
        this._manualCode.localCreated = new Date().getTime();
        this._manualCode.localExpires = this._manualCode.localCreated + nTokenLifetime;

        // 4. reset
        this._manualCode.almostExpired = false;
        this._elManualCodeCountdown.classList.remove('almostexpired');

        // 5. output
        this._updateExpirationLabel();

        // 6. start
        this._timerManualCodeCountdown = setInterval(this._onTimerManualCodeCountdown.bind(this), 100);
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
        if (this._timerTokenUpdate) clearInterval(this._timerTokenUpdate);
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
        this.dispatchEvent(this.REQUEST_MANUALCODE);
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
    },

    /**
     * Handle button Toggle Connection View `click`
     * @private
     */
    _onButtonToggleConnectionViewClick: function()
    {
        // 1. select
        if (!this._bIsInInviteMode)
        {
            // a. toggle
            this._bIsInInviteMode = true;

            // b. toggle view
            this._elContainer.classList.remove('show');
            this._elSendInvite.classList.add('show');

            // c. toggle view
            this._elFrontLabel.classList.add('swapped');
            this._elFrontSublabel.classList.add('swapped');
            this._elButtonToggleConnectionView_sendInvite.classList.remove('show');
            this._elButtonToggleConnectionView_scanQR.classList.add('show');
            this._elButtonToggleConnectionView_copiedToClipboard.classList.remove('show');

            // d. refresh token
            this._onTimerTokenExpires(true);
        }
        else
        {
            // a. toggle
            this._bIsInInviteMode = false;

            // b. toggle view
            this._elContainer.classList.add('show');
            this._elSendInvite.classList.remove('show');

            // c. toggle view
            this._elFrontLabel.classList.remove('swapped');
            this._elFrontSublabel.classList.remove('swapped');
            this._elButtonToggleConnectionView_sendInvite.classList.add('show');
            this._elButtonToggleConnectionView_scanQR.classList.remove('show');
            this._elButtonToggleConnectionView_copiedToClipboard.classList.remove('show');
        }
    },

    /**
     * Handle button Copy Link `click`
     * @private
     */
    _onButtonCopyLinkClick: function()
    {
        // 1. copy
        Module_ClipboardCopy(this._sTokenURL);

        // 2. style
        this._elButtonToggleConnectionView.classList.add('copiedtoclipboard');

        // 3. animate
        setTimeout(function ()
        {
            // a. cleanup
            this._elButtonToggleConnectionView.classList.remove('copiedtoclipboard');

        }.bind(this), 2000);
    },

    /**
     * Handle button Refresh Token `click`
     * @private
     */
    _onButtonRefreshTokenClick: function()
    {
        // 1. request fresh token
        this._onTimerTokenExpires(true);
    }

};
