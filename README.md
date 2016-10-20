# LoginDummyApp
This is only a testing app to show our Login Service on Ionic-based mobile apps.

It permits login with:
* internal AAC
* Google (account choice on Android, login form on iOS)
* Facebook (native if the Facebook app is installed, the form otherwise)

## Dependencies
In order to use native login for Google and Facebook these Cordova plugins are required:
* **cordova-plugin-googleplus** https://github.com/EddyVerbruggen/cordova-plugin-googleplus
* **cordova-plugin-facebook4** https://github.com/jeduan/cordova-plugin-facebook4

## Setting up
Install the required plugins (see Dependencies) and include the LoginService.js file in your `index.html` file:
```javascript
<script src="<path>/<to>/LoginService.js"></script>
```
Then add it to the controller you want:
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
	aacUrl: <string>,
	appLoginUrl: <string>,
	clientId: <string>,
	clientSecret: <string>
}
```

The possible values are:
* ```LoginService.LOGIN_TYPE.OAUTH```: you need to provide a ```aacUrl```
* ```LoginService.LOGIN_TYPE.COOKIE```: you need to provide a ```appLoginUrl``` for the custom handling of the token

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

The provider can be one of these values:
* ```LoginService.PROVIDER.GOOGLE```
* ```LoginService.PROVIDER.FACEBOOK```
* ```LoginService.PROVIDER.INTERNAL``` (it makes ```credentials``` mandatory)

#in progress...#