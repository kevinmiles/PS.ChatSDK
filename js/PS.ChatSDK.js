var chatSDK = {
	isNotConnected: function() {
		return (chatSDKGlobals.DataGlobal.connId === -1);
	},
	getEvents: function(guiCallbackFunctionChatMessage,
	                    guiCallbackFunctionChatStatus,
	                    guiCallbackFunctionChatDisconnect,
	                    guiCallbackFunctionChatError,
						guiCallbackFunctionAgentTyping) {

		if (chatSDK.isNotConnected())
			return guiCallbackFunctionChatError(null, null);

		var url = chatSDKGlobals.DataGlobal.CCUServerAddress +
			"/scripts/ChatExtension.DLL?command=getevents&Connection_ID=" +
			chatSDKGlobals.DataGlobal.connId +
			"&Last_Event_ID=" +
			chatSDKGlobals.DataGlobal.lastEventId;

		$.ajax({
				url: url,
				type: 'GET',
				cache: false,
				contentType: 'application/json; charset=utf-8',
				dataType: 'json'
			})
			.done(function(res) {
				if (!res.Events) {
					if (guiCallbackFunctionChatError instanceof Function)									
						guiCallbackFunctionChatError(null, null);
					else
						console.error('guiCallbackFunctionChatError is not a function.');	
					
					return;
				}
				$.each(res.Events,
					function(i, item) {
						chatSDKGlobals.DataGlobal.lastEventId = item.Event_ID;
						switch (item.Command) {
							case "read":
							{
								var chatResult = {
									id: item.Event_ID,
									author: item.Participant_Name,
									author_type: 'CCU',
									gravatar: 'CCU',
									text: item.Message_Text.replace(/</g, '&lt;').replace(/>/g, '&gt;'),
									URL_Pushed: item.URL_Pushed,
									Additional_Information: item.Additional_Information
								};
								
								if (guiCallbackFunctionChatMessage instanceof Function)									
									guiCallbackFunctionChatMessage(chatResult);
								else
									console.error('guiCallbackFunctionChatMessage is not a function.');
								
								break;
							}
							case "status":
							{
								if (item.Status_Code == 107)
									chatSDKGlobals.DataGlobal.connId = -1;
								
								var statusDesc = '';
								var status = chatSDKGlobals.StatusRes[item.Status_Code];
								if (status)
										statusDesc = status.description;

								var chatResult = {
									id: item.Event_ID,
									Status_Code: item.Status_Code,
									Estimated_Time: item.Estimated_Time,
									Status_Desc: statusDesc.replace(/</g, '&lt;').replace(/>/g, '&gt;'),
									Additional_Information: item.Additional_Information
								};
								
								if (guiCallbackFunctionChatStatus instanceof Function)									
									guiCallbackFunctionChatStatus(chatResult);
								else
									console.error('guiCallbackFunctionChatStatus is not a function.');						

								break;
							}
							case "ParticipantDisconnected":
							{
								chatSDKGlobals.DataGlobal.connId = -1;
								if (guiCallbackFunctionChatDisconnect instanceof Function)									
									guiCallbackFunctionChatDisconnect(item.Participant_Name);
								else
									console.error('guiCallbackFunctionChatDisconnect is not a function.');						
																
								break;
							}
							case "typingStatus": 
							{
								if (guiCallbackFunctionAgentTyping instanceof Function)									
									guiCallbackFunctionAgentTyping(item.Message_Text);
								else
									console.error('guiCallbackFunctionAgentTyping is not a function.');								
							}
							case "Error":
							{
								if (guiCallbackFunctionChatError instanceof Function)									
									guiCallbackFunctionChatError(item.Error_Code, null);
								else
									console.error('guiCallbackFunctionChatError is not a function.');								
								
								break;
							}
						}
					});
			})
			.fail(function(jqXhr, textStatus) {
				guiCallbackFunctionChatError(textStatus, jqXhr);
			});
	},
	joinChat: function(strUserName, strUserSubject, guiCallbackFunction) {
		var opt1 = chatSDKGlobals.OptionalParameter;
		opt1.key = "PSChatSDK";
		opt1.value = "true";
		var optionalParameterArray = new Array();
		optionalParameterArray.push(opt1);
		optionalParameterArray = optionalParameterArray.concat(chatSDKGlobals.QueryOptionalParameters);
		chatSDKGlobals.JoinChatData.OptionalParameterCount = optionalParameterArray;
		chatSDKGlobals.JoinChatData.Calling_User_FirstName = strUserName;
		chatSDKGlobals.JoinChatData.Calling_User_HardMessage = strUserSubject;
		$.ajax({
				url: chatSDKGlobals.DataGlobal.CCUServerAddress + "/scripts/ChatExtension.DLL?joinchat",
				cache: false,
				type: 'POST',
				data: JSON.stringify(chatSDKGlobals.JoinChatData),
				contentType: 'application/json; charset=utf-8',
				dataType: 'json'
			})
			.done(function(res) {
				chatSDKGlobals.DataGlobal.connId = res.Connection_ID;
				chatSDKGlobals.DataGlobal.lastEventId = 0;
				guiCallbackFunction(true, res);
			})
			.fail(function(jqXhr) {
				guiCallbackFunction(false, jqXhr);
			});
	},
	typingMessage: function(nTypingStatus, guiCallbackFunction) {
		if (chatSDK.isNotConnected())
			return false;
		chatSDKGlobals.TypingMessageData.Connection_ID = chatSDKGlobals.DataGlobal.connId;
		chatSDKGlobals.TypingMessageData.typing_status = nTypingStatus;
		$.ajax({
				url: chatSDKGlobals.DataGlobal.CCUServerAddress + "/scripts/ChatExtension.DLL?typingmsg",
				cache: false,
				type: 'POST',
				data: JSON.stringify(chatSDKGlobals.TypingMessageData),
				contentType: 'application/json; charset=utf-8',
				dataType: 'json'
			})
			.done(function(res) {
				guiCallbackFunction(true, res);
			})
			.fail(function(jqXhr) {
				jqXhr.statusText === "OK" ? guiCallbackFunction(true, jqXhr) : guiCallbackFunction(false, jqXhr);
			});
	},
	sendMessage: function(strText, guiCallbackFunction) {
		if (chatSDK.isNotConnected())
			return false;
		chatSDKGlobals.SendMessageData.Connection_ID = chatSDKGlobals.DataGlobal.connId;
		chatSDKGlobals.SendMessageData.Message_Text = strText;
		$.ajax({
				url: chatSDKGlobals.DataGlobal.CCUServerAddress + "/scripts/ChatExtension.DLL?sendmsg",
				cache: false,
				type: 'POST',
				data: JSON.stringify(chatSDKGlobals.SendMessageData),
				contentType: 'application/json; charset=utf-8',
				dataType: 'json'
			})
			.done(function(res) {
				guiCallbackFunction(true, res);
			})
			.fail(function(jqXhr) {
				jqXhr.statusText === "OK" ? guiCallbackFunction(true, jqXhr) : guiCallbackFunction(false, jqXhr);
			});
	},
	fireEvent: function(strEventName, optionalParameterArray, guiCallbackFunction) {
		if (chatSDK.isNotConnected())
			return false;
		chatSDKGlobals.FireEventData.Connection_ID = chatSDKGlobals.DataGlobal.connId;
		chatSDKGlobals.FireEventData.Fire_Event_Name = strEventName;
		chatSDKGlobals.FireEventData.OptionalParameterCount = optionalParameterArray;
		$.ajax({
				url: chatSDKGlobals.DataGlobal.CCUServerAddress + "/scripts/ChatExtension.DLL?fireevent",
				cache: false,
				type: 'POST',
				data: JSON.stringify(chatSDKGlobals.FireEventData),
				contentType: 'application/json; charset=utf-8',
				dataType: 'json'
			})
			.done(function(res) {
				guiCallbackFunction(true, res);
			})
			.fail(function(jqXhr) {
				jqXhr.statusText === "OK" ? guiCallbackFunction(true, jqXhr) : guiCallbackFunction(false, jqXhr);
			});
	},
	leaveChat: function(guiCallbackFunction) {
		if (chatSDK.isNotConnected())
			return false;
		chatSDKGlobals.LeaveChatData.Connection_ID = chatSDKGlobals.DataGlobal.connId;
		$.ajax({
				url: chatSDKGlobals.DataGlobal.CCUServerAddress + "/scripts/ChatExtension.DLL?leavechat",
				cache: false,
				type: 'POST',
				data: JSON.stringify(chatSDKGlobals.LeaveChatData),
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				async: guiCallbackFunction !== undefined,
			})
			.done(function(res) {
				chatSDK.initGlobals();
				if (guiCallbackFunction) guiCallbackFunction(true, res);
			})
			.fail(function(jqXhr) {
				if (jqXhr.statusText === "OK") {
					chatSDK.initGlobals();
					if (guiCallbackFunction) guiCallbackFunction(true, jqXhr);
				} else if (guiCallbackFunction) guiCallbackFunction(false, jqXhr);
			});
	},
	initGlobals: function() {
		chatSDKGlobals.DataGlobal.connId = -1;
		chatSDKGlobals.DataGlobal.lastEventId = 0;
	}
};