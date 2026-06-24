<div class="main-information">

    <div class="module_FAQ_header">
        <h1 class="faq_title">Frequently Asked Questions</h1>
        <img src="/static/images/mockup-min.png" class="faq_mockup">
    </div>

    <div class="main-information">
        <div class="main-interface-information">
            <div class="main-interface-information-section left">
                <h2 class="main-interface-information-section-title">Why does this tool exist and what do I use it for?</h2>
                <p class="main-interface-information-section-body">
                    I needed a tool that could help me when I want to login to some website, service or app on a public or a friend's computer, while my passwords are in the password manager on my phone (and they are way too difficult to remember, which is a good thing; please use apps like 1Password, LastPass, Dashlane etc to improve the security of your data!)
                </p>
                <p class="main-interface-information-section-body">
                    If you don't have a service like Airdrop or your devices aren't all connected to the same iCloud account, sharing data between devices can be a hassle. Most of the time you are left with painstakingly typing in your password character by character while reading it from you phone. And having to start over at least three to five times because of a typo. Even more when your add the stress of colleagues or friends looking over your shoulder.
                </p>
                <p class="main-interface-information-section-body">
                    <a href="/" class="highlighted">CopyPaste.me</a> helps you transferring any password, texts or file from one device to another. So no more emailing yourself passwords or other things to get stuff from you phone to your computer or writing down a password on a piece of paper for a colleague or family member (Don't judge! Many of us have done it at least once or twice :p).
                </p>
            </div>

            <div class="main-interface-information-section right-contentleft">
                <h2 class="main-interface-information-section-title">How can I transfer data between two devices?</h2>
                <p class="main-interface-information-section-body">
                    <a href="/" class="highlighted">CopyPaste.me</a> offers three ways to connect two devices so you can start sharing data between them:
                    <ol>
                        <li>
                            <b>By scanning a QR</b><br>
                            Your receiving device shows a QR code. By scanning this code with, for instance, your phone, the two devices are instantly connected and you are ready for sharing.<br>
                            <br>
                        </li>
                        <li>
                            <b>By setting up a connection manually</b><br>
                            If you don't have a QR-scanner on your phone or you don't know how to access it, you can also use the option to connect manually. Follow the instructions and you'll be sharing in no time.<br>
                            <br>
                        </li>
                        <li>
                            <b>Send someone a secure invite</b><br>
                            If you would like to share date in a secure and private way with someone that is not in the room you could use the invite functionality. <a href="/" class="highlighted">CopyPaste.me</a> offers your the option to share a secure invite directly via WhatsApp, Telegram or email or you can copy the link to your clipboard to send the secure invite via any other medium you prefer.<br>
                            <br>
                        </li>
                    </ol>
                </p>
            </div>

            <div class="main-interface-information-section left">
                <h2 class="main-interface-information-section-title">Why, instead of sending a secure invite via WhatApp, Telegram or email and then sharing the data via that connection, not just send the data via those channels directly?</h2>
                <p class="main-interface-information-section-body">
                    First of all: after you connect two devices, the data your send one to another is secured through end-to-end encryption. Not all services you commonly use offer this because their business models centre about knowing you by analysing the data your share (so they, for instance, can serve you ads that are tailored to your personal preferences)
                </p>
                <p class="main-interface-information-section-body">
                    Second: In the technological world where only a handful of platforms have become hugely dominant and all-knowing about your behaviour, preferences, movement and network, it's important to have independent alternatives that don't merely exist to make money by exploiting your needs. <a href="/" class="highlighted">CopyPaste.me</a> aims to operate on donations only, taking away any stakeholder (like shareholders or advertisers) that might have other interests than simply offering the service you need.
                </p>
            </div>

            <div id="security" class="main-interface-information-section right">
                <h2 class="main-interface-information-section-title">Can I trust my data to be handled in a safe way?</h2>
                <p class="main-interface-information-section-body">
                    <a href="/" class="highlighted">CopyPaste.me</a> has been designed and built with security and your privacy in mind. The tokens (QR-code, the code to connect manually or the secure invite link) you see when setting up a connection all have a short expiry date. The tokens are meant to quickly setup a connection, not to have them wandering around on the internet. Once you connected the two devices and start sharing, the data is transferred using end-to-end encryption so the data can only be accessed on the two devices, not on the server. And to top that, when you send your data, it's immediately forwarded to the receiving device without storing it on the server. Therefore there will be no traces or logs of what you share.
                </p>
                <p class="main-interface-information-section-body">
                    But please don’t take my word for it. In order to be fully transparent I’ve opened up the <a href="https://github.com/TheSocialCode/CopyPaste.me" target="_blank" class="highlighted">source code</a> of the project so you can see for yourself how it works. Let me know what your think about it or if you see room for improvements. Let's collaborate on making this the best sharing tool available! You can reach me at <a href="mailto:sebastian@thesocialcode.com" class="highlighted">sebastian@thesocialcode.com</a>
                </p>
                <p class="main-interface-information-section-body">
                    Of course we aim to have the server passing the data between the two devices to be set up a properly and securely as possible (please <a href="https://securityheaders.com/?q=copypaste.me&hide=on&followRedirects=on" target="_blank" class="highlighted">check it yourself</a>). Additionally, since privacy is woven intro the core of the project, the access logs servers commonly run to log basis visitor information are disabled.
                </p>
            </div>

            <div class="main-interface-information-section left">
                <h2 class="main-interface-information-section-title">So you really seem to care about our privacy, that's awesome. How about analytics. Do you use them?</h2>
                <p class="main-interface-information-section-body">
                    Yes, I've written some very basis stats specifically for this tool, just enough to monitor 'how' <a href="/" class="highlighted">CopyPaste.me</a> is used – not who uses it, when, where or for what. When implementing any form of analytics I try always to aim for the highest level of privacy and stay away from the common practice of services like Google Analytics that scrape the hell out of every user  and providing me with way more information than I'll ever need (don't get me wrong, I love stats, I just think they don't belong here in order to safeguard your privacy).
                </p>
                <p class="main-interface-information-section-body">
                    The basis stats that are stored are things like: number of connected pairs, number of used pairs, number of data transferred and of what type ("password", "text" or "file") and roughly the size of the data that was transferred (to keep monitor performance of the tool and prevent the servers to be maxed out), number of data sent per pair (are there a lot of one-off transfers or do people share many files within one session. The data mentioned here is not marked with a timestamp, but some actions I log temporarily, like "sending your first piece of data" have a "time since start of session"-value which gives me some insights in how intuitive or easy-to-use the tool is (shorter time could indicate less confusion on how to use it, which in turn means : happy user!).
                </p>
                <p class="main-interface-information-section-body">
                    The aim is to get the data retention as low as possible so most of this data is flattened within minutes and discarded within an hour so in the end only aggregated data is left over.
                </p>
            </div>

            <div class="main-interface-information-section right">
                <h2 class="main-interface-information-section-title">Why is it free? Are you secretly selling my data?</h2>
                <p class="main-interface-information-section-body">
                    No, your data is yours and yours alone. Furthermore, because your data is end-to-end encrypted, there is no way to even know what your data is, because only your device has the key that allows access to it. So even when I would want to sell any data, I couldn't, because I don't have it.
                </p>
                <p class="main-interface-information-section-body">
                    It's as simple as that.
                </p>
                <p class="main-interface-information-section-body">
                    Another reason why <a href="/" class="highlighted">CopyPaste.me</a> is free is because I hope to prove another business model than exponential growth backed by venture capital or selling attention to support an ad model is viable as well. By asking you, the users of this tool, to contribute in the form of a one time <a href="https://paypal.me/thesocialcode" target="_blank" class="highlighted">donation</a> or by becoming a <a href="https://www.patreon.com/thesocialcode" target="_blank" class="highlighted">patron</a>, I hope we can build a technology world that doesn't revolve solely on making money, but simply one that benefits all equally funded by the collective (a good example of this model for instance is WikiPedia)
                </p>
            </div>

            <div class="main-interface-information-section left">
                <h2 class="main-interface-information-section-title">So just to be clear, my data is never stored?</h2>
                <p class="main-interface-information-section-body">
                    Exactly! Your data is yours and yours alone and this tool is designed to work without the need to store your data. Which is good, because your data shouldn't be stored all over the internet just because you're using online tools.
                </p>
            </div>

            <div class="main-interface-information-section right">
                <h2 class="main-interface-information-section-title">How does it actually work technically?</h2>
                <p class="main-interface-information-section-body">
                    At its core, <a href="/" class="highlighted">CopyPaste.me</a> acts as a secure,<br>
                    temporary bridge between your two devices. Here is<br>
                    what happens behind the scenes when you share something:
                </p>
            </div>

            <figure class="howitworks-blueprint" aria-labelledby="howitworks-blueprint-caption">
                <svg class="howitworks-blueprint-svg" viewBox="0 0 960 650" role="img" xmlns="http://www.w3.org/2000/svg" aria-label="Schematic of how CopyPaste.me connects two devices over a secure end-to-end encrypted relay: the devices exchange public keys, then share passwords, text and files that can only be opened with their private keys">
                    <defs>
                        <pattern id="bpGridMinor" width="24" height="24" patternUnits="userSpaceOnUse">
                            <path d="M24 0H0V24" fill="none" stroke="#eef1f4" stroke-width="1"/>
                        </pattern>
                        <pattern id="bpGridMajor" width="120" height="120" patternUnits="userSpaceOnUse">
                            <path d="M120 0H0V120" fill="none" stroke="#e2e6ea" stroke-width="1.2"/>
                        </pattern>
                        <marker id="bpArrow" markerWidth="9" markerHeight="9" refX="6.5" refY="3" orient="auto" markerUnits="strokeWidth">
                            <path d="M0 0L7 3L0 6Z" fill="#1f74c4"/>
                        </marker>
                    </defs>

                    <!-- backdrop -->
                    <rect x="0" y="0" width="960" height="650" fill="#ffffff"/>
                    <rect x="0" y="0" width="960" height="650" fill="url(#bpGridMinor)"/>
                    <rect x="0" y="0" width="960" height="650" fill="url(#bpGridMajor)"/>
                    <rect x="10" y="10" width="940" height="630" fill="none" stroke="#c4ccd4" stroke-width="1.5"/>
                    <rect x="18" y="18" width="924" height="614" fill="none" stroke="#d6dde3" stroke-width="0.75"/>

                    <!-- title blocks -->
                    <g font-family="Montserrat, sans-serif">
                        <rect x="28" y="28" width="250" height="56" fill="none" stroke="#c4ccd4" stroke-width="1"/>
                        <line x1="28" y1="56" x2="278" y2="56" stroke="#c4ccd4" stroke-width="0.75"/>
                        <text x="40" y="49" font-size="17" font-weight="800" letter-spacing="1.5" fill="#2b2f33">COPYPASTE.ME</text>
                        <text x="40" y="74" font-size="11" letter-spacing="2" fill="#6b7780">DATA TRANSFER SCHEMATIC</text>

                        <rect x="682" y="28" width="250" height="56" fill="none" stroke="#c4ccd4" stroke-width="1"/>
                        <line x1="682" y1="56" x2="932" y2="56" stroke="#c4ccd4" stroke-width="0.75"/>
                        <text x="920" y="49" font-size="11" letter-spacing="2" text-anchor="end" fill="#6b7780">END-TO-END ENCRYPTED</text>
                        <text x="920" y="74" font-size="11" letter-spacing="2" text-anchor="end" fill="#6b7780">SERVER STORES NOTHING</text>
                    </g>

                    <!-- secure relay (top center) -->
                    <g fill="none" stroke="#3a3f44" stroke-width="2" stroke-linejoin="round" stroke-linecap="round">
                        <circle cx="480" cy="118" r="46"/>
                        <circle cx="480" cy="118" r="56" stroke="#1f74c4" stroke-width="1" stroke-dasharray="4 6"/>
                        <rect x="463" y="116" width="34" height="28" rx="3"/>
                        <path d="M469 116 v-9 a11 11 0 0 1 22 0 v9"/>
                        <circle cx="480" cy="128" r="3.5" fill="#3a3f44" stroke="none"/>
                        <line x1="480" y1="131" x2="480" y2="138"/>
                    </g>
                    <text x="480" y="50" font-family="Montserrat, sans-serif" font-size="12" font-weight="700" letter-spacing="2" text-anchor="middle" fill="#2b2f33">SECURE RELAY · NO DATA STORED</text>

                    <!-- encrypted channel: device A -> relay -> device B -->
                    <g fill="none" stroke="#1f74c4" stroke-width="2">
                        <path d="M250 232 Q 360 130 432 122" marker-end="url(#bpArrow)" marker-start="url(#bpArrow)"/>
                        <path d="M528 122 Q 648 130 770 232" marker-end="url(#bpArrow)" marker-start="url(#bpArrow)"/>
                    </g>
                    <text x="318" y="150" font-family="Montserrat, sans-serif" font-size="10" letter-spacing="1.5" text-anchor="middle" fill="#6b7780">ENCRYPTED</text>
                    <text x="650" y="150" font-family="Montserrat, sans-serif" font-size="10" letter-spacing="1.5" text-anchor="middle" fill="#6b7780">ENCRYPTED</text>

                    <!-- device A : desktop / laptop -->
                    <g fill="none" stroke="#3a3f44" stroke-width="2" stroke-linejoin="round" stroke-linecap="round">
                        <rect x="80" y="212" width="170" height="120" rx="8"/>
                        <rect x="92" y="224" width="146" height="96" rx="4" stroke="#9aa4ad" stroke-width="1"/>
                        <path d="M58 332 L272 332 L296 358 L34 358 Z"/>
                        <line x1="120" y1="358" x2="210" y2="358" stroke="#9aa4ad" stroke-width="1"/>
                        <!-- QR code -->
                        <g stroke="none" fill="#2b2f33">
                            <path d="M120 236 h22 v22 h-22 Z M126 242 h10 v10 h-10 Z" fill-rule="evenodd"/>
                            <path d="M188 236 h22 v22 h-22 Z M194 242 h10 v10 h-10 Z" fill-rule="evenodd"/>
                            <path d="M120 286 h22 v22 h-22 Z M126 292 h10 v10 h-10 Z" fill-rule="evenodd"/>
                            <rect x="150" y="238" width="6" height="6"/>
                            <rect x="162" y="238" width="6" height="6"/>
                            <rect x="156" y="250" width="6" height="6"/>
                            <rect x="174" y="250" width="6" height="6"/>
                            <rect x="150" y="262" width="6" height="6"/>
                            <rect x="186" y="266" width="6" height="6"/>
                            <rect x="156" y="278" width="6" height="6"/>
                            <rect x="168" y="278" width="6" height="6"/>
                            <rect x="180" y="288" width="6" height="6"/>
                            <rect x="192" y="296" width="6" height="6"/>
                            <rect x="156" y="298" width="6" height="6"/>
                            <rect x="168" y="296" width="6" height="6"/>
                        </g>
                    </g>
                    <text x="165" y="388" font-family="Montserrat, sans-serif" font-size="12" font-weight="700" letter-spacing="2" text-anchor="middle" fill="#2b2f33">DEVICE A</text>
                    <text x="165" y="406" font-family="Montserrat, sans-serif" font-size="10" letter-spacing="1.5" text-anchor="middle" fill="#6b7780">SHOWS THE QR CODE</text>

                    <!-- device B : phone -->
                    <g fill="none" stroke="#3a3f44" stroke-width="2" stroke-linejoin="round" stroke-linecap="round">
                        <rect x="772" y="206" width="96" height="172" rx="16"/>
                        <rect x="782" y="222" width="76" height="132" rx="6" stroke="#9aa4ad" stroke-width="1"/>
                        <line x1="808" y1="216" x2="832" y2="216"/>
                        <line x1="806" y1="366" x2="834" y2="366"/>
                        <!-- scan reticle -->
                        <g stroke="#1f74c4">
                            <path d="M802 268 v-10 h10"/>
                            <path d="M838 268 v-10 h-10"/>
                            <path d="M802 300 v10 h10"/>
                            <path d="M838 300 v10 h-10"/>
                        </g>
                        <circle cx="820" cy="284" r="3" fill="#1f74c4" stroke="none"/>
                    </g>
                    <text x="820" y="388" font-family="Montserrat, sans-serif" font-size="12" font-weight="700" letter-spacing="2" text-anchor="middle" fill="#2b2f33">DEVICE B</text>
                    <text x="820" y="406" font-family="Montserrat, sans-serif" font-size="10" letter-spacing="1.5" text-anchor="middle" fill="#6b7780">SCANS · MANUAL · INVITE</text>

                    <!-- scan beam : phone -> QR -->
                    <line x1="800" y1="284" x2="216" y2="284" stroke="#1f74c4" stroke-width="1.6" stroke-dasharray="2 9" stroke-linecap="round" marker-end="url(#bpArrow)"/>

                    <!-- step badges -->
                    <g font-family="Montserrat, sans-serif" font-weight="800" font-size="15" text-anchor="middle">
                        <circle cx="100" cy="200" r="15" fill="#1f74c4"/>
                        <text x="100" y="205" fill="#ffffff">1</text>
                        <circle cx="850" cy="196" r="15" fill="#1f74c4"/>
                        <text x="850" y="201" fill="#ffffff">2</text>
                        <circle cx="538" cy="86" r="15" fill="#1f74c4"/>
                        <text x="538" y="91" fill="#ffffff">3</text>
                        <circle cx="650" cy="186" r="15" fill="#1f74c4"/>
                        <text x="650" y="191" fill="#ffffff">4</text>
                    </g>

                    <!-- legend -->
                    <line x1="40" y1="424" x2="920" y2="424" stroke="#d6dde3" stroke-width="0.75"/>
                    <g font-family="Montserrat, sans-serif" font-size="11" letter-spacing="0.5" fill="#4a5560">
                        <g>
                            <circle cx="48" cy="444" r="9" fill="none" stroke="#1f74c4" stroke-width="1.5"/>
                            <text x="48" y="448" font-size="10" font-weight="800" text-anchor="middle" fill="#1f74c4">1</text>
                            <text x="63" y="448">GENERATE QR</text>
                        </g>
                        <g>
                            <circle cx="226" cy="444" r="9" fill="none" stroke="#1f74c4" stroke-width="1.5"/>
                            <text x="226" y="448" font-size="10" font-weight="800" text-anchor="middle" fill="#1f74c4">2</text>
                            <text x="241" y="448">SCAN · MANUAL · INVITE</text>
                        </g>
                        <g>
                            <circle cx="430" cy="444" r="9" fill="none" stroke="#1f74c4" stroke-width="1.5"/>
                            <text x="430" y="448" font-size="10" font-weight="800" text-anchor="middle" fill="#1f74c4">3</text>
                            <text x="445" y="448">SECURE E2E CHANNEL</text>
                        </g>
                        <g>
                            <circle cx="648" cy="444" r="9" fill="none" stroke="#1f74c4" stroke-width="1.5"/>
                            <text x="648" y="448" font-size="10" font-weight="800" text-anchor="middle" fill="#1f74c4">4</text>
                            <text x="663" y="448">SHARE PASSWORDS · TEXT · FILES</text>
                        </g>
                    </g>

                    <!-- key exchange detail (step 3) -->
                    <line x1="40" y1="481" x2="920" y2="481" stroke="#d6dde3" stroke-width="0.75"/>
                    <rect x="406" y="470" width="148" height="22" fill="#ffffff" stroke="#c4ccd4" stroke-width="1"/>
                    <text x="480" y="485" font-family="Montserrat, sans-serif" font-size="11" font-weight="800" letter-spacing="2" text-anchor="middle" fill="#2b2f33">KEY EXCHANGE</text>

                    <text x="120" y="515" font-family="Montserrat, sans-serif" font-size="11" font-weight="700" letter-spacing="1.5" text-anchor="middle" fill="#2b2f33">DEVICE A</text>
                    <text x="820" y="515" font-family="Montserrat, sans-serif" font-size="11" font-weight="700" letter-spacing="1.5" text-anchor="middle" fill="#2b2f33">DEVICE B</text>

                    <!-- device A key pair -->
                    <g transform="translate(95,537)" fill="none" stroke="#1f74c4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="0" cy="0" r="7"/>
                        <circle cx="0" cy="0" r="2.5"/>
                        <path d="M7 0 H28"/>
                        <path d="M22 0 V6"/>
                        <path d="M27 0 V5"/>
                    </g>
                    <text x="132" y="541" font-family="Montserrat, sans-serif" font-size="10" letter-spacing="1" fill="#6b7780">PUBLIC KEY</text>
                    <g transform="translate(95,561)" stroke="#2b2f33" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="0" cy="0" r="7" fill="#2b2f33"/>
                        <circle cx="0" cy="0" r="2.5" fill="#ffffff" stroke="none"/>
                        <path d="M7 0 H28" fill="none"/>
                        <path d="M22 0 V6" fill="none"/>
                        <path d="M27 0 V5" fill="none"/>
                    </g>
                    <text x="132" y="565" font-family="Montserrat, sans-serif" font-size="10" letter-spacing="1" fill="#6b7780">PRIVATE KEY</text>

                    <!-- device B key pair -->
                    <g transform="translate(795,537)" fill="none" stroke="#1f74c4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="0" cy="0" r="7"/>
                        <circle cx="0" cy="0" r="2.5"/>
                        <path d="M7 0 H28"/>
                        <path d="M22 0 V6"/>
                        <path d="M27 0 V5"/>
                    </g>
                    <text x="832" y="541" font-family="Montserrat, sans-serif" font-size="10" letter-spacing="1" fill="#6b7780">PUBLIC KEY</text>
                    <g transform="translate(795,561)" stroke="#2b2f33" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="0" cy="0" r="7" fill="#2b2f33"/>
                        <circle cx="0" cy="0" r="2.5" fill="#ffffff" stroke="none"/>
                        <path d="M7 0 H28" fill="none"/>
                        <path d="M22 0 V6" fill="none"/>
                        <path d="M27 0 V5" fill="none"/>
                    </g>
                    <text x="832" y="565" font-family="Montserrat, sans-serif" font-size="10" letter-spacing="1" fill="#6b7780">PRIVATE KEY</text>

                    <!-- public keys are swapped -->
                    <path d="M260 535 Q 480 511 700 535" fill="none" stroke="#1f74c4" stroke-width="2" marker-end="url(#bpArrow)"/>
                    <text x="480" y="503" font-family="Montserrat, sans-serif" font-size="10" letter-spacing="1" text-anchor="middle" fill="#1f74c4">A's PUBLIC key &#8594;</text>
                    <path d="M700 563 Q 480 587 260 563" fill="none" stroke="#1f74c4" stroke-width="2" marker-end="url(#bpArrow)"/>
                    <text x="480" y="591" font-family="Montserrat, sans-serif" font-size="10" letter-spacing="1" text-anchor="middle" fill="#1f74c4">&#8592; B's PUBLIC key</text>

                    <text x="480" y="618" font-family="Montserrat, sans-serif" font-size="11" letter-spacing="0.3" text-anchor="middle" fill="#6b7780">Data is encrypted with the recipient's PUBLIC key &#8212; and can be opened only with their matching PRIVATE key, which never leaves the device.</text>
                </svg>
                <figcaption id="howitworks-blueprint-caption" class="howitworks-blueprint-caption">
                    <span class="highlight">Device A</span> shows a QR code, <span class="highlight">Device B</span> scans it (or connects manually or by invite), and a secure end-to-end encrypted channel opens through a relay that stores nothing. The devices first <span class="highlight">exchange public keys</span>: everything you send is encrypted with the recipient's public key and can be opened only with their matching private key &mdash; which never leaves their device. Then you share passwords, text snippets and files.
                </figcaption>
            </figure>

            <div class="main-interface-information-section right">
                <p class="main-interface-information-section-body">
                    <b>The Handshake:</b> When you scan the QR code or enter a manual code, our server temporarily introduces your two devices to each other (think of it like a digital handshake). The tokens used for this handshake have a very short lifespan and expire quickly.
                </p>
                <p class="main-interface-information-section-body">
                    <b>End-to-End Encryption (E2EE):</b> Before your password, text, or file ever leaves your first device, it is encrypted locally right inside your web browser. This means the data is scrambled into an unreadable format using a cryptographic key that only your two connected devices possess.
                </p>
                <p class="main-interface-information-section-body">
                    <b>The Transfer:</b> Once encrypted, the data is pushed to the receiving device. Because we don't use databases to store your payload, the encrypted data is simply relayed in real-time. Even if we wanted to read it as it passed through (which we don't!), we couldn't, because the server doesn't hold the decryption keys.
                </p>
                <p class="main-interface-information-section-body">
                    <b>The Decryption:</b> The receiving device catches the scrambled data and uses its matching local key to instantly decrypt it back into your original text, password, or file.
                </p>
                <p class="main-interface-information-section-body">
                    Because privacy shouldn't rely on blind trust, the entire process is open-source. Developers and privacy enthusiasts can view the <a href="https://github.com/TheSocialCode/CopyPaste.me" target="_blank" class="highlighted">source code</a> directly to verify exactly how the encryption and transfer mechanics are implemented.
                </p>
            </div>

            <div id="contact" class="main-interface-information-section left">
                <h2 class="main-interface-information-section-title">I have a suggestion for an improvement or found a bug. How can I contact you about this?</h2>
                <p class="main-interface-information-section-body">
                    For features requests, suggestions for improvement or things you noticed are not working as you imagine they should, please contact me at <a href="mailto:sebastian@thesocialcode.com" class="highlighted">sebastian@thesocialcode.com</a>
                </p>
            </div>

            <div class="main-interface-information-section right">
                <h2 class="main-interface-information-section-title">For now ...</h2>
                <p class="main-interface-information-section-body">
                    I hope you enjoy using <a href="/" class="highlighted">CopyPaste.me</a><br>
                    <br>
                    Let me know what you think of it on <a href="https://www.instagram.com/the.social.code" target="_blank" class="highlighted">Instagram</a> or via <a href="mailto:sebastian@thesocialcode.com" class="highlighted">email</a><br> or send me a message if you have any additional questions.<br>
                    <br>
                    Please remember to <a href="/#support" class="highlighted">support the project</a> if you like it!<br>
                    <br>
                    Best wishes,<br>
                    <br>
                    <b>Sebastian Kersten</b>
                </p>
                <br>
                <br>
            </div>


        </div>
    </div>

</div>
