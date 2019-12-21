<!doctype html>
<html>
<head>
    <title>CopyPaste.me - Easy device-to-device data transfer</title>
</head>
<style>

    body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        margin: 0;
        padding: 20px 0 0 30px;
        background-color: #6FA8DC;
        text-align: center;
    }

    div {
        box-sizing : border-box;
    }

    div.interface-intro {
        margin-left: auto;
        margin-right: auto;
        max-width: 600px;
        text-align: center;
        margin-bottom: 25px;
    }

    div.waiting {
        margin-left: auto;
        margin-right: auto;
        max-width: 600px;
        text-align: center;
        display: none;
        font-size: medium;
    }

    div.waiting div.label {
        color: #1F588C;
        line-height: 24px;
        padding: 20px;
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
        padding: 10px 20px 10px 20px;
        width: 400px;
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



    /* --- general --- */


    div.templates {
        display:none;
    }

    div.button {
        display: inline-block;
        background-color: #1F588C;
        color: #ffffff;
        font-size: smaller;
        padding: 8px 12px 10px 12px;
        border-radius: 3px;
        cursor: pointer;
    }
    div.button:hover {
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



    /* --- receiver --- */


    div.interface-receiver {
        display: none;
        width: 100%;
        max-width: 600px;
        padding: 0 20px 0 20px;
    }

    div.receiver_data_container {
        display: none;
    }

    div.receiver_data_container > div {
        margin-bottom: 10px;
    }

    div.receiver_data {
        background-color: #ffffff;
        border-radius: 5px;
        display:flex;

        min-width: 400px;
        margin-left: auto;
        margin-right: auto;
        max-width: 600px;
        text-align: center;
    }

    div.receiver_data_menu {
        position: relative;
        display: block;
        flex: auto;
        padding: 9px 9px 9px 9px;
        text-align: right;
        background-color: #f5f5f5;
        border-radius: 5px;
    }

    div.receiver_data_label {
        color: #1F588C;
        text-align: left;
        padding: 8px 0 8px 8px;
        background-color: #f5f5f5;
        border-radius: 5px;
        width: 100%;
    }

    div.receiver_data_label_data {
        background-color: #ffffff;
        border-radius: 3px;
        border: #e5e5e5 1px solid;
        padding: 12px 20px 12px 15px;
        width: 100%;
        font-size: larger;
    }

    div.receiver_data_options {
        margin-top: 7px;
        margin-left: 6px;
        font-size: smaller;
        color: #999999;
        font-style: italic;
    }

    span.receiver_data_option {
        text-decoration: none;
        cursor: pointer;
    }

    span.receiver_data_option:hover {
        text-decoration: underline;
        cursor: pointer;
        color: #1F588C;
    }




    /* --- sender --- */


    div.interface-sender {
        display: none;
        width: 100%;
        max-width: 600px;
        padding: 0 20px 0 20px;
    }

    div.sender_input {
        min-width: 400px;
        margin-left: auto;
        margin-right: auto;
        max-width: 600px;
        text-align: center;
    }

    div.sender_menu {
        width: 100%;
        padding: 0 10px 0 10px;
        display: table;
    }

    div.sender_menu > div {
        margin-right: 5px;

    }

    div.sender_menu_tab {
        background-color: #e5e5e5;
        display: inline-block;
        border-radius: 5px 5px 0 0;
        padding: 8px 12px 8px 12px;
        font-size: smaller;
        color: #999999;
        cursor: pointer;
        box-shadow: inset 0 -6px 6px -6px #858585;
    }

    div.sender_menu_tab:hover {
        color: #ffffff;
        background-color: #1F588C;
    }

    div.sender_menu_tab.selected {
        background-color: #f5f5f5;
        cursor: default;
        box-shadow: none;
        color: #1F588C;
    }

    div.sender_menu_tab.selected:hover {
        color: #1F588C;
    }

    div.sender_data {
        background-color: #ffffff;
        border-radius: 5px;
        display:flex;
    }

    div.sender_data_label {
        color: #1F588C;
        text-align: left;
        padding: 8px 0 8px 8px;
        background-color: #f5f5f5;
        border-radius: 5px;
        display: flex;
        width: 100%;
    }
    div.sender_data_label_data {
        background-color: #ffffff;
        border-radius: 3px;
        border: #e5e5e5 1px solid;
        flex: auto;
    }
    div.sender_data_menu {
        position: relative;
        display: block;
        flex: auto;
        padding: 9px 9px 9px 9px;
        text-align: right;
        background-color: #f5f5f5;
        border-radius: 5px;
    }



    input.data_input {
        padding: 12px 20px 12px 15px;
        border: 0;
        width: 100%;
        font-size: larger;
        outline: none;
        box-sizing : border-box;
        display: none;
    }

    input.data_input::placeholder {
        font-style: italic;
        color: #858585;
    }

    textarea.data_input {
        padding: 12px 20px 12px 15px;
        border: 0;
        width: 100%;
        font-size: larger;
        outline: none;
        resize: none;
        box-sizing : border-box;
        height: 200px;
        display: none;
    }

    textarea.data_input::placeholder {
        font-style: italic;
        color: #858585;
    }

    div.data_input {
        padding: 12px 20px 12px 15px;
        width: 100%;
        font-size: larger;
        display: none;
    }

    input.data_input.selected, textarea.data_input.selected, div.data_input.selected {
        display: block;
    }

</style>
<body>

    <div class="interface-intro">
        <div class="info-title"><a href="/">CopyPaste.me</a></div>
        <div class="info-subtitle">Frictionless sharing between devices<!-- Easily and securely transfer passwords from your phone to this device --></div>
    </div>

    <div id="interface-receiver" class="interface-receiver">

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


    <div id="interface-sender" class="interface-sender">
        <div class="sender_input">
            <div id="sender_menu" class="sender_menu">
                <div data-type="password" class="sender_menu_tab selected">Password</div>
                <div data-type="url" class="sender_menu_tab">URL</div>
                <div data-type="text" class="sender_menu_tab">Text</div>
                <div data-type="image" class="sender_menu_tab">Image</div>
                <div data-type="document" class="sender_menu_tab">Document</div>
            </div>
            <div class="sender_data">
                <div class="sender_data_label">
                    <div class="sender_data_label_data" data-data="">
                        <input id="data_input_password" class="data_input selected" type="password" placeholder="Enter password" />
                        <input id="data_input_url" class="data_input" type="text" placeholder="Enter URL" />
                        <textarea id="data_input_text" class="data_input" placeholder="Enter text"></textarea>
                        <div id="data_input_image" class="data_input">
                            <div class="button" onclick="document.getElementById('data_input_image_file').click();">Select image</div>
                            <input type="file" style="display:none;" id="data_input_image_file" name="data_input_image_file"/>
                        </div>
                        <div id="data_input_document" class="data_input">
                            <div class="button" onclick="document.getElementById('data_input_document_file').click();">Select document</div>
                            <input type="file" style="display:none;" id="data_input_document_file" name="data_input_image_document"/>
                        </div>
                    </div>
                </div>
                <div class="sender_data_menu">
                    <div id="button_input_password" class="button">Send</div>
                </div>
            </div>
        </div>
    </div>


    <!-- General -->

    <div id="templates" class="templates">


        <!-- template: data -->

        <div id="template-data" class="receiver_data">
            <div class="receiver_data_label">
                <div id="receiver_data_label_data" class="receiver_data_label_data" data-data=""></div>
                <div class="receiver_data_options">
                    <span data-mimoto-id="receiver_data_option_clearnow" class="receiver_data_option">Clear now</span> |
                    <span data-mimoto-id="receiver_data_option_extend" class="receiver_data_option">extend</span> |
                    clears in <span data-mimoto-id="receiver_data_lifetime">5 mins</span>
                </div>
            </div>
            <div class="receiver_data_menu">
                <div id="receiver_data_button" class="button">Copy&nbsp;to&nbsp;clipboard</div>
            </div>
        </div>


        <!-- template: tooltip -->

        <div id="tooltip" class="tooltip">
            <div class="tooltip-label">Copied&nbsp;to&nbsp;clipboard!</div>
            <div class="tooltip-pointer">
                <svg width="14" height="10">
                    <polygon points="0,0 14,0 7,10 0,0" style="fill:#000000;"></polygon>
                </svg>
            </div>
        </div>

    </div>


    <script src="/static/js/CopyPaste.js"></script>
</body>
</html>