/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';


module.exports = function() {};

module.exports.prototype = {


    // ----------------------------------------------------------------------------
    // --- Public methods ---------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Build date
     * @param referenceDate
     * @returns string
     */
    buildDate: function(referenceDate)
    {
        // 1. init
        let date = (referenceDate) ? new Date(referenceDate) : new Date();

        // 2. build and respond
        return date.getUTCFullYear() + '.' + ("0" + (date.getMonth() + 1)).slice(-2) + '.' + ("0" + date.getDate()).slice(-2) + ' ' + ("0" + date.getHours()).slice(-2) + ':' + ("0" + date.getMinutes()).slice(-2) + ':' + ("0" + date.getSeconds()).slice(-2);
    },

    /**
     * Return time since start in milliseconds
     * @param sStart
     * @returns number
     */
    since: function(sStart)
    {
        return new Date().getTime() - sStart;
    }

};
