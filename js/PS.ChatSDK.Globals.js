var chatSDKGlobals = {
    OptionalParameter: {
        "key": "",
        "value": ""
    },
    StatusRes: {
        "104": { description: "Calling Call Center", messageForUser: "Calling Call Center" },
        "105": { description: "Waiting for Agent", messageForUser: "Waiting for Agent" },
        "106": { description: "In Call", messageForUser: "In Call" },
        "107": { description: "Not Connected", messageForUser: "Not Connected" },
        "133": { description: "Connected to the call center", messageForUser: "Connected to the call center" },
        "157": { description: "Call placed on hold", messageForUser: "Call placed on hold" },
        "165": { description: "Waiting in queue", messageForUser: "Waiting in queue {timeToWait} {minutesToWait} minutes" }
    },
    WaitingInQueue: {
        1: "Less than",
        2: "About",
        3: "Longer then"
    },
    NoAgentForThisCall: {
        6: "Unknown reason",
        7: "Insufficient memory",
        8: "No satisfying agents",
        9: "Invalid queue",
        10: "No primary connection server address",
        11: "No call ID",
        12: "Invalid external queue",
        13: "Unknown skill name is specified in call requirements",
        14: "Stream with reference your already exist",
        15: "Cannot find the call by your reference",
        16: "Call with your reference cannot be accepted by the agent",
        17: "There is no connection available now",
        18: "Agent refused"
    },
    JoinChatData: {
        "API_Version": "1.0",
        "Call_Center_Address": "dnccsp12.dn12.loc",
        "Call_Center_QueueName": "DefaultQueue",
        "Calling_User_HardMessage": "I need some help",
        "TQOS": "0",
        "Routing_Priority": "0",
        "AccountID": "0",
        "Calling_User_Skills": "",
        "ApplicationID": "DefaultApplicationOne",
        "Call_Center_Port": "2324",
        "Calling_User_Priority": "-1",
        "Calling_User_URL": "facebook",
        "Calling_User_FirstName": "CustomerFirstName",
        "Calling_User_LastName": "",
        "TenantID": "t1",
        "OptionalParameterCount": ""
    },
    SendMessageData: {
        "Connection_ID": 123,
        "Message_Text": "enghouse test page"
    },
    LeaveChatData: {
        "Connection_ID": 123
    },
    TypingMessageData: {
        "Connection_ID": 123,
        "typing_status": 1
    },
    FireEventData: {
        "Connection_ID": 123,
        "Fire_Event_Name": "url",
        "OptionalParameterCount": ""
    },
    DataGlobal: {
        his: "",
        connId: -1,
        lastEventId: 0,
        CCUServerAddress: "http://dnccsp12.dn12.loc",
		getEventsTimeoutMS: 1000
    },
    IsVideoEnabled: false,
    ParticipantDisconnectedMessage: 'Participant {name} disconnected',
	AutoConnect: false,
	HasFirstName: false,
	HasHardMessage: false,
	QueryOptionalParameters: {},
};

(function initGlobalsFromQuerystring(queryParamsArray) {
	var queryParams = {};
	var additionalMappings = { "TQoS" : "TQOS", "TenantName" : "TenantID" }
	
	for (var i = 0; i < queryParamsArray.length; ++i)
	{
		var queryParam = queryParamsArray[i].split('=', 2);
		if (queryParam.length !== 2) 
			continue;
		queryParams[queryParam[0]] = decodeURIComponent(queryParam[1].replace(/\+/g, " "));
	}

	for (var prop in chatSDKGlobals.JoinChatData) {
		if (queryParams[prop] !== undefined) {
			chatSDKGlobals.JoinChatData[prop] = queryParams[prop];
		}
	}	
	for (var prop in additionalMappings) {
		if (queryParams[prop] !== undefined) {
			chatSDKGlobals.JoinChatData[additionalMappings[prop]] = queryParams[prop];
		}
	}	

	if (queryParams["OptionalParameterCount"] !== undefined) {
		var optionalqueryParams = [];
		for (var i = 0; i < queryParams["OptionalParameterCount"] * 1; i++) {
			if (queryParams["OptionalParameter" + i] !== undefined) {
				var split = queryParams["OptionalParameter" + i].split(',');
				if (split.length < 2) continue;
				optionalqueryParams.push({key: split.shift(), value: split.join(',')});
			}
		}
		chatSDKGlobals.QueryOptionalParameters = optionalqueryParams;
	}

	chatSDKGlobals.AutoConnect = (queryParams["command"] === "connect");
	chatSDKGlobals.HasFirstName = (queryParams["Calling_User_FirstName"] !== undefined);
	chatSDKGlobals.HasHardMessage = (queryParams["Calling_User_HardMessage"] !== undefined);

}(window.location.search.substr(1).split('&'))) 