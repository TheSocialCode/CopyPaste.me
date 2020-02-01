<?php

    // 1. register
    $sSection = strtolower($_SERVER['REQUEST_URI']);

    // 2. prepare
    $sProtocol = (isset($_SERVER['HTTPS']) && ($_SERVER['HTTPS'] == 'on' || $_SERVER['HTTPS'] == 1) || isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] == 'https') ? 'https://' : 'http://';

    // 3. build
    $sURL = $sProtocol.$_SERVER['HTTP_HOST'];

    // 4. load (ensures use of latest JS build)
    $manifest = json_decode(file_get_contents(dirname(__FILE__).'/static/js/manifest.json'), true);

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

            <div class="interface-header">

                <div class="logo">
                    <a href="/"><img data-mimoto-id="logo" src="/static/images/copypaste-logo-regular.png" width="200" alt="CopyPaste.me logo"></a>
                </div>
                <div class="description">Frictionless sharing between devices</div>

                <div data-mimoto-id="component_AlertMessage" class="component_AlertMessage"></div>

                <div class="warning_security_compromised">
                    <div class="warning_security_compromised_title">WARNING: Security compromised</div>
                    <p>It appears a third device tried to connect to your session.</p>
                    <p>Just to be sure, we shut it down.</p>
                    <p>Your data is safe!</p>
                    <br>
                    <p>To start a new session, <a href="/">reload</a> this page!</p>
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

            include(dirname(dirname(__FILE__)).'/src/pages/app.php');
            break;
    }

?>

        </div>
        <div class="main-interface-footer">
            Created by The Social Code - <a href="/faq">FAQ</a> - <a href="https://paypal.me/thesocialcode" target="_blank">Donate now</a>
        </div>
    </div>

    <script src="/static/js/<?php echo $manifest['main.js']; ?>"></script>
</body>
</html>