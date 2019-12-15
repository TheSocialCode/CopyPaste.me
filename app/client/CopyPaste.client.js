/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';


const CopyPasteClient = require('./modules/CopyPasteClient');


// connect
document.addEventListener('DOMContentLoaded', function () {


    // register
    //Mimoto.version = __webpack_hash__;


    // startup
    if (console) console.log('Starting up');

    // init
    this.client = new CopyPasteClient("http://copypaste.local:3000");


}, true);
