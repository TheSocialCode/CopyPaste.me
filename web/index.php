<?php

    // 1. register
    $sSection = strtolower($_SERVER['REQUEST_URI']);

    // 2. prepare
    $sProtocol = (isset($_SERVER['HTTPS']) && ($_SERVER['HTTPS'] == 'on' || $_SERVER['HTTPS'] == 1) || isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] == 'https') ? 'https://' : 'http://';

    // 3. build
    $sURL = $sProtocol.$_SERVER['HTTP_HOST'];
    
?>
<!doctype html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1">

    <title>CopyPaste.me - Frictionless sharing between devices</title>

    <meta name="description" content="Easily and quickly share passwords and other data between nearby devices.">
    <meta name="keywords" content="sharing, frictionless, passwords, tool, free">
    <meta property="og:title" content="Frictionless sharing" />
    <meta property="og:url" content="<?php echo $sURL ?>" />
    <meta property="og:description" content="Easily and quickly share passwords and other data between nearby devices.">
    <meta property="og:image" content="<?php echo $sURL ?>/static/images/copypaste-preview.png">

</head>
<style data-mimoto-id="css-startup">

    body {
       visibility: hidden;
    }

</style>
<body>
    <div class="main-interface">

        <div class="main-interface-content">

            <div class="interface-intro">
                <div class="info-title"><a href="/"><img data-mimoto-id="logo"
                                                         src="static/images/copypaste-logo-regular.png" width="200"
                                                         alt="CopyPaste.me logo"></a></div>
                <div class="info-subtitle">Frictionless sharing between devices</div>
                <div data-mimoto-id="alertmessage" class="alertmessage"></div>

                <div class="warning_security_compromised">
                    <div class="warning_security_compromised_title">WARNING: Security compromised</div>
                    <p>It appears a third device tried to connect to your session.</p>
                    <p>Just to be sure, we shut it down.</p>
                    <p>Your data is safe!</p>
                    <br>
                    <p>To start a new session, <a href="/">reload</a> this page!</p>
                </div>
            </div>

<?php switch($sSection) { case '/faq': ?>

            <div class="interface-faq">
                <h1 class="faq_title">Frequently Asked Question</h1>

                <h2 class="faq_question">Why does this tool exist and what do I use it for?</h2>
                <p class="faq_answer">I needed a tool that could help me when I wanted to login to some website, service or app on a public or a a friend's computer, while my password is in the password manager on my phone because – unless your are Sheldon Cooper – it's too difficult to remember (which is a good thing; please use apps like 1Password or LastPass to improve the security of your data!)</p>
                <p class="faq_answer">If you don't have a service like Airdrop or your devices aren't all connected to the same iCloud account, sharing data between devices can be a hassle. Most of the time you left with painstakingly typing in your password character by character while reading it from you phone. And having to at least start over  three to five times because of a typo. Even more when your add the stress of colleagues or friends looking over your shoulder.</p>

                <h2 class="faq_question">So how does it work?</h2>
                <p class="faq_answer">Your `receiving` device shows a QR code. By scanning this code with, for instance, your phone, Voila: a realtime connection is set up and you are ready for sharing (for people with technical knowledge: I'm connecting the two devices using socket.io). When you send your data, it's immediately forwarded to the receiving device without storing it on the server. Therfor there will be not traces of logs of what you share.</p>
            </div>

<?php break; default: ?>

            <div data-mimoto-id="interface-receiver" class="interface-receiver">

                <!-- QR code -->

                <div id="QR-holder" class="QR-holder">
                    <div class="QRCodePlaceHolder">
                        <div class="QRCodePlaceHolder-label">Scan me</div>
                        <div class="QRCodePlaceHolder-sublabel">to connect your phone</div>
                        <div id="QRCode"></div>
                    </div>
                </div>


                <!-- Waiting for sender to connect -->

                <div id="waiting" class="waiting">
                    <div class="label">Sender device connected<br>Waiting for data!</div>
                    <img src="static/images/waiting.svg">
                </div>


                <!-- Received data -->

                <div id="receiver_data_container" class="receiver_data_container"></div>

            </div>


            <div data-mimoto-id="interface-sender" class="interface-sender">
                <div class="sender_input">
                    <div id="sender_menu" class="sender_menu">
                        <div data-type="password" class="sender_menu_tab selected">Password</div>
                        <!--                        <div data-type="url" class="sender_menu_tab">URL</div>-->
                        <div data-type="text" class="sender_menu_tab">Text</div>
                        <!--                        <div data-type="image" class="sender_menu_tab">Image</div>-->
                        <div data-type="document" class="sender_menu_tab">File</div>
                        <!--                        <div data-type="document" class="sender_menu_tab">Document</div>-->
                    </div>
                    <div class="sender_data">
                        <div class="sender_data_label">
                            <div data-mimoto-id="sender_data_label_data" class="sender_data_label_data">
                                <div class="sender_data_label_data_cover">
                                    <div class="sender_data_label_cover_internal"></div>
                                    <div class="sender_data_label_cover_label">Done!</div>
                                </div>
                                <div class="sender_data_label_data_input">
                                    <input data-mimoto-id="data_input_password" class="data_input selected"
                                           type="password" placeholder="Enter password"/>
                                    <input data-mimoto-id="data_input_url" class="data_input" type="text"
                                           placeholder="Enter URL"/>
                                    <textarea data-mimoto-id="data_input_text" class="data_input"
                                              placeholder="Enter text"></textarea>
                                    <div data-mimoto-id="data_input_image" class="data_input">
                                        <div class="data_input_image">
                                            <div class="data_input_image_menu">
                                                <div class="button"
                                                     onclick="document.getElementById('data_input_image_file').click();">
                                                    Select image
                                                </div>
                                                <input id="data_input_image_file" type="file" style="display:none;"
                                                       accept='image/*' name="data_input_image_file"/>
                                            </div>
                                            <div data-mimoto-id="data_input_image_preview"
                                                 class="data_input_image_preview">
                                                <div class="data_input_image_preview_imagecontainer">
                                                    <img data-mimoto-id="data_input_image_preview_image"
                                                         class="data_input_image_preview_image"/>
                                                </div>
                                                <div data-mimoto-id="data_input_image_preview_label"
                                                     class="data_input_image_preview_label"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div data-mimoto-id="data_input_document" class="data_input">
                                        <div class="data_input_document">
                                            <div class="data_input_document_menu">
                                                <div class="button"
                                                     onclick="document.getElementById('data_input_document_file').click();">
                                                    Select document
                                                </div>
                                                <input id="data_input_document_file" type="file" style="display:none;" name="data_input_document_file"/>
                                                <br>
                                                <p style="color:#C25B56;font-size:smaller;font-style:italic">Warning - Screenshots and images taken with your camera might not work properly yet. (working on it!)</p>
                                            </div>
                                            <div data-mimoto-id="data_input_document_preview"
                                                 class="data_input_document_preview">
                                                <div data-mimoto-id="data_input_document_preview_label"
                                                     class="data_input_document_preview_label"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="sender_data_menu">
                            <div data-mimoto-id="button_input_password" class="button disabled">Send</div>
                        </div>
                    </div>
                </div>
            </div>

            <!--            <div data-mimoto-id="receiver_clipboard_clear">-->
            <!--                Don't forget to clear your clipboard after you copied sensitive data to it.-->
            <!--                <div data-mimoto-id="receiver_clipboard_clear_button" class="button">Clear now!</div>-->
            <!--            </div>-->

            <!-- General -->

            <div id="templates" class="templates">


                <!-- template: data -->

                <div id="template-data" class="receiver_data">
                    <div class="receiver_data_placeholder_container">
                        <div data-mimoto-id="placeholder" class="receiver_data_placeholder"></div>
                    </div>
                    <div data-mimoto-id="content" class="receiver_data_content_container">
                        <div class="sender_data_label_data_cover">
                            <div class="sender_data_label_cover_internal"></div>
                            <div class="sender_data_label_cover_label">Copied to clipboard!</div>
                        </div>
                        <div class="receiver_data_content">
                            <div class="receiver_data_label">

                                <div data-mimoto-id="receiver_data_label_data" class="receiver_data_label_data"></div>
                            </div>
                            <div class="receiver_data_menu">
                                <div data-mimoto-id="receiver_data_button" class="button">Copy&nbsp;to&nbsp;clipboard
                                </div>
                            </div>
                        </div>
                        <div class="receiver_data_options">
                            <span data-mimoto-id="receiver_data_option_clearnow"
                                  class="receiver_data_option">Clear now</span> |
                            <span data-mimoto-id="receiver_data_option_extend"
                                  class="receiver_data_option">extend</span> |
                            clears in <span data-mimoto-id="receiver_data_lifetime">2 mins 0 secs</span>
                        </div>
                    </div>
                </div>

            </div>

<?php break; } ?>

        </div>
        <div class="main-interface-footer">
            Created by The Social Code - <a href="/faq">FAQ</a>
        </div>
    </div>

    <script src="/static/js/CopyPaste.js"></script>
</body>
</html>