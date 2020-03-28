<?php

    // 1. register
    $sSection = strtolower($_SERVER['REQUEST_URI']);

    // 2. prepare
    $sProtocol = (isset($_SERVER['HTTPS']) && ($_SERVER['HTTPS'] == 'on' || $_SERVER['HTTPS'] == 1) || isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] == 'https') ? 'https://' : 'http://';

    // 3. build
    $sURL = $sProtocol.$_SERVER['HTTP_HOST'];

    // 4. load (ensures use of latest JS build)
    $manifest = json_decode(file_get_contents(dirname(__FILE__).'/static/dist/manifest.json'), true);
    $config = json_decode(file_get_contents(dirname(dirname(__FILE__)).'/CopyPaste.config.json'), true);

?>
<!doctype html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1">

    <title>CopyPaste.me - Frictionless sharing between devices</title>

    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
    <link rel="manifest" href="/site.webmanifest">
    <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#63a9e1">
    <meta name="msapplication-TileColor" content="#2d89ef">
    <meta name="theme-color" content="#63a9e1">


    <meta name="description" content="Easily and quickly share passwords, texts and files between devices.">
    <meta name="keywords" content="sharing, frictionless, passwords, tool, free">
    <meta property="og:title" content="Frictionless sharing" />
    <meta property="og:url" content="<?php echo $sURL ?>" />
    <meta property="og:description" content="Easily and quickly share passwords, texts and files between devices.">
    <meta property="og:image" content="<?php echo $sURL ?>/static/images/copypaste-preview.png">

    <link rel="stylesheet" href="/static/dist/<?php echo $manifest['main.css']; ?>">

</head>
<body>
    <div data-mimoto-id="interface" class="main-interface">

        <div data-mimoto-id="interface-content">
            <div class="main-interface-container">

                <div class="main-interface-header-background"></div>

                <div class="main-interface-header-content">

                    <div class="logo">
    <!--                    <a class="logo" href="/"><span class="logo-copypaste">CopyPaste</span><span class="logo-me">.me</span></a>-->
                        <a class="logo" href="/"><img data-mimoto-id="logo" src="/static/images/copypaste-logo-normal.png" width="200" /></a>
                    </div>

                    <h1 class="tagline">Frictionless sharing<br>between devices</h1>
                    <h2 class="description">Private end-to-end encryption, secure transfer and your data is never stored on the server</h2>

                    <div class="component_AlertMessage_container"><div data-mimoto-id="component_AlertMessage" class="component_AlertMessage"></div></div>

                    <div class="warning_security_compromised">
                        <div class="warning_security_compromised_title">WARNING: Security compromised</div>
                        <p>It appears a third device tried to connect to your session.</p>
                        <p>Just to be sure, we shut it down.</p>
                        <p>Your data is safe!</p>
                        <br>
                        <p>To start a new session, <a href="/">reload</a> this page!</p>
                    </div>

                    <?php
                        switch($sSection)
                        {
                            case '/connect':
                            default:

                                include(dirname(dirname(__FILE__)).'/src/pages/app.php');
                                break;
                        }
                    ?>
                </div>
            </div>

            <?php
                switch($sSection)
                {
                    case '/faq':

                        include(dirname(dirname(__FILE__)).'/src/pages/faq.php');
                        break;

                    case '/connect':
                    default:

                        include(dirname(dirname(__FILE__)).'/src/pages/information.php');
                        break;
                }
            ?>
        </div>

        <div data-mimoto-id="footer" class="main-interface-footer">
            <div data-mimoto-id="footer-expanded" class="main-interface-footer-expanded">
                <div class="footer_table">
                    <div class="footer_table_column left">
                        <div class="footer-logo-copypaste">CopyPaste<span class="footer-logo-me">.me</span></div>
                        <div class="footer-logo-credits">Created by <a href="https://thesocialcodefoundation.org" target="_blank">The Social Code</div>
                    </div>
                    <div class="footer_table_column center footer_table_center">
                        <div class="footer_table_center_column">
                            <div class="footer_table_center_column_cell"><a href="#information_howitworks">How it works</a></div>
                            <div class="footer_table_center_column_cell"><a href="/">Privacy</a></div>
                            <div class="footer_table_center_column_cell"><a href="/faq">FAQ</a></div>
                        </div>
                        <div class="footer_table_center_column">
                            <div class="footer_table_center_column_cell"><a href="https://github.com/TheSocialCode/CopyPaste.me" target="_blank">Source code</a></div>
                            <div class="footer_table_center_column_cell"><a href="#information_support">Support</a></div>
                            <div class="footer_table_center_column_cell"><a href="mailto:sebastian@thesocialcode.com">Contact</a></div>
                        </div>
                    </div>
                    <div class="footer_table_column right">
                        Follow the project<br>
                        [Email] [Linkedin] [Facebook] [Instagram]
                    </div>
                </div>
            </div>
            <div data-mimoto-id="footer-collapsed" class="main-interface-footer-collapsed show">
                Offered by <a href="https://thesocialcodefoundation.org" target="_blank">The Social Code</a> - <!--<a href="/faq">FAQ</a> - --><a href="https://paypal.me/thesocialcode" target="_blank">Donate now</a>
            </div>
        </div>
    </div>

    <script nonce="<?php echo $config['csp']['nonce-js']; ?>">
        document.CopyPaste = {
            config: {
                socketio: {
                    port: '<?php echo $config['socketio']['client']['port']; ?>'
                }
            }
        };
    </script>
    <script src="/static/dist/<?php echo $manifest['main.js']; ?>"></script>
</body>
</html>