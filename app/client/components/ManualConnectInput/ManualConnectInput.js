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
    _elMessage: null,
    _elButtonConnect: null,

    // data
    _sCode: '',
    _bCodeValidated: false,

    // utils
    _aEvents: [],
    _aInputs: [],
    _bIsInitialInput: true,
    _bIsDisabled: false,

    // helpers
    _sAllowedCharacters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789',

    // events
    REQUEST_CONNECTION_USING_MANUALCODE: 'onRequestConnectionUsingManualCode',



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
        this._elMessage = this._elRoot.querySelector('[data-mimoto-id="message"]');
        this._elButtonConnect = this._elRoot.querySelector('[data-mimoto-id="button"]');

        // 2. setup
        for (let nIndex = 0; nIndex < 6; nIndex++)
        {
            // a. find
            let elInput = this._elRoot.querySelector('[data-mimoto-id="char' + (nIndex + 1) + '"]');

            // b. store
            this._aInputs.push(elInput);

            // c. configure
            elInput.addEventListener('focus', this._onInputFocus.bind(this));
            elInput.addEventListener('keyup', this._handleInput.bind(this, 'keyup'));
            elInput.addEventListener('input', this._handleInput.bind(this, 'input'));
        }

        // 3. configure
        this._elButtonConnect.addEventListener('click', this._onButtonConnectClick.bind(this));
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

    /**
     * Disable input
     */
    disable: function()
    {
        // 1. toggle state
        this._bIsDisabled = true;

        // 2. toggle interface
        //this._elButtonConnect.classList.add('muted');
    },

    /**
     * Enable input
     */
    enable: function(sMessage)
    {
        // 1. toggle state
        this._bIsDisabled = false;

        // 2. output
        this._showMessage(sMessage);

        // 3. toggle interface
        this._elButtonConnect.classList.remove('muted');
    },

    /**
     * Add event listener
     * @param sEvent
     * @param fMethod
     */
    addEventListener: function(sEvent, fMethod)
    {
        // 1. verify or init
        if (!this._aEvents[sEvent]) this._aEvents[sEvent] = [];

        // 2. store
        this._aEvents[sEvent].push(fMethod);
    },

    /**
     * dispatch event
     * @param sEvent
     */
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

    /**
     * Handle input `focus`
     * @private
     */
    _onInputFocus: function(e)
    {
        // 1. register
        let elInput = e.target;

        // 2. select
        elInput.select();
    },

    /**
     * Handle input
     * @param sEventType
     * @param e
     * @private
     */
    _handleInput: function(sEventType, e)
    {
        // 1. block if setting up connection
        if (this._bIsDisabled) return;

        // 2. register
        let elInput = e.target;

        // 3. init
        let nCurrentInputIndex = 0;

        // 4. process
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
                                }
                                break;
                            }
                        }
                        break;
                }
                break;

            case 'input':

                // a. hide
                this._hideMessage();
                this._elButtonConnect.classList.add('muted');

                // b. register
                let sCurrentValue = elInput.value.toUpperCase();

                // c. correct
                let sNewValue = '';
                let nCharCount = sCurrentValue.length;
                for (let nCharIndex = 0; nCharIndex < nCharCount; nCharIndex++)
                {
                    // I. register
                    let sCurrentChar = sCurrentValue.substr(nCharIndex, 1);

                    // II. verify and build
                    if (this._sAllowedCharacters.indexOf(sCurrentChar) !== -1) sNewValue += sCurrentValue;
                }

                // d. validate
                if (sNewValue === '')
                {
                    // I. clear
                    if (sCurrentValue !== sNewValue) elInput.value = '';

                    // II. exit
                    break;
                }

                // e. find
                let nInputCount = this._aInputs.length;
                for (let nIndex = 0; nIndex < nInputCount; nIndex++)
                {
                    // I. validate
                    if (elInput === this._aInputs[nIndex])
                    {
                        // 1. store
                        nCurrentInputIndex = nIndex;

                        // 2. exit
                        break;
                    }
                }

                // f. output
                let nCharIndex = 0;
                let nStartIndex = Math.max(0, nCurrentInputIndex - Math.min(sNewValue.length - 1, nInputCount));
                for (let nIndex = nStartIndex; nIndex < nInputCount; nIndex++)
                {
                    // I. register
                    let elInput = this._aInputs[nIndex];

                    // II. output
                    elInput.value = sNewValue.substr(nCharIndex, 1);

                    // III. update
                    nCharIndex++;

                    // IV. is next not last, focus and select
                    if (nIndex < nInputCount - 1)
                    {
                        this._aInputs[nIndex + 1].focus();
                    }

                    // V. if last, select
                    if (nIndex === nInputCount - 1) this._aInputs[nIndex].select();

                    // VI. exit if no more characters
                    if (nCharIndex > sNewValue.length - 1) break;
                }

                break;
        }

        // 5. build
        this._sCode = '';
        for (let nIndex = 0; nIndex < this._aInputs.length; nIndex++)
        {
            this._sCode += this._aInputs[nIndex].value;
        }

        // 6. validate
        this._bCodeValidated = this._sCode.match(/^[a-zA-Z0-9]{6}$/g);

        // 7. toggle button
        if (this._bCodeValidated)
        {
            this._elButtonConnect.classList.remove('muted');
        }
        else
        {
            this._elButtonConnect.classList.add('muted');
        }

        // 8. verify and auto-connect
        if (this._bCodeValidated && this._bIsInitialInput) this._onButtonConnectClick();
    },

    /**
     * Handle button connect `click`
     * @private
     */
    _onButtonConnectClick: function()
    {
        // 1. validate
        if (this._bCodeValidated)
        {
            // a. toggle
            this.disable();
            this._bIsInitialInput = false;

            // b. broadcast
            this.dispatchEvent(this.REQUEST_CONNECTION_USING_MANUALCODE, this._sCode);
        }
        else
        {
            this._showMessage("The code you entered isn't complete yet");
        }
    },

    /**
     * Show message
     * @private
     */
    _showMessage: function(sMessage)
    {
        // 1. output
        this._elMessage.innerHTML = sMessage;

        // 2. show
        this._elMessage.classList.add('show');
    },

    /**
     * Hide message
     * @private
     */
    _hideMessage: function()
    {
        // 1. hide
        this._elMessage.classList.remove('show');
    }

};
