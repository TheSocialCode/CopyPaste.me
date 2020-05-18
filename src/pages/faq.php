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

            <div id="contact" class="main-interface-information-section right">
                <h2 class="main-interface-information-section-title">I have a suggestion for an improvement or found a bug. How can I contact you about this?</h2>
                <p class="main-interface-information-section-body">
                    For features requests, suggestions for improvement or things you noticed are not working as you imagine they should, please contact me at <a href="mailto:sebastian@thesocialcode.com" class="highlighted">sebastian@thesocialcode.com</a>
                </p>
            </div>

            <div class="main-interface-information-section left">
                <h2 class="main-interface-information-section-title">For now ...</h2>
                <p class="main-interface-information-section-body">
                    I hope you enjoy using <a href="/" class="highlighted">CopyPaste.me</a><br>
                    <br>
                    Let me know what you think of it on <a href="https://www.facebook.com/frictionless.sharing/" target="_blank" class="highlighted">Facebook</a> or via <a href="mailto:sebastian@thesocialcode.com" class="highlighted">email</a><br> or send me a message if you have any additional questions.<br>
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
