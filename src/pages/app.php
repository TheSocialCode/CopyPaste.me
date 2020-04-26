<div data-mimoto-id="component_Client" class="component_Client">

    <!-- QR code -->

    <div data-mimoto-id="component_QR" class="component_QR">
        <div class="component_QR_inner">
            <div data-mimoto-id="component_QR_front" class="component_QR_card component_QR_card_front">
                <div class="component_QR_card_label">Scan me</div>
                <div class="component_QR_card_sublabel">to connect your phone</div>
                <div data-mimoto-id="component_QR_container"></div>
            </div>
            <div data-mimoto-id="component_QR_back" class="component_QR_card component_QR_card_back">
                <div class="component_QR_card_label">Use this URL</div>
                <div class="component_QR_card_sublabel">on the other device</div>
                <div data-mimoto-id="component_QR_manualurl" class="component_QR_manualurl show">
                    <div class="component_QR_manualurl_inner">
                        <div class="component_QR_manualurl_url"><a href="/connect" target="_blank"><span data-mimoto-id="connect_url">https://copypaste.me</span>/connect</a></div>
                        <div class="component_QR_manualurl_guidance">and enter<br>the following code:</div>
                        <div data-mimoto-id="manualcode" class="component_QR_manualurl_code"></div>
                        <div data-mimoto-id="countdown" class="component_QR_manualurl_validity"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Manual connect button -->

        <div data-mimoto-id="component_ManualConnectButton" class="component_ManualConnectButton">
            <div data-mimoto-id="button" class="module_ToggleButton">
                <span class="module_ToggleButton_manually">Connect manually</span>
                <span class="module_ToggleButton_qr">Connect by QR</span>
            </div>
        </div>
    </div>


    <!-- Manual connect -->

    <div data-mimoto-id="component_ManualConnectInput" class="component_ManualConnectInput">
        <div data-mimoto-id="title" class="component_ManualConnectInput_label">Enter your code</div>
        <div data-mimoto-id="subtitle" class="component_ManualConnectInput_sublabel">to manually connect</div>
        <div data-mimoto-id="manualcodeinput" class="component_ManualConnectInput_input">
            <div class="component_ManualConnectInput_code">
                <input data-mimoto-id="char1" type="text" class="component_ManualConnectInput_character">
                <input data-mimoto-id="char2" type="text" class="component_ManualConnectInput_character">
                <input data-mimoto-id="char3" type="text" class="component_ManualConnectInput_character">
                -
                <input data-mimoto-id="char4" type="text" class="component_ManualConnectInput_character">
                <input data-mimoto-id="char5" type="text" class="component_ManualConnectInput_character">
                <input data-mimoto-id="char6" type="text" class="component_ManualConnectInput_character">
            </div>
            <div data-mimoto-id="message" class="component_ManualConnectInput_message"></div>
            <div data-mimoto-id="button" class="button component_ManualConnectInput_button muted">Connect</div>
        </div>
    </div>


    <!-- Manual connect - control code-->

    <div data-mimoto-id="component_ManualConnectHandshake" class="component_ManualConnectHandshake">
        <div data-mimoto-id="title" class="component_ManualConnectHandshake_label">Check this code</div>
        <div data-mimoto-id="subtitle" class="component_ManualConnectHandshake_sublabel">it should be the same on the other device</div>
        <div class="component_ManualConnectHandshake_characters">
            <span data-mimoto-id="char1" class="component_ManualConnectHandshake_character">1</span>
            <span data-mimoto-id="char2" class="component_ManualConnectHandshake_character">2</span>
            <span data-mimoto-id="char3" class="component_ManualConnectHandshake_character">3</span>
            <span data-mimoto-id="char4" class="component_ManualConnectHandshake_character">4</span>
        </div>
        <div data-mimoto-id="button" class="button component_ManualConnectHandshake_button">Connect now!</div>
    </div>


    <!-- Data input -->

    <div data-mimoto-id="component_DataInput" class="component_DataInput unlocked">
        <div class="sender_input">
            <div id="sender_menu" class="sender_menu">
                <div data-type="password" class="sender_menu_tab selected">Password</div>
                <div data-type="text" class="sender_menu_tab">Text</div>
                <div data-type="file" class="sender_menu_tab">File</div>
            </div>
            <div class="sender_data">
                <div class="sender_data_label">
                    <div data-mimoto-id="sender_data_label_data" class="sender_data_label_data">
                        <div class="sender_data_label_data_cover">
                            <div class="sender_data_label_cover_internal"></div>
                            <div class="sender_data_label_cover_label"><img class="sender_data_label_cover_label_indicator" src="static/images/waiting.svg">&nbsp;<span data-mimoto-id="progress">Encrypting data ...</span></div>
                        </div>
                        <div class="sender_data_label_data_input">
                            <input data-mimoto-id="data_input_password" class="data_input selected" type="password" placeholder="Enter password"/>
                            <textarea data-mimoto-id="data_input_text" class="data_input" placeholder="Enter text"></textarea>
                            <div data-mimoto-id="data_input_file" class="data_input">
                                <div class="data_input_file">
                                    <div class="data_input_file_menu">
                                        <div data-mimoto-id="data_input_file_button" class="button">Select file</div>
                                        <input data-mimoto-id="data_input_file_inputfield" class="data_input_file_inputfield" type="file" name="data_input_file"/>
                                    </div>
                                    <div data-mimoto-id="data_input_file_preview" class="data_input_file_preview">
                                        <div data-mimoto-id="data_input_file_preview_label" class="data_input_file_preview_label"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="sender_data_menu">
                    <div data-mimoto-id="button_input_send" class="button disabled">Send</div>
                </div>
            </div>
        </div>
    </div>


    <!-- Data output -->

    <div data-mimoto-id="component_DataOutput" class="component_DataOutput">
        <div data-mimoto-id="component_DataOutput_container"></div>
        <div data-mimoto-id="component_ClearClipboard" class="component_ClearClipboard">
            <div class="component_ClearClipboard_content">
                <div class="component_ClearClipboard_content_message"><b>STAY SAFE</b> - This is a not-so-subtle reminder to clear your clipboard after you copied sensitive data to it.</div>
                <div class="component_ClearClipboard_content_input">
                    <div data-mimoto-id="button_clear" class="button">Clear clipboard now!</div>
                </div>
            </div>
        </div>
    </div>


    <!-- Waiting for sender to connect -->

    <div data-mimoto-id="component_Waiting" class="component_Waiting">
        <div class="component_Waiting_label">Sender device connected<br>Waiting for data!</div>
        <img src="static/images/waiting.svg">
    </div>


    <!-- Toggle direction button -->

    <div data-mimoto-id="component_ToggleDirectionButton" class="component_ToggleDirectionButton">
        <div data-mimoto-id="button" class="module_ToggleButton">Share from here</div>
    </div>

</div>


<!-- General -->

<div id="templates" class="templates">


    <!-- template: data -->

    <div id="template-data" class="receiver_data">
        <div class="receiver_data_placeholder_container">
            <div data-mimoto-id="placeholder" class="receiver_data_placeholder"></div>
        </div>
        <div data-mimoto-id="content" class="receiver_data_content_container">
            <div class="receiver_data_content">
                <div class="receiver_data_label">
                    <div class="receiver_data_label_data">
                        <div class="sender_data_label_data_cover">
                            <div class="sender_data_label_cover_internal"></div>
                            <div class="sender_data_label_cover_label"><img class="sender_data_label_cover_label_indicator" src="static/images/waiting.svg">&nbsp;<span data-mimoto-id="coverlabel">Receiving data ...</span></div>
                        </div>
                        <div data-mimoto-id="receiver_data_label_data" class="module_SharedData_data_label"></div>
                    </div>
                </div>
                <div class="receiver_data_menu">
                    <div data-mimoto-id="receiver_data_button" class="button">Copy&nbsp;to&nbsp;clipboard</div>
                </div>
            </div>
            <div class="receiver_data_options">
                <div data-mimoto-id="optionsmenu" class="component_SharedData_optionsmenu">
                    <span data-mimoto-id="receiver_data_option_clearnow" class="receiver_data_option">Clear now</span> |
                    <span data-mimoto-id="receiver_data_option_extend" class="receiver_data_option">extend</span> |
                    clears in <span data-mimoto-id="receiver_data_lifetime">2 mins 0 secs</span>
                    - Please <a href="#support" target="_blank" class="component_SharedData_donate">donate</a> <span class="module_SharedData_donate_heart">♥</span>
                </div>
                <div data-mimoto-id="donate" class="component_SharedData_donate">
                    Help keeping this project free for all. Please <a href="#support" target="_blank" class="component_SharedData_donate">donate</a> <span class="module_SharedData_donate_heart">♥</span>
                </div>
            </div>
        </div>
    </div>

</div>
