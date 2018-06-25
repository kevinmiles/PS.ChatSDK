$(document)
    .ready(function() {
        chat.init();
    });
var chat = {
    chatEventHeader: "[ccspChatEvent]",
    data: {
        lastID: 0,
        currentCallID: undefined
    },
    linkifyOptions: {
        format: {
            url: function(value) {
                return value.length > 50 ? value.slice(0, 50) + '…' : value
            }
        },
        ignoreTags: [
            'script'
        ]
    }
};

var log = window.log || {
    info: function(m) { console.log(m); },
    error: function(m) { console.error(m); }
}

// Init binds event listeners and sets up timers:
chat.init = function() {
    $('#chatLineHolder')
        .slimScroll({
            height: '400px',
            width: '90%',
            color: '#ffffff'
        });

    $('#nameField').defaultText('Your name');
    $('#emailField').defaultText('');

	if(chatSDKGlobals.HasFirstName) {
		$('#nameField').val(chatSDKGlobals.JoinChatData.Calling_User_FirstName);
	}
	if(chatSDKGlobals.HasHardMessage) {
		$('#emailField').val(chatSDKGlobals.JoinChatData.Calling_User_HardMessage);
	}

    // Converting the #chatLineHolder div into a jScrollPane,
    // and saving the plugin's API in chat.data:
    // We use the working variable to prevent
    // multiple form submissions:
    var working = false;

    // Logging out a person in the chat:
    window.onbeforeunload = function(e) {
        var e = e || window.event;
        // For IE and Firefox
        if (e) {
            e.returnValue = (chatSDK.isNotConnected() ? undefined : '');
        }
        // For Chrome and Safari
        return (chatSDK.isNotConnected() ? undefined : '');
    };

    window.onunload = function(e) {
        chatSDK.leaveChat();
    };
	
    $("#connect").on("click",
        function() {
            if (working) return false;
            working = true;

            chatSDK.joinChat($('#nameField').val(), $('#emailField').val(),
                function(success, result) {
                    working = false;
                    if (!success) {
                        chat.displayError(result.statusText);
                    } else
                        chat.login($('#nameField').val(), result.Connection_ID);
                });
            return false;
        });

    var onkeyupTimer = null;
    $('#chatText').on('keyup',
        function(e) {
            if (onkeyupTimer != null) {
                window.clearTimeout(onkeyupTimer);
                onkeyupTimer = null;
            } else {
                chat.typingMessage(1);
            }
            onkeyupTimer = window.setTimeout(function() {
                    chat.typingMessage(2);
                    onkeyupTimer = null;
                },
                5000);

            if (e.keyCode === 13 && !e.shiftKey) {
                e.preventDefault();
                $('#send').click();
            }
        });

    // Submitting a new chat entry:
    $(document).off('click', "#send");
    $(document)
        .on("click",
            "#send",
            function() {
                //$('#submitForm').submit(function () {
                var text = $('#chatText')
                    .val();
                if (text.length === 0) {
                    return false;
                }
                if (working) return false;
                working = true;

                // Assigning a temporary ID to the chat:
                var tempID = 't' + Math.round(Math.random() * 1000000),
                    params = {
                        id: tempID,
                        author: chat.data.name,
                        author_type: 'me',
                        gravatar: chat.data.gravatar,
                        text: text.replace(/</g, '&lt;').replace(/>/g, '&gt;')
                    };

                // Using our addChatLine method to add the chat
                // to the screen immediately, without waiting for
                // the AJAX request to complete:
                chat.addChatLine($.extend({}, params));

                // Using our tzPOST wrapper method to send the chat
                // via a POST AJAX request:
                chatSDK.sendMessage(text,
                    function(success, result) {
                        working = false;
                        if (!success) {
                            $('div.chat-' + tempID).remove();
                            chat.displayError(result.statusText);
                        } else {
                            //remove not sent message
                            $('#chatText').val('');
                        }
                    });
                return false;
            });

    // Self executing timeout functions
    (function getEventsTimeoutFunction() {
        chat.getEvents(getEventsTimeoutFunction);
    })();

	if(chatSDKGlobals.AutoConnect) {
		$("#connect").trigger("click");
	}
};

// The login method hides displays the
// user's login data and shows the submit form
chat.login = function(name, gravatar) {
    chat.data.name = name;
    chat.data.gravatar = gravatar;
    $('#loginForm')
        .fadeOut(function() {
            $('#chatEndRow')
                .fadeIn();
            $('#chatLineHolder')
                .fadeIn();
            $('#submitForm')
                .fadeIn();
            $('#chatText')
                .focus();
        });
};
chat.disconnectButtonOnClick = function() {
    // Logging the user out:
    chatSDK.leaveChat(function(success, result) {
        if (success == false) {
            chat.displayError(result.statusText);
        }
        chat.Disconnect();
    });
    return false;
};
// The render method generates the HTML markup 
// that is needed by the other methods:
chat.render = function(template, params) {
    var renderMessage = function(params) {
        if (params.text !== "")
            return linkifyHtml($("<div />").html(params.text).text(), chat.linkifyOptions);
        return linkifyHtml(encodeURI(params.URL_Pushed), chat.linkifyOptions);
    };

    var arr = [];
    switch (template) {
        case 'chatLine':
            arr = [
                '<div class="row"><div class="col-xs-12 chatLine"><i>(',
                params.time,
                ')</i> <strong class="',
                params.author_type === 'me' ? 'highlight">' : '">',
                params.isSystemMessage ? '' : (params.author + ':'),
                '</strong> ',
                params.isSystemMessage ? '<i class="systemMessage">' : '',
                params.author_type === 'me' ? params.text : renderMessage(params),
                params.isSystemMessage ? '</i>' : '',
                '</div>'
            ];
            break;
    }
    // A single array join is faster than
    // multiple concatenations
    return arr.join('');
};
// The addChatLine method ads a chat entry to the page
chat.addChatLine = function(params) {
    // All times are displayed in the user's timezone
    var d = new Date();
    if (params.time) {
        // PHP returns the time in UTC (GMT). We use it to feed the date
        // object and later output it in the user's timezone. JavaScript
        // internally converts it for us.
        d.setUTCHours(params.time.hours, params.time.minutes);
    }
    params.time = d.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true });
    var markup = chat.render('chatLine', params),
        exists = $('#chatLineHolder .chat-' + params.id);
    if (exists.length) {
        exists.remove();
    }
    if (!chat.data.lastID) {
        // If this is the first chat, remove the
        // paragraph saying there aren't any:
        $('#chatLineHolder p')
            .remove();
    }
    $('#chatLineHolder')
        .append(markup);

    var bottomCoord = $('#chatLineHolder')[0].scrollHeight;
    $('#chatLineHolder').slimScroll({ scrollTo: bottomCoord });
};

chat.AddSystemMessage = function(message) {
    var params = {
        isSystemMessage: true,
        text: message.replace(/</g, '&lt;').replace(/>/g, '&gt;')
    };
    chat.addChatLine($.extend({}, params));
};

var onChatMessageReceived = function(result) {
    if (chat.isChatEvent(result)) {
        chat.handleChatEvent(result);
    } else {
        chat.addChatLine(result);
    }
};

var onChatStatusReceived = function(result) {
    var message;
    var status = chatSDKGlobals.StatusRes[result.Status_Code];
    if (status)
        message = status.messageForUser;

    if (result.Status_Code == "165") {
        message = message.replace('{timeToWait}', chatSDKGlobals["WaitingInQueue"][result.Additional_Information]);
        message = message.replace('{minutesToWait}', result.Estimated_Time);
    }
    if (result.Status_Code == "166") {
        chat.data.currentCallID = result.CallID;
        return;
    }
    if (result.Status_Code == "107") //disconnected
    {
        if (result.Additional_Information)
            message = message + ' Reason: ' + chatSDKGlobals["NoAgentForThisCall"][result.Additional_Information];

        bContinue = false;
        chat.Disconnect();
    }

    if (!message) {
        try {
            log.info('Unknown status received: ' + JSON.stringify(result));
        } catch (e) {
            log.error(e);
        }
        return;
    }

    chat.AddSystemMessage(message);
};

var onChatDisconnect = function(strParticipant) {
    bContinue = false;
    chat.Disconnect();
    chat.AddSystemMessage(chatSDKGlobals.ParticipantDisconnectedMessage.replace('{name}', strParticipant));
};

var onChatError = function(errCode, result) {
    if (errCode != null && errCode != "") chat.displayError(errCode);
    else if (result != null) chat.displayError(result.statusText);
};

var onAgentTyping = function(typingStatus) {
    if (typingStatus === "1") {
        $('#agentTypingMessage').show();
        return;
    } else if (typingStatus === "2") {
        $('#agentTypingMessage').hide();
        return;
    }

    log.error('typingStatus ' + typingStatus + ' is not supported');
};

// This method requests the latest chats
// (since lastID), and adds them to the page.
chat.getEvents = function(callback) {
    var bContinue = true;
    chatSDK.getEvents(onChatMessageReceived, onChatStatusReceived, onChatDisconnect, onChatError, onAgentTyping);
    // Setting a timeout for the next request
    setTimeout(callback, chatSDKGlobals.DataGlobal.getEventsTimeoutMS);
};
// This method displays an error message on the top of the page:
chat.displayError = function(msg) {
    var elem = $('<div>', {
        class: 'alert alert-warning alert-dismissible',
        html: msg
    });
    elem.append('<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>');
    elem.click(function() {
        $(this)
            .fadeOut(function() {
                $(this)
                    .remove();
            });
    });
    setTimeout(function() {
        elem.click();
    }, 5000);
    elem.hide()
        .appendTo('#errorLinesHolder')
        .slideDown();
};
chat.typingMessage = function(typing_status) {
    chatSDK.typingMessage(typing_status, function(success, result) {
        if (success == false) {
            chat.displayError("typingMessage stop -" + result.statusText);
        } else {
            //nothing
        }
    });
};
chat.Disconnect = function() {
    $('#chatEndRow')
        .fadeOut(function() {
            $('#disconnectButton')
                .remove();
        });
    $('#submitForm')
        .fadeOut(function() {
            $('#chatTopBar')
                .fadeOut();
            $('#loginForm')
                .fadeIn();
        });
    //$('#chatStatus').html('<p class="count">' + 'Disconnected' + '</p>');
};
chat.isChatEvent = function(item) {
    return item && item.text && item.text.indexOf(chat.chatEventHeader) === 0;
};
chat.handleChatEvent = function(item) {
    if (!chat.isChatEvent(item)) return;
};

chat.clearChat = function() {
    if (confirm('Do you really want to clear the chat? All conversation will be cleared!')) {
        $('#chatLineHolder')
            .html('');
    }
}

// A custom jQuery method for placeholder text:
$.fn.defaultText = function(value) {
    var element = this.eq(0);
    element.data('defaultText', value);
    element.focus(function() {
            if (element.val() == value) {
                element.val('')
                    .removeClass('defaultText');
            }
        })
        .blur(function() {
            if (element.val() == '' || element.val() == value) {
                element.addClass('defaultText')
                    .val(value);
            }
        });
    return element.blur();
}