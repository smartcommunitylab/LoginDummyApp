# LoginDummyApp
This is only a testing app to show our Login Service on Ionic-based mobile apps.

It permits login with:
* internal AAC
* Google (account choice on Android, login form on iOS)
* Facebook (native if the Facebook app is installed, the form otherwise)

## Dependencies
In order to use the plugin these Cordova plugins are required:
* **cordova-plugin-googleplus** https://github.com/EddyVerbruggen/cordova-plugin-googleplus
* **cordova-plugin-facebook4** https://github.com/jeduan/cordova-plugin-facebook4
* **cordova-remove-cookies** https://github.com/bez4pieci/Phonegap-Cookies-Plugin

### cordova-plugin-googleplus
On your [Google Developer Console](https://console.developers.google.com/apis/credentials) you need to create three OAuth client IDs: _android_ and _iOS_ just to <u>enable the platforms</u>, ***web application*** as ```webClientId``` (used for Google) and as ```REVERSED_CLIENT_ID``` (writing it reversed...) used in the ```package.json``` when you configure the plugin. Just to be clear:
* **webClientId**: ```123456789012-ab1cd2ef3gh4ij5kl6mn7op8qr9st0uv.apps.googleusercontent.com```
* **REVERSED_CLIENT_ID**: ```com.googleusercontent.apps.123456789012-ab1cd2ef3gh4ij5kl6mn7op8qr9st0uv```

### cordova-plugin-facebook4
On your [Facebook for developers Console](https://developers.facebook.com/apps/) you need to create a new app, <u>enable Android and iOS platforms</u> for the login and make it public or eventually add allowed accounts. Then in the ```package.json``` add app name and app ID (as the instructions say).

## Setting up
When you installed the required plugins (see Dependencies) you have to include the LoginService.js file in your `index.html` file:
```javascript
<script src="<path>/<to>/LoginService.js"></script>
```
Then inject it:
```javascript
angular.module('myapp', [
	'...',
	'smartcommunitylab.services.login',
	'...'
])
```

## Initialize the service
You need to initialize the service before using it using the function ```LoginService.init()``` and passing an object like
```javascript
{
	loginType: LoginService.LOGIN_TYPE,
	googleWebClientId: <string>
	aacUrl: <string>,
	clientId: <string>,
	clientSecret: <string>,
	cookieConfig: <string>
}
```
For Android the ```googleWebClientId``` is **mandatory**.

The possible ```LoginService.LOGIN_TYPE``` values are:
* ```LoginService.LOGIN_TYPE.AAC```: you need to provide the ```aacUrl```, the ```clientId``` and the ```clientSecret```
* ```LoginService.LOGIN_TYPE.COOKIE```: you need to provide a ```cookieConfig``` object

The ```cookieConfig``` object has to contain the URLs for the authentication operations
```javascript
{
	BASE_URL: <string>,
	AUTHORIZE_URL: <string>,
	SUCCESS_REGEX: <regex>,
	ERROR_REGEX: <regex>,
	LOGIN_URL: <string>,
	REGISTER_URL: <string>,
	RESET_URL: <string>,
	REVOKE_URL: <string>,
	REDIRECT_URL: <string>
}
```
These options are explained in this table:

Option | Description
------ | -----------
BASE_URL | The base URL. Not used right now, so it's optional. <br> e.g. _http://dev.smartcommunitylab.it/customapp_
AUTHORIZE_URL | The URL where the token is authorized <br> e.g. _http://dev.smartcommunitylab.it/customapp/userlogin_
SUCCESS_REGEX | The regex used to control the URL of the authorize success response <br> e.g. _/userloginsuccess\?profile=(.+)$/_
ERROR_REGEX | The regex used to control the URL of the authorize error response <br> e.g. _/userloginerror\?error=(.+)$/_
LOGIN_URL | The URL used for interal login <br> e.g. _http://dev.smartcommunitylab.it/customapp/userlogininternal_
REGISTER_URL | The URL for the internal registration <br> e.g. _http://dev.smartcommunitylab.it/customapp/register_
REVOKE_URL | The URL to use for token revoke <br> e.g. _http://dev.smartcommunitylab.it/customapp/revoke_
RESET_URL | The URL (NOT relative) for the internal reset password request (to be opened in a window or the endpoind) <br> e.g. _http://dev.smartcommunitylab.it/customapp/internal/reset_
REDIRECT_URL | The redirect URL <br> e.g. _http://localhost_

## Login
You can login using the ```LoginService.login(provider, credentials)``` function that returns a promise. There's an example:
```javascript
LoginService.login(provider, credentials).then(
	function (userProfile) { ... },
	function (error) { ... }
);
```
where ```credentials``` is an optional object with this structure:
```javascript
{
	email: <string>,
	password: <string>
}
```

The provider can be one of these ```LoginService.PROVIDER``` values:
* ```LoginService.PROVIDER.GOOGLE```
* ```LoginService.PROVIDER.FACEBOOK```
* ```LoginService.PROVIDER.INTERNAL``` (it makes ```credentials``` mandatory)

## getUserProfile
It simply returns the user profile if the user is logged in.
```javascript
LoginService.getUserProfile();
```

## userIsLogged
It simply returns a ```boolean``` about the user status, ```true``` if logged in, ```false``` if not.
```javascript
LoginService.userIsLogged();
```

## getValidAACtoken
This method is used when ```loginType``` is ```LoginService.LOGIN_TYPE.AAC```. It refreshes the token if needed. It returns a promise with the token.
```javascript
LoginService.getValidAACtoken().then(...);
```

## Logout
This method logs the user out from the provider used for the login and clears the user data/token, or clears the cookie. It returns a promise.
```javascript
LoginService.logout().then(...);
```

## register
This method is used to register a new user in the system, AAC or cookie based. The ```user``` object depends on the server side implementation used! It returns a promise.
```javascript
// this user object is just an example!
var user = {
	name: 'Jon',
	surname: 'Snow',
	email: 'jonsnow@example.com',
	password: 'ghost'
};

LoginService.register(user).then(...);
```

## resetPassword
This method lets the user change/reset the password if ```loginType``` is ```LoginService.PROVIDER.INTERNAL``` or if he/she wants just to set a password. Right now it opens a window where the user can insert the email address. It returns nothing.

The library is ready to implement an API call: if an email is provided as argument it will be sent without the opening of a browser window. (NOT IMPLEMENTED YET). It will return a promise.
```javascript
LoginService.resetPassword();
// in the future...
LoginService.resetPassword('jonsnow@example.com').then(...);
```
