/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';


// import
const QRCodeGenerator = require('qrcode-generator');
const MenuConnectionType = require('./../MenuConnectionType/MenuConnectionType');
const ConnectionTypes = require('./ConnectionTypes');

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
    _menuConnectionType: null,

    // views
    _elRoot: null,
    _elCardFront: null,
    _elCardBack: null,
    _elConectionTypes: null,

    // connection types
    _elConnectionTypeScan: null,
    _elConnectionTypeManually: null,
    _elConnectionTypeInvite: null,
    _aConnectionTypes: [],
    
    // connection type - scan
    _elConnectionTypeScan_QRContainer: null,

    // connection type - manually
    _elConnectionTypeManually_Instructions: null,
    _elConnectionTypeManually_Code: null,
    _elConnectionTypeManually_Countdown: null,
    _elConnectionTypeManually_URL: null,

    // connection type - invite
    _elConnectionTypeInvite_Options: null,
    _elConnectionTypeInvite_ButtonRefreshToken: null,
    _elConnectionTypeInvite_TimeTillExpiration: null,
    
    _elConnectionTypeInvite_NotificationCopiedToClipboard: null,

    // channel views
    _elConnectionTypeInvite_ButtonWhatsapp: null,
    _elConnectionTypeInvite_ButtonTelegram: null,
    _elConnectionTypeInvite_ButtonEmail: null,

    // utils
    _timerTokenExpires: null,
    _timerTokenUpdate: null,
    _nTokenQRExpires: 0,

    _timerManualCodeCountdown: null,

    // states
    _sCurrentConnectionType: '',
    _bIsFrontCardFocused: true,

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


        // 3. register
        this._elRoot = document.querySelector('[data-mimoto-id="component_Connector"]');
        this._elCardFront = this._elRoot.querySelector('[data-mimoto-id="card_front"]');
        this._elCardBack = this._elRoot.querySelector('[data-mimoto-id="card_back"]');
        this._elConnectionTypesContainer = this._elRoot.querySelector('[data-mimoto-id="connectiontypes-container"]');

        // 4. register - connection types
        this._elConnectionTypeScan = this._elConnectionTypesContainer.querySelector('[data-mimoto-id="type_scan"]');
        this._elConnectionTypeManually = this._elConnectionTypesContainer.querySelector('[data-mimoto-id="type_manually"]');
        this._elConnectionTypeInvite = this._elConnectionTypesContainer.querySelector('[data-mimoto-id="type_invite"]');

        // 5. store
        this._aConnectionTypes[ConnectionTypes.prototype.TYPE_SCAN] = this._elConnectionTypeScan;
        this._aConnectionTypes[ConnectionTypes.prototype.TYPE_MANUALLY] = this._elConnectionTypeManually;
        this._aConnectionTypes[ConnectionTypes.prototype.TYPE_INVITE] = this._elConnectionTypeInvite;


        // --- connection type `scan`

        // 6. register
        this._elConnectionTypeScan_QRContainer = this._elConnectionTypeScan.querySelector('[data-mimoto-id="container"]');


        // --- connection type `manually`

        // 7. register
        this._elConnectionTypeManually_Instructions = this._elConnectionTypeManually.querySelector('[data-mimoto-id="instructions"]');
        this._elConnectionTypeManually_Code = this._elConnectionTypeManually.querySelector('[data-mimoto-id="code"]');
        this._elConnectionTypeManually_Countdown = this._elConnectionTypeManually.querySelector('[data-mimoto-id="countdown"]');
        this._elConnectionTypeManually_URL = this._elConnectionTypeManually.querySelector('[data-mimoto-id="connect_url"]');

        // 8. setup
        this._elConnectionTypeManually_URL.innerText = window.location.protocol + '//' + window.location.hostname;


        // --- connection type `invite`

        // 9. register
        this._elConnectionTypeInvite_ButtonRefreshToken = this._elConnectionTypeInvite.querySelector('[data-mimoto-id="button-refreshtoken"]');
        this._elConnectionTypeInvite_TimeTillExpiration = this._elConnectionTypeInvite.querySelector('[data-mimoto-id="timetillexpiration"]');
        this._elConnectionTypeInvite_NotificationCopiedToClipboard = this._elConnectionTypeInvite.querySelector('[data-mimoto-id="notification-copiedtoclipboard"]');
        this._elConnectionTypeInvite_Options = this._elConnectionTypeInvite.querySelector('[data-mimoto-id="inviteoptions"]');
        this._elConnectionTypeInvite_ButtonWhatsapp = this._elConnectionTypeInvite_Options.querySelector('[data-mimoto-id="button-whatsapp"]');
        this._elConnectionTypeInvite_ButtonTelegram = this._elConnectionTypeInvite_Options.querySelector('[data-mimoto-id="button-telegram"]');
        this._elConnectionTypeInvite_ButtonEmail = this._elConnectionTypeInvite_Options.querySelector('[data-mimoto-id="button-email"]');
        this._elConnectionTypeInvite_ButtonCopyLink = this._elConnectionTypeInvite_Options.querySelector('[data-mimoto-id="button-copylink"]');

        // 10. configure
        this._elConnectionTypeInvite_ButtonCopyLink.addEventListener('click', this._onButtonCopyLinkClick.bind(this));
        this._elConnectionTypeInvite_ButtonRefreshToken.addEventListener('click', this._onButtonRefreshTokenClick.bind(this));


        // ---


        // 11. store
        this._sCurrentConnectionType = ConnectionTypes.prototype.TYPE_SCAN;

        // 12. setup
        this.setToken(sToken, nTokenLifetime);

        // 13. show
        this._elCardFront.appendChild(this._aConnectionTypes[this._sCurrentConnectionType]);


        // ---

        // 14. init
        this._menuConnectionType = new MenuConnectionType();

        // 15. configure
        this._menuConnectionType.addEventListener(MenuConnectionType.prototype.REQUEST_TOGGLE_CONNECTIONTYPE, this._onRequestToggleConnectionType.bind(this));
    },



    // ----------------------------------------------------------------------------
    // --- Public methods ---------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Show component
     */
    show: function()
    {
        // 1. toggle visibility
        this._elRoot.classList.add('show');
        document.body.classList.add('app');

        // 2. apply dimensions to main component
        this._elRoot.style.width = 0;
        this._elRoot.style.height = (this._elCardFront.offsetHeight + 15) + 'px';

        // 3. position
        this._elCardFront.style.left = (-Math.floor(this._elCardFront.offsetWidth) / 2) + 'px';

        // 4. toggle visibility
        this._menuConnectionType.show();
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
        this._menuConnectionType.hide();

        // 3. cleanup
        if (this._timerTokenExpires) clearTimeout(this._timerTokenExpires);
        if (this._timerTokenUpdate) clearInterval(this._timerTokenUpdate);
        if (this._timerManualCodeCountdown) clearInterval(this._timerManualCodeCountdown);
    },

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
        this._elConnectionTypeScan_QRContainer.innerHTML = qr.createImgTag(5);

        // 4. output
        this._elConnectionTypeInvite_ButtonWhatsapp.setAttribute('data-url', this._sTokenURL);
        this._elConnectionTypeInvite_ButtonTelegram.setAttribute('data-url', this._sTokenURL);
        this._elConnectionTypeInvite_ButtonEmail.setAttribute('data-url', this._sTokenURL);

        // 4. start
        this._timerTokenExpires = setTimeout(this._onTimerTokenExpires.bind(this), nTokenLifetime);
        this._timerTokenUpdate = setInterval(this._onTimerTokenUpdate.bind(this), 1000);

        // 5. output
        this._onTimerTokenUpdate();
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
        this._elConnectionTypeManually_Code.innerText = sToken.substr(0, 3) + '-' + sToken.substr(3);

        // 3. setup
        this._manualCode.localCreated = new Date().getTime();
        this._manualCode.localExpires = this._manualCode.localCreated + nTokenLifetime;

        // 4. reset
        this._manualCode.almostExpired = false;
        this._elConnectionTypeManually_Countdown.classList.remove('almostexpired');

        // 5. output
        this._updateExpirationLabel();

        // 6. start
        this._timerManualCodeCountdown = setInterval(this._onTimerManualCodeCountdown.bind(this), 100);
    },



    // ----------------------------------------------------------------------------
    // --- Private methods - events -----------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Handle event `REQUEST_TOGGLE_CONNECTIONTYPE`
     * @param sConnectionType
     * @private
     */
    _onRequestToggleConnectionType: function(sConnectionType)
    {
        // 1. verify or exit
        if (sConnectionType === this._sCurrentConnectionType) return;

        // 2. prepare
        switch(sConnectionType)
        {
            case ConnectionTypes.prototype.TYPE_SCAN:

                break;

            case ConnectionTypes.prototype.TYPE_MANUALLY:

                if (!this._manualCode) this._requestNewManualCode();
                break;

            case ConnectionTypes.prototype.TYPE_INVITE:

                this._onTimerTokenExpires(true);
                break;
        }

        // 3. select
        if (this._bIsFrontCardFocused)
        {
            // a. cleanup
            while (this._elCardBack.children.length > 0) this._elCardBack.removeChild(this._elCardBack.children[0]);

            // b. show
            this._elCardBack.appendChild(this._aConnectionTypes[sConnectionType]);

            // c. position
            this._elCardBack.style.left = (-Math.floor(this._elCardBack.offsetWidth) / 2) + 'px';
        }
        else
        {
            // a. cleanup
            while (this._elCardFront.children.length > 0) this._elCardFront.removeChild(this._elCardFront.children[0]);

            // b. show
            this._elCardFront.appendChild(this._aConnectionTypes[sConnectionType]);

            // c. position
            this._elCardFront.style.left = (-Math.floor(this._elCardFront.offsetWidth) / 2) + 'px';
        }

        // 5. toggle
        this._bIsFrontCardFocused = !this._bIsFrontCardFocused;

        // 6. store new state
        this._sCurrentConnectionType = sConnectionType;

        // 7. toggle
        this._elRoot.classList.toggle('flip');
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
        if (this._sCurrentConnectionType === ConnectionTypes.prototype.TYPE_INVITE && nDifference < 3 * 60 * 1000)
        {
            // a. auto refresh
            this._onTimerTokenExpires(true);

            // b. exit
            return;
        }

        // 3. convert
        let nMinutes = Math.round(10 * (nDifference % (1000 * 60 * 60)) / (1000 * 60)) / 10;

        // 4. output
        this._elConnectionTypeInvite_TimeTillExpiration.innerText = nMinutes + ' mins';
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
        this._elConnectionTypeManually_Countdown.innerText = '(valid for ' + sRemainingTime + ')';

        // 5. show warning
        if (!this._manualCode.almostExpired && nMinutes === 0 && nSeconds <= 10)
        {
            // a. toggle
            this._manualCode.almostExpired = true;

            // b. output
            this._elConnectionTypeManually_Countdown.classList.add('almostexpired');
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
            this._elConnectionTypeManually_Countdown.innerText = '(expired)';

            // d. request new
            if (this._sCurrentConnectionType === ConnectionTypes.prototype.TYPE_MANUALLY) this._requestNewManualCode();
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
        this._elConnectionTypeInvite_NotificationCopiedToClipboard.classList.add('copiedtoclipboard');

        // 3. animate
        setTimeout(function ()
        {
            // a. cleanup
            this._elConnectionTypeInvite_NotificationCopiedToClipboard.classList.remove('copiedtoclipboard');

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
