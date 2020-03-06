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
                <div class="component_QR_card_sublabel">to manually connect another device</div>
                <div data-mimoto-id="component_QR_manualurl" class="component_QR_manualurl show">
                    <div class="component_QR_manualurl_inner">
                        <div class="component_QR_manualurl_url"><span data-mimoto-id="connect_url">https://copypaste.me</span>/connect</div>
                        <div class="component_QR_manualurl_guidance">and enter<br>the following code:</div>
                        <div data-mimoto-id="manualcode" class="component_QR_manualurl_code"></div>
                        <div data-mimoto-id="countdown" class="component_QR_manualurl_validity">(valid for 2:40 minutes)</div>
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
                            <div class="sender_data_label_cover_label"><img class="sender_data_label_cover_label_indicator" src="static/images/waiting.svg">&nbsp;<span data-mimoto-id="progress">Encrypting data ...</span></div>
                        </div>
                        <div class="sender_data_label_data_input">
                            <input data-mimoto-id="data_input_password" class="data_input selected" type="password" placeholder="Enter password"/>
                            <input data-mimoto-id="data_input_url" class="data_input" type="text" placeholder="Enter URL"/>
                            <textarea data-mimoto-id="data_input_text" class="data_input" placeholder="Enter text"></textarea>
                            <div data-mimoto-id="data_input_image" class="data_input">
                                <div class="data_input_image">
                                    <div class="data_input_image_menu">
                                        <div data-mimoto-id="data_input_image_file_button" class="button">Select image</div>
                                        <input data-mimoto-id="data_input_image_file_inputfield" type="file" style="display:none;" accept='image/*' name="data_input_image_file"/>
                                    </div>
                                    <div data-mimoto-id="data_input_image_preview"
                                         class="data_input_image_preview">
                                        <div class="data_input_image_preview_imagecontainer">
                                            <img data-mimoto-id="data_input_image_preview_image" class="data_input_image_preview_image"/>
                                        </div>
                                        <div data-mimoto-id="data_input_image_preview_label" class="data_input_image_preview_label"></div>
                                    </div>
                                </div>
                            </div>
                            <div data-mimoto-id="data_input_document" class="data_input">
                                <div class="data_input_document">
                                    <div class="data_input_document_menu">
                                        <div data-mimoto-id="data_input_document_file_button" class="button">Select document</div>
                                        <input data-mimoto-id="data_input_document_file_inputfield" type="file" style="display:none;" name="data_input_document_file"/>
                                    </div>
                                    <div data-mimoto-id="data_input_document_preview" class="data_input_document_preview">
                                        <div data-mimoto-id="data_input_document_preview_label" class="data_input_document_preview_label"></div>
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
            <div class="sender_data_label_data_cover">
                <div class="sender_data_label_cover_internal"></div>
                <div class="sender_data_label_cover_label">Copied to clipboard!</div>
            </div>
            <div class="receiver_data_content">
                <div class="receiver_data_label">

                    <div data-mimoto-id="receiver_data_label_data" class="receiver_data_label_data"></div>
                </div>
                <div class="receiver_data_menu">
                    <div data-mimoto-id="receiver_data_button" class="button">Copy&nbsp;to&nbsp;clipboard</div>
                </div>
            </div>
            <div class="receiver_data_options">
                <span data-mimoto-id="receiver_data_option_clearnow" class="receiver_data_option">Clear now</span> |
                <span data-mimoto-id="receiver_data_option_extend" class="receiver_data_option">extend</span> |
                clears in <span data-mimoto-id="receiver_data_lifetime">2 mins 0 secs</span>
            </div>
        </div>
    </div>

</div>
