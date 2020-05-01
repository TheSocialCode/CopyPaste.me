/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';



// import utils
const Module_LogToFile = require('log-to-file');


module.exports = function(configFile, config, bHasMongoDB)
{
    // start
    this.__construct(configFile, config, bHasMongoDB);
};

module.exports.prototype = {


    // ----------------------------------------------------------------------------
    // --- Constructor ------------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Constructor
     */
    __construct: function (configFile, config, bHasMongoDB)
    {
        // 1. cleanup
        console.clear();

        // 2. prepare
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

        // 3. verify
        if (bHasMongoDB)
        {
            // a. compose
            aLines.push(' ', 'MongoDB connected on ' + configFile.mongodb.host.toString() + ':' + configFile.mongodb.port.toString());
        }

        // 4. prepare
        aLines.push('');


        // ---


        // 5. find max length
        let nMaxLength = 0;
        for (let nLineIndex = 0; nLineIndex < aLines.length; nLineIndex++)
        {
            // a. calculate
            if (aLines[nLineIndex].length > nMaxLength) nMaxLength = aLines[nLineIndex].length;
        }

        // 6. init
        let sLogOutput = '\n';

        // 7. build and output lines
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
            console.log(aLines[nLineIndex]);

            // c. compose
            sLogOutput += aLines[nLineIndex] + '\n';
        }

        // 8. output extra line
        console.log('');

        // 9. compose
        sLogOutput += '\n';

        // 10. output to log
        this.Mimoto.logger.logToFile(sLogOutput);
    }

};
