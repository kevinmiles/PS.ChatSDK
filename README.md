# CCSP Chat SDK v.2

## 1 Overview
The purpose of this SDK is to allow a customer to develop chat user interface using CCSP JSON helper library for chat.  
**We want your feedback!** Email [CCSP_PS@enghouse.com](CCSP_PS@enghouse.com) with suggested improvements, feature requests and general feedback, or feel free to open a GitHub issue.  
Below screenshot of sample application in Desktop Browser:

![image](https://raw.githubusercontent.com/Enghouse-CCSP-PS/PS.ChatSDK/master/Docs/img/1.PNG)

Below screenshot of sample application in phone Browser:

![image](https://raw.githubusercontent.com/Enghouse-CCSP-PS/PS.ChatSDK/master/Docs/img/2.png)

### System Architecture
The picture below shows the system components for online mode.
![image](https://raw.githubusercontent.com/Enghouse-CCSP-PS/PS.ChatSDK/master/Docs/img/3.PNG)

* **Index.html** - sample html chat implementation
* **js/scriptChatAjax.js** - sample js chat implementation
* **js/PS.ChatSDK.js** - helper class wrapping communication to chat API 
* **js/PS.ChatSDK.Globals.js** - SDK settings


## 2 Deployment Guide
* **The Chat application installed on same server where chat API hosted:** 
  * Configure new virtual folder with all content from *PS.ChatAjax.zip*
  * In *js/PS.ChatSDK.Globals.js* configure:  
    * *JoinChatData.Call_Center_Address* 
    * *DataGlobal.CCUServerAddress*  
	Both parameters should point to the same address.
    * *JoinChatData.Call_Center_QueueName*
    * *JoinChatData.Calling_User_Skills*
    * *JoinChatData.ApplicationID*
    * *JoinChatData.TenantID*  
	Refer to [CCSP APIs Guide](https://support.cosmocom.com/download/attachments/501/CCSP+APIs+Guide.pdf?version=3) for more information.
    * *IsVideoEnabled* - (true or false) - enables or disables video chat capabilities (please contact Enghouse PS to get more information)

  * **Optionally *JoinChatData* parameters can be overridden via HTTP querystring parameters when opening chat page.** Following members of *JoinChatData* can be overridden:
    * *Call_Center_Address*
    * *Call_Center_QueueName*
    * *Calling_User_HardMessage*
    * *TQOS* - querystring parameter can also be named *TQoS*
    * *Routing_Priority*
    * *AccountID*
    * *Calling_User_Skills*
    * *ApplicationID*
    * *Call_Center_Port*
    * *Calling_User_Priority*
    * *Calling_User_URL*
    * *Calling_User_FirstName*
    * *Calling_User_LastName*
    * *TenantID* - querystring parameter can also be named *TenantName*
    * *OptionalParameterCount* - if present *OptionalParametern* (where 0 <= n < *OptionalParameterCount*) parameters formated as *name,value* must be present too

* **The Chat application installed on different server where chat API hosted:**
  * Same as above + Configure CCSP to support CORS - read [CCSP APIs Guide](https://support.cosmocom.com/download/attachments/501/CCSP+APIs+Guide.pdf?version=3) for assign headers to HTTP Response Headers.

## 3 SDK reference

File *js/PS.ChatSDK.js* contains following methods to interact with CCSP:
* **joinChat**: function(strUserName, strUserSubject, guiCallbackFunction) - method used to start call to CCSP (uses *chatSDKGlobals.JoinChatData* object)
* **typingMessage**: function(nTypingStatus, guiCallbackFunction) - invoked to display / stop displaying typing status (uses *chatSDKGlobals.TypingMessageData* object)
* **sendMessage**: function(strText, guiCallbackFunction) - used to send message to agent (uses *chatSDKGlobals.SendMessageData* object)
* **fireEvent**: function(strEventName, optionalParameterArray, guiCallbackFunction) - fires custom agent to CCSP (uses *chatSDKGlobals.FireEventData* object)
* **leaveChat**: function(guiCallbackFunction) - leaves chat and ends call (uses *chatSDKGlobals.LeaveChatData* object)

## 4 Additional examples
* Example of ChatSDK usage is available: file index.html and additional files in jb folder, contains additional working example of ChatSDK usage. 
* Example URL to open chat page with querystring parameters might look like: *http://www.example.com/PS_ChatSDK/index.html?command=connect&Call_Center_Address=127.0.0.1&Call_Center_QueueName=q1&TenantName=t1&Calling_User_Skills=s1&Calling_User_FirstName=John&Calling_User_LastName=Doe&&Calling_User_HardMessage=I%20have%20a%20problem&OptionalParameterCount=2&OptionalParameter0=paramName1%2CparamValue1&OptionalParameter1=paramName2%2CparamValue2*

## 5 Troubleshooting notes

To enable writing of chat logs, create following key in registry:
* HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\CCUInternetConnectionServer\Parameters\CosmoDesignerLoggingEnable
  * Value: 1
* HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\CCUInternetConnectionServer\Parameters\CosmoDesignerTempDir
  * Value: C:\

To open BlackBird logging use **F2** button in browser. More on BlackBird [here](http://demo.jb51.net/js/Blackbird/index.html).  
![image](https://raw.githubusercontent.com/Enghouse-CCSP-PS/PS.ChatSDK/master/Docs/img/4.PNG)

Use **F12** to open Developer Tools and see XHR requests.
![image](https://raw.githubusercontent.com/Enghouse-CCSP-PS/PS.ChatSDK/master/Docs/img/5.PNG)
## 6 Frequently asked questions

**Q: I am getting OPTIONS {url} net::ERR_INSECURE_RESPONSE while trying to send requests in Chrome**  
*A: Your HTTPS certificate for  {url} is not valid. For **development or testing** purposes you can disable these warnings:   
Open {url} in new tab -> click on "ADVANCED" -> click on "Proceed to {url} (unsafe)"*


## 7 Contributing

Bug fixes welcome! If you're not familiar with the GitHub pull
request/contribution process,
[this is a nice tutorial](https://gun.io/blog/how-to-github-fork-branch-and-pull-request/).