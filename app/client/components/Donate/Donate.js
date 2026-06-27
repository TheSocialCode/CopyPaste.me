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

    // 2. request once
    _fundingPromise = fetch(FUNDING_URL).then(function(response) { return response.json(); });

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
        let sNeeded = this._formatAmount(data.needed, bIsEuro);
        let sTotal = this._formatAmount(data.total, bIsEuro);
        let nPercentage = (data.needed > 0) ? Math.round(100 * data.total / data.needed) : 0;

        // 3. output
        if (this._elFundingCost) this._elFundingCost.innerText = 'CopyPaste.me costs around ' + sCurrency + ' ' + sNeeded + ' per month to run';
        if (this._elFundingRaised) this._elFundingRaised.innerText = sCurrency + ' ' + sTotal + ' of ' + sCurrency + ' ' + sNeeded + ' raised this month';
        if (this._elFundingPercentage) this._elFundingPercentage.innerText = nPercentage + '%';

        // 4. animate bar
        if (this._elFundingBar) this._elFundingBar.style.width = Math.max(0, Math.min(100, nPercentage)) + '%';
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
