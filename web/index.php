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

                <div data-mimoto-id="main-interface-header-background" class="main-interface-header-background"></div>

                <div class="main-interface-header-content">

                    <div class="logo">
                        <a class="logo" href="/"><img data-mimoto-id="logo" src="/static/images/copypaste-logo-normal.png" width="200" /></a>
                    </div>

                    <h1 class="tagline">Frictionless sharing<br>between devices</h1>
                    <h2 class="description">Private end-to-end encryption, secure transfer and your data won't be stored in the cloud</h2>

                    <div class="component_AlertMessage_container">
                        <div data-mimoto-id="component_AlertMessage" class="component_AlertMessage">
                            <div class="component_AlertMessage_content">
                                <div data-mimoto-id="label" class="component_AlertMessage_label"></div>
                                <div data-mimoto-id="menu" class="component_AlertMessage_menu">
                                    <div data-mimoto-id="button" class="component_AlertMessage_button"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div data-mimoto-id="warning_security_compromised" class="warning_security_compromised"></div>

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
                        <div class="footer-logo-credits">Offered by <a href="https://thesocialcodefoundation.org" target="_blank">The Social Code</div>
                    </div>
                    <div class="footer_table_column center footer_table_center">
                        <div class="footer_table_center_column">
                            <div class="footer_table_center_column_cell"><a href="#information_howitworks">How it works</a></div>
                            <div class="footer_table_center_column_cell"><a href="/">Security</a></div>
                            <div class="footer_table_center_column_cell"><a href="/faq">FAQ</a></div>
                        </div>
                        <div class="footer_table_center_column">
                            <div class="footer_table_center_column_cell"><a href="https://github.com/TheSocialCode/CopyPaste.me" target="_blank">Source code</a></div>
                            <div class="footer_table_center_column_cell"><a href="#information_support">Support</a></div>
                            <div class="footer_table_center_column_cell"><a href="mailto:sebastian@thesocialcode.com">Contact</a></div>
                        </div>
                    </div>
                    <div class="footer_table_column right">
                        <div class="footer_socialicons_title">Follow the project</div>
                        <div class="footer_socialicons">
                            <a href="https://www.facebook.com/thesocialcodefoundation" target="_blank"><div class="footer_socialicon facebook"></div></a>
                            <a href="https://www.instagram.com/the.social.code" target="_blank"><div class="footer_socialicon instagram"></div></a>
                            <a href="https://www.linkedin.com/company/thesocialcode" target="_blank"><div class="footer_socialicon linkedin"></div></a>
                            <a href="https://www.getrevue.co/profile/TheSocialCode" target="_blank"><div class="footer_socialicon email"></div></a>
                            <a href="https://patreon.com/thesocialcode" target="_blank"><div class="footer_socialicon patreon"></div></a>
                        </div>
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