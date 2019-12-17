<!doctype html>
<html>
<head>
    <title>CopyPaste.me - Easy device-to-device data transfer</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
            margin: 0;
            padding: 20px 0 0 0;
            background-color: #6FA8DC;
            text-align: center;
        }


        div.interface-intro {
            margin-left: auto;
            margin-right: auto;
            max-width: 600px;
            text-align: center;
        }

        div.interface-receiver {
            display: none;
        }

        div.interface-sender {
            display: none;
        }


        div.info-title {
            font-size: x-large;
            font-weight: bold;
            color: #ffffff;
            padding: 20px 0 0 0;
        }
        div.info-title a {
            text-decoration: none;
            color: #ffffff;
        }
        div.info-title a:hover {
            color: #1F588C;
        }
        div.info-subtitle {
            color: #1F588C;
            font-size: medium;
            padding: 10px 20px 30px 20px;
            width: 300px;
            margin-left: auto;
            margin-right: auto;

        }


        div.QR-holder {
            display: inline-block;
        }
        div.QRCodePlaceHolder {
            position: center;
            border-radius: 5px;
            background:#ffffff;
            padding: 15px 5px 5px 5px;

            box-shadow: 1px 3px 10px #1F588C;
            min-height: 210px;
            width: 210px;
        }
        div.QRCodePlaceHolder-label {
            text-align: center;
            font-weight: bold;
            font-size: large;
        }
        div.QRCodePlaceHolder-sublabel {
            text-align: center;
            font-size: smaller;
        }

        div.received_data {
            background-color: #ffffff;
            border-radius: 5px;
            display:flex;
            width: 100%;
            max-width: 600px;
            margin-top: 25px;
            margin-left: auto;
            margin-right: auto;
        }
        div.received_data_label {
            color: #1F588C;
            text-align: left;
            padding: 8px 0 8px 8px;
            background-color: #f5f5f5;
            border-radius: 5px;
            display: flex;
            width: 100%;
        }
        div.received_data_label_data {
            background-color: #ffffff;
            border-radius: 3px;
            border: #e5e5e5 1px solid;
            flex: auto;
        }
        input.data_input_password {
            padding: 12px 20px 12px 15px;
            border: 0;
            width: 100%;
            font-size: larger;
            outline: none;
        }

        div.received_data_menu {
            position: relative;
            display: block;
            flex: auto;
            padding: 9px 9px 9px 9px;
            text-align: right;
            background-color: #f5f5f5;
            border-radius: 5px;
        }
        div.received_data_button {
            display: inline-block;
            background-color: #1F588C;
            color: #ffffff;
            font-size: smaller;
            padding: 8px 12px 10px 12px;
            border-radius: 3px;
            cursor: pointer;
        }
        div.received_data_button:hover {
            display: inline-block;
            background-color: #000000;
        }
        div.tooltip-label {
            display: inline-block;
            background-color: #000000;
            color: #ffffff;
            font-size: smaller;
            padding: 8px 12px 10px 12px;
            border-radius: 5px;
        }

        div.tooltip {
            position: absolute;
            left: 50%;
            margin-left: -50%;
            margin-top: -40px;
            display: none;
            /*opacity: 1;*/
        }
        div.tooltip.tooltip-fade {
            transition: opacity 1750ms ease-in-out;
            opacity: 1;
        }

        div.tooltip-pointer {
            text-align: center;
            margin-top: -5px;
        }

        div.transferredData {
            display: none;
        }


        div.sender_input_password {
            min-width: 400px;
            margin-left: auto;
            margin-right: auto;
            max-width: 600px;
            text-align: center;
        }


    </style>
</head>
<body>

    <div class="interface-intro">
        <div class="info-title"><a href="/">CopyPaste.me</a></div>
        <div class="info-subtitle">
            Easily and securely transfer passwords <!--, texts, images and other docs -->from your phone to this device
        </div>
    </div>

    <div id="interface-receiver" class="interface-receiver">
        <div id="QR-holder" class="QR-holder">
            <div class="QRCodePlaceHolder">
                <div class="QRCodePlaceHolder-label">Scan me</div>
                <div class="QRCodePlaceHolder-sublabel">to connect your phone</div>
                <div id="QRCode"></div>
            </div>
        </div>

        <div id="transferredData" class="transferredData">
            <div class="received_data">
                <div class="received_data_label">
                    <div id="received_data_label_data" class="received_data_label_data" data-data=""></div>
                </div>
                <div class="received_data_menu">
                    <div id="tooltip" class="tooltip">
                        <div class="tooltip-label">Copied&nbsp;to&nbsp;clipboard!</div>
                        <div class="tooltip-pointer">
                            <svg width="14" height="10">
                                <polygon points="0,0 14,0 7,10 0,0" style="fill:#000000;"></polygon>
                            </svg>
                        </div>
                    </div>
                    <div id="received_data_button" class="received_data_button">Copy&nbsp;to&nbsp;clipboard</div>
                </div>
            </div>

        </div>
    </div>


    <div id="interface-sender" class="interface-sender">
        <div class="sender_input_password">
            <div>Enter password (tabs: password, image, doc, text</div>
            <div class="received_data">
                <div class="received_data_label">
                    <div id="received_data_label_data" class="received_data_label_data" data-data="">
                        <input id="data_input_password" class="data_input_password" type="text" />
                    </div>
                </div>
                <div class="received_data_menu">
                    <div id="button_input_password" class="received_data_button">Send</div>
                </div>
            </div>
        </div>
    </div>

    <script src="/static/js/CopyPaste.js"></script>
</body>
</html>