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

    <meta name="description" content="Easily and quickly share passwords, texts and files between devices.">
    <meta name="keywords" content="sharing, frictionless, passwords, tool, free">
    <meta property="og:title" content="Frictionless sharing" />
    <meta property="og:url" content="<?php echo $sURL ?>" />
    <meta property="og:description" content="Easily and quickly share passwords, texts and files between devices.">
    <meta property="og:image" content="<?php echo $sURL ?>/static/images/copypaste-preview.png">

    <link rel="stylesheet" type="text/css" href="/static/dist/<?php echo $manifest['main.css']; ?>">

</head>
<body>
    <div class="main-interface">

        <div class="main-interface-container">

            <div class="main-interface-header-background"></div>

            <div class="main-interface-header-content">

                <div class="logo">
                    <span class="logo-copypaste">CopyPaste</span><span class="logo-me">.me</span>
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

        <div class="main-interface-footer">
            Created by The Social Code - <a href="/faq">FAQ</a> - <a href="https://paypal.me/thesocialcode" target="_blank">Donate now</a>
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