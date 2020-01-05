/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';


// import CSS
import './CopyPaste.client.scss';

// import
const Client = require('./modules/Client');


// connect
document.addEventListener('DOMContentLoaded', function () {

    // 1. verify
    if (window.location.pathname.toLowerCase() === '/faq') return;

    // 2. startup
    this.client = new Client(window.location.protocol + '//' + window.location.hostname +  ':3000');

}, true);

// show interface
document.querySelector('[data-mimoto-id="css-startup"]').remove();