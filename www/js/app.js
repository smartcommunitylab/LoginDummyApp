angular.module('logindummy', [
	'ionic',
	'smartcommunitylab.services.utils',
	'smartcommunitylab.services.login',
	'logindummy.controllers.main'
])

.run(function ($ionicPlatform, $window, SCLogin) {
	$ionicPlatform.ready(function () {
		if ($window.cordova && $window.cordova.plugins.Keyboard) {
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
			cordova.plugins.Keyboard.disableScroll(true);
		}

		if ($window.StatusBar) {
			StatusBar.styleDefault();
		}
	});

	SCLogin.init({
		loginType: SCLogin.LOGIN_TYPE.OAUTH,
		aacUrl: CONF.aacUrl,
		appLoginUrl: undefined,
		redirectUrl: CONF.redirectUrl,
		clientId: CONF.clientId,
		clientSecret: CONF.clientSecret
	});
});
