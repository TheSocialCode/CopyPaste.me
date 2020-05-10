<div data-mimoto-id="component_Client" class="component_Client">

    <!-- Connector -->

    <div data-mimoto-id="component_Connector" class="component_Connector">
        <div class="component_Connector_inner">

            <div data-mimoto-id="card_front" class="component_Connector_card component_Connector_card_front"></div>
            <div data-mimoto-id="card_back" class="component_Connector_card component_Connector_card_back"></div>

            <div data-mimoto-id="connectiontypes-container" class="component_Connector_connectiontypes_container">

                <!--- Scan -->
                <div data-mimoto-id="type_scan">
                    <div class="component_Connector_card_label">Scan me</div>
                    <div class="component_Connector_card_sublabel">to connect your phone</div>
                    <div data-mimoto-id="container" class="component_Connector_container"></div>
                </div>

                <!--- Manually -->
                <div data-mimoto-id="type_manually">
                    <div class="component_Connector_card_label">Use this URL</div>
                    <div class="component_Connector_card_sublabel">on the other device</div>
                    <div data-mimoto-id="instructions" class="component_Connector_instructions">
                        <div>
                            <div class="component_Connector_instructions_url"><a href="/connect" target="_blank"><span data-mimoto-id="connect_url">https://copypaste.me</span>/connect</a></div>
                            <div class="component_Connector_instructions_guidance">and enter<br>the following code:</div>
                            <div data-mimoto-id="code" class="component_Connector_instructions_code"></div>
                            <div data-mimoto-id="countdown" class="component_Connector_instructions_validity"></div>
                        </div>
                    </div>
                </div>

                <!--- Invite -->
                <div data-mimoto-id="type_invite">
                    <div data-mimoto-id="component_Connector_front_label" class="component_Connector_card_label">Send invite</div>
                    <div data-mimoto-id="component_Connector_front_sublabel" class="component_Connector_card_sublabel">
                        valid for <span data-mimoto-id="timetillexpiration" class="component_Connector_card_sublabel_invite_expirationlabel">x min</span> - <a data-mimoto-id="button-refreshtoken" class="">refresh</a>
                    </div>
                    <div data-mimoto-id="inviteoptions" class="component_Connector_sendinvite_container">
                        <div class="component_Connector_sendinvite_channels">
                            <div class="component_Connector_sendinvite_channel_row">
                                <div data-mimoto-id="button-whatsapp" class="component_Connector_sendinvite_channel" data-sharer="whatsapp" data-title="Let's exchange data privately and securely" data-url="https://copypaste.me">
                                    <div class="component_Connector_sendinvite_channel_name">
                                        <div class="component_Connector_sendinvite_channel_name_label">Whatsapp</div>
                                    </div>
                                    <div class="component_Connector_sendinvite_channel_icon whatsapp"></div>
                                </div>
                                <div data-mimoto-id="button-telegram" class="component_Connector_sendinvite_channel" data-sharer="telegram" data-title="Let's exchange data privately and securely" data-url="https://copypaste.me">
                                    <div class="component_Connector_sendinvite_channel_name">
                                        <div class="component_Connector_sendinvite_channel_name_label">Telegram</div>
                                    </div>
                                    <div class="component_Connector_sendinvite_channel_icon telegram"></div>
                                </div>
                            </div>
                            <div class="component_Connector_sendinvite_channel_row">
                                <div data-mimoto-id="button-email" class="component_Connector_sendinvite_channel" data-sharer="email" data-title="Let's exchange data privately and securely" data-url="https://copypaste.me" data-subject="Let's exchange data securely" data-to="">

                                    <div class="component_Connector_sendinvite_channel_name">
                                        <div class="component_Connector_sendinvite_channel_name_label">Email</div>
                                    </div>
                                    <div class="component_Connector_sendinvite_channel_icon email"></div>
                                </div>
                                <div data-mimoto-id="button-copylink" class="component_Connector_sendinvite_channel">
                                    <div class="component_Connector_sendinvite_channel_name">
                                        <div class="component_Connector_sendinvite_channel_name_label">Copy link</div>
                                    </div>
                                    <div class="component_Connector_sendinvite_channel_icon copylink"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div data-mimoto-id="button-toggleconnectionview" class="component_Connector_button_toggleconnectionview">
                        <div data-mimoto-id="notification-copiedtoclipboard">Copied to clipboard!</div>
                    </div>
                </div>

            </div>
        </div>

        <!-- Menu connection type -->

        <div data-mimoto-id="component_MenuConnectionType" class="component_MenuConnectionType">
            <div data-mimoto-id="arrow" class="component_MenuConnectionType_arrowcontainer">
                <div class="component_MenuConnectionType_arrow">
                    <svg width="14px" height="10px"><polygon points="7,0 14,10 0,10" /></svg>
                </div>
            </div>
            <div data-mimoto-id="button-container" class="component_MenuConnectionType_buttons">
                <div data-mimoto-id="button-scan" class="component_MenuConnectionType_button selected">Scan</div>
                <div data-mimoto-id="button-manually" class="component_MenuConnectionType_button">Manually</div>
                <div data-mimoto-id="button-invite" class="component_MenuConnectionType_button">Invite</div>
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
                            <div class="sender_data_label_cover_label"><span data-mimoto-id="indicator" class="component_SharedData_cover_indicator"><img class="sender_data_label_cover_label_indicator" src="static/images/waiting.svg">&nbsp;</span><span data-mimoto-id="coverlabel">Receiving data ...</span></div>
                        </div>
                        <div data-mimoto-id="receiver_data_label_data" class="component_SharedData_data_label"></div>
                    </div>
                </div>
                <div class="receiver_data_menu">
                    <div data-mimoto-id="receiver_data_button" class="button">Copy&nbsp;to&nbsp;clipboard</div>
                </div>
            </div>
            <div class="receiver_data_options">
                <div data-mimoto-id="optionsmenu" class="component_SharedData_optionsmenu">
                    Clears in <span data-mimoto-id="receiver_data_lifetime" class="component_SharedData_expires">2 mins 0 secs</span> -
                    <a data-mimoto-id="receiver_data_option_extend" class="receiver_data_option">extend</a> -
                    <a data-mimoto-id="receiver_data_option_clearnow" class="receiver_data_option">clear now</a> -
                    Please <a href="#support" target="_blank" class="component_SharedData_donate">donate</a> <span class="module_SharedData_donate_heart">♥</span>
                </div>
                <div data-mimoto-id="donate" class="component_SharedData_donate">
                    Help keeping this project free for all. Please <a href="#support" target="_blank" class="component_SharedData_donate">donate</a> <span class="module_SharedData_donate_heart">♥</span>
                </div>
            </div>
        </div>
    </div>

</div>
