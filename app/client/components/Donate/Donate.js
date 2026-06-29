/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';


// config
const FUNDING_URL = 'https://thesocialcode.com/api/project-funding?project=copypaste';

// shared funding request (so multiple instances only trigger one network call)
let _fundingPromise = null;

function _loadFunding()
{
    // 1. verify and reuse
    if (_fundingPromise) return _fundingPromise;

    // 2. request once (bypass cache so the donated amount is always current)
    let sUrl = FUNDING_URL + '&_=' + Date.now();
    _fundingPromise = fetch(sUrl, { cache: 'no-store' }).then(function(response) { return response.json(); });

    // 3. send
    return _fundingPromise;
}


module.exports = function(elRoot)
{
    // start
    this.__construct(elRoot);
};

module.exports.prototype = {

    // views
    _elRoot: null,
    _elFundingCost: null,
    _elFundingBar: null,
    _elFundingRaised: null,
    _elFundingPercentage: null,

    // state
    _timer: null,



    // ----------------------------------------------------------------------------
    // --- Constructor ------------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Constructor
     * @param elRoot - the donate call-to-action root element
     */
    __construct: function(elRoot)
    {
        // 1. store
        this._elRoot = elRoot;

        // 2. register (scoped to this instance's root)
        this._elFundingCost = this._elRoot.querySelector('[data-mimoto-id="donate_funding_cost"]');
        this._elFundingBar = this._elRoot.querySelector('[data-mimoto-id="donate_funding_bar"]');
        this._elFundingRaised = this._elRoot.querySelector('[data-mimoto-id="donate_funding_raised"]');
        this._elFundingPercentage = this._elRoot.querySelector('[data-mimoto-id="donate_funding_percentage"]');
    },



    // ----------------------------------------------------------------------------
    // --- Public methods ---------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Show donate call-to-action after a short delay
     */
    show: function()
    {
        // 1. load funding data
        this._requestFunding();

        // 2. verify - already shown or scheduled
        if (this._timer || this._elRoot.classList.contains('show')) return;

        // 3. show after a short delay
        this._timer = setTimeout(function() {

            this._timer = null;
            this._elRoot.classList.add('show');

        }.bind(this), 2500);
    },

    /**
     * Hide donate call-to-action
     */
    hide: function()
    {
        // 1. cancel pending reveal
        if (this._timer)
        {
            clearTimeout(this._timer);
            this._timer = null;
        }

        // 2. hide
        this._elRoot.classList.remove('show');
    },



    // ----------------------------------------------------------------------------
    // --- Private methods --------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Request project funding data and apply
     * @private
     */
    _requestFunding: function()
    {
        // 1. request (shared) and apply
        _loadFunding()
            .then(function(data) { this._updateFunding(data); }.bind(this))
            .catch(function() { /* keep static fallback content */ });
    },

    /**
     * Update funding status bar
     * @param data
     * @private
     */
    _updateFunding: function(data)
    {
        // 1. validate
        if (!data || data.ok !== true) return;

        // 2. prepare
        let bIsEuro = (data.currency === 'EUR');
        let sCurrency = bIsEuro ? '\u20AC' : (data.currency + ' ');
        let nNeeded = Number(data.needed) || 0;
        let nTotal = Number(data.total) || 0;
        let sNeeded = this._formatAmount(nNeeded, bIsEuro);
        let sTotal = this._formatAmount(nTotal, bIsEuro);
        let nPercentage = (nNeeded > 0) ? Math.round(100 * nTotal / nNeeded) : 0;

        // 3. output
        if (this._elFundingCost) this._elFundingCost.innerText = 'CopyPaste.me costs around ' + sCurrency + ' ' + sNeeded + ' per month to run';
        if (this._elFundingRaised) this._elFundingRaised.innerText = sCurrency + ' ' + sTotal + ' of ' + sCurrency + ' ' + sNeeded + ' raised this month';
        if (this._elFundingPercentage) this._elFundingPercentage.innerText = nPercentage + '%';

        // 4. render the segmented bar (one segment per funding channel)
        this._renderSegments(data, nNeeded, bIsEuro, sCurrency);
    },

    /**
     * Build the segmented funding bar from the channel data, with a hover
     * tooltip on each segment showing the channel and its amount
     * @param data - the funding API response
     * @param nNeeded - the monthly funding target
     * @param bIsEuro - whether amounts are in euros
     * @param sCurrency - the currency prefix
     * @private
     */
    _renderSegments: function(data, nNeeded, bIsEuro, sCurrency)
    {
        // 1. verify
        if (!this._elFundingBar) return;

        // 2. normalize channels (fall back to a single total segment)
        let aChannels = (Array.isArray(data.channels) && data.channels.length > 0)
            ? data.channels
            : [{ channel: data.label || 'Donations', total: data.total }];

        // 3. reset
        this._elFundingBar.innerHTML = '';

        // 4. build a segment per channel
        let aSegments = [];
        for (let i = 0; i < aChannels.length; i++)
        {
            // a. measure
            let nChannelTotal = Number(aChannels[i].total) || 0;
            if (nChannelTotal <= 0) continue;

            let nWidth = (nNeeded > 0) ? Math.max(0, Math.min(100, 100 * nChannelTotal / nNeeded)) : 0;
            let nColorIndex = i % 4;

            // b. segment (starts collapsed so it animates open)
            let elSegment = document.createElement('div');
            elSegment.className = 'component_DataOutput_donate_funding_bar_segment';
            elSegment.setAttribute('data-channel-index', nColorIndex);
            elSegment.style.width = '0%';

            // c. hover tooltip
            let elTooltip = document.createElement('div');
            elTooltip.className = 'component_DataOutput_donate_funding_bar_segment_tooltip';
            elTooltip.innerText = (aChannels[i].channel || 'Donations') + ' \u00B7 ' + sCurrency + ' ' + this._formatAmount(nChannelTotal, bIsEuro);
            elSegment.appendChild(elTooltip);

            this._elFundingBar.appendChild(elSegment);
            aSegments.push({ el: elSegment, width: nWidth });
        }

        // 5. animate segments to their target width on the next frame
        let fnAnimate = function() {
            for (let i = 0; i < aSegments.length; i++) aSegments[i].el.style.width = aSegments[i].width + '%';
        };

        if (window.requestAnimationFrame) window.requestAnimationFrame(function() { window.requestAnimationFrame(fnAnimate); });
        else fnAnimate();
    },

    /**
     * Format a monetary amount, keeping cents only when present
     * @param nValue
     * @param bIsEuro - use a comma as decimal separator
     * @returns {string}
     * @private
     */
    _formatAmount: function(nValue, bIsEuro)
    {
        // 1. round to cents to avoid floating point artifacts
        let nRounded = Math.round((Number(nValue) || 0) * 100) / 100;

        // 2. drop decimals for whole amounts, otherwise show two
        let sFormatted = (nRounded % 1 === 0) ? String(nRounded) : nRounded.toFixed(2);

        // 3. localize decimal separator for euros
        return bIsEuro ? sFormatted.replace('.', ',') : sFormatted;
    }

};
