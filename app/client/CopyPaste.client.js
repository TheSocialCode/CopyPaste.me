/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';


const Client = require('./modules/Client');


// connect
document.addEventListener('DOMContentLoaded', function () {


    // register
    //Mimoto.version = __webpack_hash__;


    // startup
    if (console) console.log('Starting up');

    let sURL = window.location.href;
    console.log(sURL.substr(sURL.lastIndexOf('/') + 1));


    // init
    this.client = new Client("http://copypaste.local:3000");


}, true);
