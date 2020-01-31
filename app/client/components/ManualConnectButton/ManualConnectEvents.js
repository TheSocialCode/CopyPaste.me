/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';


module.exports = function()
{

};

module.exports.prototype = {

    // events
    REQUEST_TOGGLE_MANUALCONNECT: 'request_toggle_manualconnect',
    REQUEST_MANUALCODE: 'request_manualcode',
    REQUEST_CONNECTION_BY_MANUALCODE: 'request_connection_by_manualcode',
    MANUALCODE_NOT_FOUND: 'manualcode_not_found',
    MANUALCODE_EXPIRED: 'manualcode_expired',
    MANUALCODE_ACCEPTED: 'manualcode_accepted',
    MANUALCODE_CONNECTED: 'manualcode_connected',
    REQUEST_MANUALCODE_HANDSHAKE: 'request_manualcode_handshake',
    REQUEST_MANUALCODE_CONFIRMATION: 'request_manualcode_confirmation',
    CONFIRM_MANUALCODE: 'confirm_manualcode'

};
