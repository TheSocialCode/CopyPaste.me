<?php

    // 1. register
    $sSection = strtolower($_SERVER['REQUEST_URI']);

    // 2. prepare
    $sProtocol = (isset($_SERVER['HTTPS']) && ($_SERVER['HTTPS'] == 'on' || $_SERVER['HTTPS'] == 1) || isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] == 'https') ? 'https://' : 'http://';

    // 3. build
    $sURL = $sProtocol.$_SERVER['HTTP_HOST'];

    // 4. load (ensures use of latest JS build)
    $manifest = json_decode(file_get_contents(dirname(__FILE__).'/static/js/manifest.json'), true);
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

    <style nonce="<?php echo $config['csp']['nonce-css']; ?>">
        /* montserrat-regular - latin */
        @font-face {
            font-family: 'Montserrat';
            font-style: normal;
            font-weight: 400;
            src: url('/static/fonts/montserrat-v14-latin-regular.eot'); /* IE9 Compat Modes */
            src: local('Montserrat Regular'), local('Montserrat-Regular'),
            url('/static/fonts/montserrat-v14-latin-regular.eot?#iefix') format('embedded-opentype'), /* IE6-IE8 */
            url('/static/fonts/montserrat-v14-latin-regular.woff2') format('woff2'), /* Super Modern Browsers */
            url('/static/fonts/montserrat-v14-latin-regular.woff') format('woff'), /* Modern Browsers */
            url('/static/fonts/montserrat-v14-latin-regular.ttf') format('truetype'), /* Safari, Android, iOS */
            url('/static/fonts/montserrat-v14-latin-regular.svg#Montserrat') format('svg'); /* Legacy iOS */
        }
        /* montserrat-italic - latin */
        @font-face {
            font-family: 'Montserrat';
            font-style: italic;
            font-weight: 400;
            src: url('/static/fonts/montserrat-v14-latin-italic.eot'); /* IE9 Compat Modes */
            src: local('Montserrat Italic'), local('Montserrat-Italic'),
            url('/static/fonts/montserrat-v14-latin-italic.eot?#iefix') format('embedded-opentype'), /* IE6-IE8 */
            url('/static/fonts/montserrat-v14-latin-italic.woff2') format('woff2'), /* Super Modern Browsers */
            url('/static/fonts/montserrat-v14-latin-italic.woff') format('woff'), /* Modern Browsers */
            url('/static/fonts/montserrat-v14-latin-italic.ttf') format('truetype'), /* Safari, Android, iOS */
            url('/static/fonts/montserrat-v14-latin-italic.svg#Montserrat') format('svg'); /* Legacy iOS */
        }
        /* montserrat-700 - latin */
        @font-face {
            font-family: 'Montserrat';
            font-style: normal;
            font-weight: 700;
            src: url('/static/fonts/montserrat-v14-latin-700.eot'); /* IE9 Compat Modes */
            src: local('Montserrat Bold'), local('Montserrat-Bold'),
            url('/static/fonts/montserrat-v14-latin-700.eot?#iefix') format('embedded-opentype'), /* IE6-IE8 */
            url('/static/fonts/montserrat-v14-latin-700.woff2') format('woff2'), /* Super Modern Browsers */
            url('/static/fonts/montserrat-v14-latin-700.woff') format('woff'), /* Modern Browsers */
            url('/static/fonts/montserrat-v14-latin-700.ttf') format('truetype'), /* Safari, Android, iOS */
            url('/static/fonts/montserrat-v14-latin-700.svg#Montserrat') format('svg'); /* Legacy iOS */
        }
        /* montserrat-800 - latin */
        @font-face {
            font-family: 'Montserrat';
            font-style: normal;
            font-weight: 800;
            src: url('/static/fonts/montserrat-v14-latin-800.eot'); /* IE9 Compat Modes */
            src: local('Montserrat ExtraBold'), local('Montserrat-ExtraBold'),
            url('/static/fonts/montserrat-v14-latin-800.eot?#iefix') format('embedded-opentype'), /* IE6-IE8 */
            url('/static/fonts/montserrat-v14-latin-800.woff2') format('woff2'), /* Super Modern Browsers */
            url('/static/fonts/montserrat-v14-latin-800.woff') format('woff'), /* Modern Browsers */
            url('/static/fonts/montserrat-v14-latin-800.ttf') format('truetype'), /* Safari, Android, iOS */
            url('/static/fonts/montserrat-v14-latin-800.svg#Montserrat') format('svg'); /* Legacy iOS */
        }
    </style>

</head>
<style nonce="<?php echo $config['csp']['nonce-js']; ?>" data-mimoto-id="css-startup">

    body {
       visibility: hidden;
    }

</style>
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

                <div data-mimoto-id="component_AlertMessage" class="component_AlertMessage"></div>

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
    <script src="/static/js/<?php echo $manifest['main.js']; ?>"></script>
</body>
</html>