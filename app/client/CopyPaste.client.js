/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';


// import
const Client = require('./modules/Client');


// connect
document.addEventListener('DOMContentLoaded', function () {

    // startup
    this.client = new Client(window.location.protocol + '//' + window.location.hostname +  ':3000');

}, true);
