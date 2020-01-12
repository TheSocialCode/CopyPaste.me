/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';


// import CSS
import './CopyPaste.client.scss';

// import
const Client = require('./components/Client');


// connect
document.addEventListener('DOMContentLoaded', function () {

    // 1. output credits and call for donation
    if (console)
    {
        console.log('CopyPaste.me - Frictionless sharing between devices - Created by The Social Code');
        console.log('Help keeping this service free by donating: https://www.paypal.me/thesocialcode');
        console.log('');
    }

    // 2. verify
    if (window.location.pathname.toLowerCase() === '/faq') return;

    // 3. startup
    this.client = new Client(window.location.protocol + '//' + window.location.hostname +  ':3000');

}, true);

// show interface
document.querySelector('[data-mimoto-id="css-startup"]').remove();