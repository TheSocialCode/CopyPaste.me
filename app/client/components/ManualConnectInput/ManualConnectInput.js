/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';


// import
const ManualConnectEvents = require('./../ManualConnectButton/ManualConnectEvents');


module.exports = function(sTokenURL)
{
    // start
    this.__construct(sTokenURL);
};

module.exports.prototype = {

    // views
    _elRoot: null,
    _elChar1: null,
    _elChar2: null,
    _elChar3: null,
    _elChar4: null,
    _elChar5: null,
    _elChar6: null,

    // utils
    _aInputs: [],

    // helpers
    _sAllowedCharacters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789',



    // ----------------------------------------------------------------------------
    // --- Constructor ------------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Constructor
     */
    __construct: function (sTokenURL)
    {
        // 1. register
        this._elRoot = document.querySelector('[data-mimoto-id="component_ManualConnectInput"]');

        // 2. setup
        for (let nIndex = 0; nIndex < 6; nIndex++)
        {
            // a. find
            let elInput = this._elRoot.querySelector('[data-mimoto-id="char' + (nIndex + 1) + '"]');

            // b. store
            this._aInputs.push(elInput);

            // c. configure
            //elInput.addEventListener('change', this._handleInput.bind(this, 'change'));
            elInput.addEventListener('keyup', this._handleInput.bind(this, 'keyup'));
            //elInput.addEventListener('paste', this._handleInput.bind(this, 'paste'));
            elInput.addEventListener('input', this._handleInput.bind(this, 'input'));
        }
    },



    // ----------------------------------------------------------------------------
    // --- Public methods ---------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Show component
     */
    show: function()
    {
        // 1. toggle
        this._elRoot.classList.add('show');

        // 2. focus
        this._focusNextEmpty();
    },

    /**
     * Hide component
     */
    hide: function()
    {
        // 1. toggle
        this._elRoot.classList.remove('show');
    },



    // ----------------------------------------------------------------------------
    // --- Private methods --------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Focus next empty input field
     * @private
     */
    _focusNextEmpty: function()
    {
        // 1. find
        for (let nIndex = 0; nIndex < this._aInputs.length; nIndex++)
        {
            // a. verify and focus
            if (this._aInputs[nIndex].value === '')
            {
                // I. focus
                this._aInputs[nIndex].focus();

                // II. exit
                break;
            }
        }
    },

    _handleInput: function(sEventType, e)
    {
        // 1. register
        let elInput = e.target;

        // 2. init
        let nCurrentInputIndex = 0;

        // 3. process
        switch(sEventType)
        {
            case 'keyup':

                // a. process
                switch(e.code)
                {
                    case 'Backspace':

                        // I. find
                        for (let nIndex = 0; nIndex < this._aInputs.length; nIndex++)
                        {
                            // 1. register
                            let elRegisterInput = this._aInputs[nIndex];

                            // 2. validate
                            if (elRegisterInput === elInput)
                            {
                                // a. clear
                                elInput.value = '';

                                // b. focus and select previous
                                if (nIndex > 0)
                                {
                                    let elPreviousInput = this._aInputs[nIndex - 1];
                                    elPreviousInput.focus();
                                    elPreviousInput.select();
                                }
                                break;
                            }
                        }
                        break;

                    case 'ArrowLeft':

                        // I. find
                        for (let nIndex = 0; nIndex < this._aInputs.length; nIndex++)
                        {
                            // 1. register
                            let elRegisterInput = this._aInputs[nIndex];

                            // 2. validate
                            if (elRegisterInput === elInput)
                            {
                                // b. focus and select previous
                                if (nIndex > 0)
                                {
                                    let elPreviousInput = this._aInputs[nIndex - 1];
                                    elPreviousInput.focus();
                                    elPreviousInput.select();
                                }
                                break;
                            }
                        }
                        break;

                    case 'ArrowRight':

                        // I. find
                        for (let nIndex = 0; nIndex < this._aInputs.length; nIndex++)
                        {
                            // 1. register
                            let elRegisterInput = this._aInputs[nIndex];

                            // 2. validate
                            if (elRegisterInput === elInput)
                            {
                                // b. focus and select previous
                                if (nIndex < this._aInputs.length - 1)
                                {
                                    let elPreviousInput = this._aInputs[nIndex + 1];
                                    elPreviousInput.focus();
                                    elPreviousInput.select();
                                }
                                break;
                            }
                        }
                        break;
                }
                break;

            case 'input':

                // 1. register
                let sCurrentValue = elInput.value.toUpperCase();

                // 2. correct
                let sNewValue = '';
                let nCharCount = sCurrentValue.length;
                for (let nCharIndex = 0; nCharIndex < nCharCount; nCharIndex++)
                {
                    // a. register
                    let sCurrentChar = sCurrentValue.substr(nCharIndex, 1);

                    // b. verify and build
                    if (this._sAllowedCharacters.indexOf(sCurrentChar) !== -1) sNewValue += sCurrentValue;
                }

                // 3. validate
                if (sNewValue === '') break;

                // 4. find
                let nInputCount = this._aInputs.length;
                for (let nIndex = 0; nIndex < nInputCount; nIndex++)
                {
                    // a. validate
                    if (elInput === this._aInputs[nIndex])
                    {
                        // I. store
                        nCurrentInputIndex = nIndex;

                        // 2. exit
                        break;
                    }
                }

                // 5. output
                let nCharIndex = 0;
                let nStartIndex = Math.max(0, nCurrentInputIndex - Math.min(sNewValue.length - 1, nInputCount));
                for (let nIndex = nStartIndex; nIndex < nInputCount; nIndex++)
                {
                    // a. register
                    let elInput = this._aInputs[nIndex];

                    // b. output
                    elInput.value = sNewValue.substr(nCharIndex, 1);

                    // c. update
                    nCharIndex++;

                    // d. is next not last, focus and select
                    if (nIndex < nInputCount - 1)
                    {
                        this._aInputs[nIndex + 1].focus();
                        this._aInputs[nIndex + 1].select();
                    }

                    // e. if last, select
                    if (nIndex === nInputCount - 1) this._aInputs[nIndex].select();

                    // f. exit if no more characters
                    if (nCharIndex > sNewValue.length - 1) break;
                }

                break;

            default:

                //console.log('Skipped ' + sEventType);
        }
    }

};
