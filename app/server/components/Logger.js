/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';


// import utils
const Module_LogToFile = require('log-to-file');


module.exports = function(sLogFile, bOutputToConsole)
{
    // start
    this.__construct(sLogFile, bOutputToConsole);
};

module.exports.prototype = {


    // data
    _sLogFile: null,
    _bOutputToConsole: false,
    _bBlockOutput: false,

    // config
    _bHasLogFile: false,



    // ----------------------------------------------------------------------------
    // --- Constructor ------------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Constructor
     */
    __construct: function (sLogFile, bOutputToConsole)
    {
        // 1. store
        this._sLogFile = sLogFile;
        this._bOutputToConsole = bOutputToConsole;

        // 2. validate
        this._bHasLogFile = (!sLogFile) ? false : true;
    },


    // ----------------------------------------------------------------------------
    // --- Public methods ---------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Log to file
     */
    log: function()
    {
        // 1. verify
        if (this._bBlockOutput) return;

        // 2. validate
        if (!this._bOutputToConsole) return;

        // 3. verify and output
        if (console && console.log) console.log.apply(console, arguments);
    },

    /**
     * Log to file
     * @param sOutput
     */
    logToFile: function(sOutput)
    {
        // 1. verify
        if (this._bBlockOutput) return;

        // 2. verify and output
        if (this._sLogFile && this._bHasLogFile) Module_LogToFile(sOutput, this._sLogFile);
    },

    /**
     * Block output
     */
    blockOutput: function()
    {
        // 1. toggle
        this._bBlockOutput = true;
    },

    /**
     * Unblock output
     */
    unblockOutput: function()
    {
        // 1. toggle
        this._bBlockOutput = false;
    }

};
