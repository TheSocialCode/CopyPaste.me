<!doctype html>
<html>
<head>
    <title>CopyPaste.me - Transfer data from device to device</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
            margin: 0;
            padding: 20px 0 0 0;
            background-color: #6FA8DC;
            text-align: center;
        }

        div.interface-receiver {
            display: none;
        }

        div.interface-sender {
            display: none;
        }

        div.interface {
            display: flex;
            margin-left:auto;
            margin-right:auto;
            width: 600px;
        }
        div.intro {
            flex: 400px;
            text-align: left;
            margin-right: 25px;
        }
        div.info-title {
            font-size: x-large;
            font-weight: bold;
            color: #ffffff;
            padding: 20px 0 20px 0;
        }
        div.info-title a {
            text-decoration: none;
            color: #ffffff;
        }
        div.info-title a:hover {
            color: #1F588C;
        }
        div.info {
            color: #000000;
            font-size: medium;
        }
        div.QR-holder {
            flex: 210px;
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
            width: 600px;
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
            padding: 12px 20px 12px 15px;
            border-radius: 3px;
            border: #e5e5e5 1px solid;
            flex: auto;
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

    </style>
</head>
<body>

    <div id="interface-receiver" class="interface-receiver">
        <div id="receiver-setup" class="interface">
            <div class="intro">
                <div class="info-title"><a href="/">CopyPaste.me</a></div>
                <div class="info">
                    Easily and quickly share passwords from device to device. Case study: in meeting -> need to login -> mail pw to self
                </div>
                <br>
                <br>
                <div id="copy_token" class="received_data_button"></div>
            </div>
            <div class="QR-holder">
                <div class="QRCodePlaceHolder">
                    <div class="QRCodePlaceHolder-label">Scan me</div>
                    <div class="QRCodePlaceHolder-sublabel">to connect your phone</div>
                    <div id="QRCodePlaceHolder"></div>
                </div>
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
        Sender interface
        <input id="data_input" type="text" /><div id="button_input" class="received_data_button">Send</div>
    </div>

<script src="/static/js/CopyPaste.js"></script>
</body>
</html>