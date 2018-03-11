$(document)
    .ready(function() {
        chat.init();
    });
var chat = {
    chatEventHeader: "[ccspChatEvent]",
    data: {
        lastID: 0
    }
};
// Init binds event listeners and sets up timers:
chat.init = function() {
    $('#chatLineHolder')
        .slimScroll({
            height: '400px',
            width: '90%'
        });

    if (!chatSDKGlobals.IsVideoEnabled) {
        $('.videoContainer').remove();
    }

    $('#name').defaultText('Your name');
    $('#subject').defaultText('');

    // Converting the #chatLineHolder div into a jScrollPane,
    // and saving the plugin's API in chat.data:
    // We use the working variable to prevent
    // multiple form submissions:
    var working = false;

    // Logging out a person in the chat:
    window.onbeforeunload = function(e) {
        var e = e || window.event;
        chatSDK.leaveChat();
        // For IE and Firefox
        if (e) {
            e.returnValue = '';
        }
        // For Chrome and Safari
        return '';
    };

    $("#connect").on("click",
        function() {
            if (working) return false;
            working = true;

            chatSDK.joinChat($('#name').val(), $('#subject').val(),
                function(success, result) {
                    working = false;
                    if (!success) {
                        chat.displayError(result.statusText);
                    } else
                        chat.login($('#name').val(), result.Connection_ID);
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

    //Submitting result of upload file
    $(document)
        .on("click",
            "#fireEventBtn",
            function() {
                var text = $('#eventText')
                    .val();
                if (text.length === 0) {
                    return false;
                }
                var eventName = "SC_ATTACHMENT"; //only as sample
                var optionalParameterArray = new Array();
                optionalParameterArray.push({
                    key: "SC_URL",
                    value: text
                });
                optionalParameterArray.push({
                    key: "SC_SECOND",
                    value: "FOR_TEST"
                });
                if (working) return false;
                working = true;
                var message = "Fire Event:" + eventName + " " + text;

                // Assigning a temporary ID to the chat:
                var tempID = 't' + Math.round(Math.random() * 1000000),
                    params = {
                        id: tempID,
                        author: chat.data.name,
                        author_type: 'me',
                        gravatar: chat.data.gravatar,
                        text: message.replace(/</g, '&lt;').replace(/>/g, '&gt;')
                    };

                // Using our addChatLine method to add the chat
                // to the screen immediately, without waiting for
                // the AJAX request to complete:
                chat.addChatLine($.extend({}, params));
                chatSDK.fireEvent(eventName,
                    optionalParameterArray,
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
            });
    // Submitting a new chat entry:
    $(document)
        .on("click",
            "#send",
            function() {
                //$('#submitForm').submit(function () {
                if (onkeyupTimer != null) {
                    window.clearTimeout(onkeyupTimer);
                    onkeyupTimer = null;
                }
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

    $('#uploadBTN')
        .on('click',
            function() {
                $('#fileUpload').click();
            });

    $('#fileUpload')
        .on('change',
            function(e) {
                var fd = new FormData();
                fd.append('file', e.currentTarget.files[0]);
                $.ajax({
                    url: '/SocialConnectorHelperAPI/api/helper/saveFile',
                    type: 'POST',
                    data: fd,
                    success: function(data) {
                        $('#eventText')
                            .val(data.FilePath);
                    },
                    cache: false,
                    contentType: false,
                    processData: false
                });
            });
};

// The login method hides displays the
// user's login data and shows the submit form
chat.login = function(name, gravatar) {
    chat.data.name = name;
    chat.data.gravatar = gravatar;
    $('#chatTopBar')
        .html(chat.render('loginTopBar', chat.data));
    $('#loginForm')
        .fadeOut(function() {
            $('#chatTopBar')
                .fadeIn();
            $('#chatLineHolder')
                .fadeIn();
            $('#submitForm')
                .fadeIn();
            $('#chatText')
                .focus();
            $('.chatContainer')
                .removeClass('hidden');
            $('.topWell')
                .removeClass('hidden');
        });
};

chat.disconnectButtonOnClick = function() {
    // Logging the user out:
    chatSDK.leaveChat(function(success, result) {
        working = false;
        if (success == false) {
            chat.displayError(result.statusText);
        } else {
            chat.Disconnect();
        }
    });
    return false;
};

// The render method generates the HTML markup 
// that is needed by the other methods:
chat.render = function(template, params) {
    var arr = [];
    switch (template) {
        case 'loginTopBar':
            arr = ['<strong class="name">', params.name, '</strong><button type="button" id="disconnectButton" onclick="chat.disconnectButtonOnClick();" class="btn pull-right btn-danger">Disconnect</button></strong>'];
            break;
        case 'chatLine':
            arr = ['<div class="clearfix">' + '<div class="message-data', (params.author_type == 'CCU' ? ' align-right ' : ' align-left '), params.author_type, ' chat-', params.id, '">' + '</span>' + '<span class="message-data-time">', params.time, '</span> ' + '<span class="message-data-name">', params.author, ':</span>' + '</div>', '<div class="message', (params.author_type == 'CCU' ? ' other-message float-right ' : ' my-message float-left '), '">', params.text, '</div></div>'];
            break;
        case 'user':
            arr = ['<div class="user" title="', params.name, '"><img src="',
                params.gravatar, '" width="30" height="30" onload="this.style.visibility=\'visible\'" /></div>'
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
    params.time = (d.getHours() < 10 ? '0' : '') + d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
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
};

// This method requests the latest chats
// (since lastID), and adds them to the page.
chat.getEvents = function(callback) {
    var bContinue = true;
    chatSDK.getEvents(function ChatMessage(result) {
        if (chat.isChatEvent(result)) {
            chat.handleChatEvent(result);
        } else if (chat.isVideoSession(result)) {
            chat.handleVideo(result);
        } else {
            chat.addChatLine(result);
        }
    }, function ChatStatus(result) {
        log.info(result.Status_Code + result.Status_Desc);
        if (result.Status_Code == "107") //disconnected
        {
            bContinue = false;
            chat.Disconnect();
        }
    }, function ChatDisconnect(strParticipant) {
        bContinue = false;
        chat.Disconnect();
        log.info(strParticipant + " disconnected.");
    }, function ChatError(errCode, result) {
        if (errCode != null && errCode != "") chat.displayError(errCode);
        else if (result != null) chat.displayError(result.statusText);
        else //no events
            chat.data.noActivity++;
    }, function AgentTyping(typingStatus){
		if (typingStatus === "1"){
			$('#agentTypingMessage').show();
			return;
		}
		else if (typingStatus === "2") {
			$('#agentTypingMessage').hide();
			return;
		}
		
		log.error('typingStatus ' + typingStatus + ' is not supported');
	});
    // Setting a timeout for the next request
    setTimeout(callback, chatSDKGlobals.DataGlobal.getEventsTimeoutMS);
};

// This method displays an error message on the top of the page:
chat.displayError = function(msg) {
    log.error(msg);
    var elem = $('<div>', {
        id: 'chatErrorMessage',
        html: msg
    });
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
        .appendTo('body')
        .slideDown();
};

chat.typingMessage = function(typing_status) {
    chatSDK.typingMessage(typing_status, function(success, result) {
        working = false;
        if (success == false) {
            chat.displayError("typingMessage stop -" + result.statusText);
        } else {
            //nothing
        }
    });
};

chat.Disconnect = function() {
    $('#chatTopBar > span')
        .fadeOut(function() {
            $('#disconnectButton')
                .remove();
        });
    $('#submitForm')
        .fadeOut(function() {
            $('#chatTopBar')
                .fadeOut();
            $('#chatLineHolder')
                .fadeOut();
            $('#chatLineHolder')
                .html('');
            $('#loginForm')
                .fadeIn();
            $('.chatContainer')
                .addClass('hidden');
            $('.topWell')
                .addClass('hidden');
            $('.videoContainer')
                .addClass('hidden');
        });
    //$('#chatStatus').html('<p class="count">' + 'Disconnected' + '</p>');
    log.info("Disconnected");
};

chat.isVideoSession = function(item) {
    //So far there is no way to understand if we've got a video session or just url...
    //That's the way we will go for now.
    if (!item.URL_Pushed || item.URL_Pushed.indexOf('.') !== -1 || item.URL_Pushed.indexOf('/') === -1) return false;
    return true;
};

chat.handleVideo = function(item) {
    if (!chat.isVideoSession(item)) return;
    var lastIndexOfSlash = item.URL_Pushed.lastIndexOf('/');
    var roomName = item.URL_Pushed.slice(lastIndexOfSlash + 1);
    document.getElementById("videoFrame")
        .src = 'https://' + window.location.hostname + window.location.pathname + 'video.html' + '?userName=' + chat.data.name + '&roomName=' + roomName;
    $('.videoContainer')
        .removeClass('hidden');
};

chat.isChatEvent = function(item) {
    return item && item.text && item.text.indexOf(chat.chatEventHeader) === 0;
};

chat.handleChatEvent = function(item) {
    if (!chat.isChatEvent(item)) return;
    var actualEventName = item.text.slice(chat.chatEventHeader.length);
    switch (actualEventName) {
        case "stoppedCoBrowsing":
            document.getElementById("videoFrame")
                .src = '';
            $('.videoContainer')
                .addClass('hidden');
    }
};


function toggleRegion(regionSelector, regionName, height) {
    var region = $(regionSelector);
    var btn = region.parent()
        .find('.toggleRegionButton');
    var textField = btn.find('span.toggleText');
    if (textField.text() === 'Hide ' + regionName) {
        textField.text('Show ' + regionName);
    } else {
        textField.text('Hide ' + regionName);
    }
    btn.find('span.toggleIcon')
        .toggleClass('glyphicon-chevron-down')
        .toggleClass('glyphicon-chevron-up');
    region.slideToggle(500);
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