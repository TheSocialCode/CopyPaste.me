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
        this._bOutputToConsole = bOutputToConsole
    },


    // ----------------------------------------------------------------------------
    // --- Public methods ---------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Log to file
     * @param sOutput
     * @param bForceOutput
     */
    log: function(sOutput, bForceOutput)
    {
        // 1. verify
        if (this._bBlockOutput) return;

        // 2. validate
        if (!this._bOutputToConsole && !bForceOutput) return;

        // 3. verify and output
        if (console && console.log) console.log(sOutput);
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
        if (this._sLogFile) Module_LogToFile(sOutput, this._sLogFile);
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
