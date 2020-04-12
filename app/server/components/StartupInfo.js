/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';



// import utils
const Module_LogToFile = require('log-to-file');


module.exports = function(logger, configFile, config, bHasMongoDB)
{
    // start
    this.__construct(logger, configFile, config, bHasMongoDB);
};

module.exports.prototype = {

    // services
    _logger: null,



    // ----------------------------------------------------------------------------
    // --- Constructor ------------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Constructor
     */
    __construct: function (logger, configFile, config, bHasMongoDB)
    {
        // 1. store
        this._logger = logger;


        // ---


        // 2. cleanup
        console.clear();

        // 3. prepare
        let aLines = [
            '',
            'CopyPaste.me - Frictionless sharing between devices',
            'Created by The Social Code',
            ' ',
            '@author  Sebastian Kersten',
            ' ',
            'Please help keeping this service free by donating: https://paypal.me/thesocialcode',
            ' ',
            'listening on *:' + configFile.socketio.server.port + ' ' + JSON.stringify(config),
        ];

        // 4. verify
        if (bHasMongoDB)
        {
            // a. compose
            aLines.push(' ', 'MongoDB connected on ' + configFile.mongodb.host.toString() + ':' + configFile.mongodb.port.toString());
        }

        // 5. prepare
        aLines.push('');


        // ---


        // 6. find max length
        let nMaxLength = 0;
        for (let nLineIndex = 0; nLineIndex < aLines.length; nLineIndex++)
        {
            // a. calculate
            if (aLines[nLineIndex].length > nMaxLength) nMaxLength = aLines[nLineIndex].length;
        }

        // 7. init
        let sLogOutput = '\n';

        // 8. build and output lines
        for (let nLineIndex = 0; nLineIndex < aLines.length; nLineIndex++)
        {
            // a. build
            if (aLines[nLineIndex].length === 0)
            {
                while(aLines[nLineIndex].length < nMaxLength) aLines[nLineIndex] += '-';
                aLines[nLineIndex] = '----' + aLines[nLineIndex] + '----';
            }
            else
            {
                while(aLines[nLineIndex].length < nMaxLength) aLines[nLineIndex] += ' ';
                aLines[nLineIndex] = '--- ' + aLines[nLineIndex] + ' ---';
            }

            // b. output
            this._logger.log(aLines[nLineIndex], true);

            // c. compose
            sLogOutput += aLines[nLineIndex] + '\n';
        }

        // 9. output extra line
        this._logger.log('', true);

        // 10. compose
        sLogOutput += '\n';

        // 11. output to log
        this._logger.logToFile(sLogOutput);
    }

};
