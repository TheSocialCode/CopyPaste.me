/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';


// import
const Client = require('./components/Client');


// connect
document.addEventListener('DOMContentLoaded', function () {

    // 1. output credits and call for donation
    if (console)
    {
        console.log('CopyPaste.me - Frictionless sharing between devices - Created by The Social Code');
        console.log('Please help keeping this service free by donating: https://paypal.me/thesocialcode');
        console.log('');
    }

    // 2. verify
    if (window.location.pathname.toLowerCase() === '/faq') return;

    // 3. prepare
    let sPort = (document.CopyPaste.config.socketio.port) ? ':' + document.CopyPaste.config.socketio.port : '';

    // 4. startup
    this.client = new Client(window.location.protocol + '//' + window.location.hostname + sPort);


    // ---


    // 5. store
    let elInterfaceContent = document.querySelector('[data-mimoto-id="interface-content"]');
    var elFooterCollapsed = document.querySelector('[data-mimoto-id="footer-collapsed"]');
    var elFooterExpanded = document.querySelector('[data-mimoto-id="footer-expanded"]');

    // 6. configure
    window.addEventListener('scroll', function _toggleFooter(e)
    {
        // a. read
        let rectInterfaceContent = elInterfaceContent.getBoundingClientRect();

        // b. toggle
        if (window.scrollY > rectInterfaceContent.height + elFooterExpanded.clientHeight + elFooterCollapsed.clientHeight)
        {
            elFooterCollapsed.classList.add('animate');
            elFooterCollapsed.classList.remove('show');
        }
        else
        {
            elFooterCollapsed.classList.add('show');
        }

    }.bind(this));

}, true);
