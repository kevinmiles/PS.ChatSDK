# CCSP Chat SDK v.2

## 1 Overview
The purpose of this SDK is to allow a customer to develop chat user interface using CCSP JSON helper library for chat.
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

* **The Chat application installed on different server where chat API hosted:**
  * Same as above + Configure CCSP to support CORS - read [CCSP APIs Guide](https://support.cosmocom.com/download/attachments/501/CCSP+APIs+Guide.pdf?version=3) for assign headers to HTTP Response Headers.

## 3 SDK reference

File *js/PS.ChatSDK.js* contains following methods to interact with CCSP:
* **joinChat**: function(strUserName, strUserSubject, guiCallbackFunction) - method used to start call to CCSP (uses *chatSDKGlobals.JoinChatData* object)
* **typingMessage**: function(nTypingStatus, guiCallbackFunction) - invoked to display / stop displaying typing status (uses *chatSDKGlobals.TypingMessageData* object)
* **sendMessage**: function(strText, guiCallbackFunction) - used to send message to agent (uses *chatSDKGlobals.SendMessageData* object)
* **fireEvent**: function(strEventName, optionalParameterArray, guiCallbackFunction) - fires custom agent to CCSP (uses *chatSDKGlobals.FireEventData* object)
* **leaveChat**: function(guiCallbackFunction) - leaves chat and ends call (uses *chatSDKGlobals.LeaveChatData* object)

## 4 Troubleshooting notes

To enable writing of chat logs, create following key in registry:
* HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\CCUInternetConnectionServer\Parameters\CosmoDesignerLoggingEnable
  * Value: 1
* HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\CCUInternetConnectionServer\Parameters\CosmoDesignerTempDir
  * Value: C:\

To open BlackBird logging use **F2** button in browser. More on BlackBird [here](http://demo.jb51.net/js/Blackbird/index.html).  
![image](https://raw.githubusercontent.com/Enghouse-CCSP-PS/PS.ChatSDK/master/Docs/img/4.PNG)

Use **F12** to open Developer Tools and see XHR requests.
![image](https://raw.githubusercontent.com/Enghouse-CCSP-PS/PS.ChatSDK/master/Docs/img/5.PNG)
## 5 Frequently asked questions

**Q: I am getting OPTIONS {url} net::ERR_INSECURE_RESPONSE while trying to send requests in Chrome**  
*A: Your HTTPS certificate for  {url} is not valid. For **development or testing** purposes you can disable these warnings:   
Open {url} in new tab -> click on "ADVANCED" -> click on "Proceed to {url} (unsafe)"*

