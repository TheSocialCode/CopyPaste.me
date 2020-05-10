/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';


// import
const Client = require('./components/Client');

// import external classes
const Module_ClipboardCopy = require('clipboard-copy');


// connect
document.addEventListener('DOMContentLoaded', function () {

    // 1. output credits and call for donation
    if (console)
    {
        console.log('CopyPaste.me - Frictionless sharing between devices - Created by The Social Code');
        console.log('Please help keeping this service free by donating: https://paypal.me/thesocialcode');
        console.log('');
    }

    // 2. prepare
    let sPort = (document.CopyPaste.config.socketio.port) ? ':' + document.CopyPaste.config.socketio.port : '';

    // 3. compose
    let sURL = window.location.protocol + '//' + window.location.hostname;


    // ---


    // 4. store
    let elInterfaceContent = document.querySelector('[data-mimoto-id="interface-content"]');
    var elFooterCollapsed = document.querySelector('[data-mimoto-id="footer-collapsed"]');
    var elFooterCollapsedBackground = document.querySelector('[data-mimoto-id="footer-collapsed-background"]');
    var elFooterExpanded = document.querySelector('[data-mimoto-id="footer-expanded"]');

    // 5. define
    this._toggleFooter = function(e)
    {
        // a. read
        let rectInterfaceContent = elInterfaceContent.getBoundingClientRect();

        // b. calculate
        var limit = Math.max(document.body.scrollHeight, document.body.offsetHeight,
            document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight );

        // c. toggle
        if (window.scrollY > limit - window.innerHeight - elFooterExpanded.clientHeight + elFooterCollapsed.clientHeight)
        {
            // I. toggle visibility
            elFooterCollapsed.classList.add('animate');
            elFooterCollapsed.classList.remove('show');
        }
        else
        {
            // I. toggle visibility
            elFooterCollapsed.classList.add('show');
        }
    };

    // 6. init
    this._toggleFooter();

    // 7. configure
    // document.querySelector('[data-mimoto-id="footer-copylink"]').addEventListener('click', function(sURL)
    // {
    //     // a. copy
    //     Module_ClipboardCopy(sURL);
    //
    // }.bind(this, sURL));

    // 8. configure
    window.addEventListener('scroll', this._toggleFooter.bind(this));

    // 9. configure
    elFooterCollapsedBackground.addEventListener('click', function()
    {
        // a. animated scroll
        window.scrollTo( { top:document.body.scrollHeight, left:0, behavior: 'smooth' });

    }.bind(this));

    // 10. verify
    if (window.location.pathname.toLowerCase() === '/faq') return;

    // 11. startup
    this.client = new Client(sURL + sPort);

}, true);
