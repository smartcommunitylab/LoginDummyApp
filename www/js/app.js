angular.module('logindummy', [
	'ionic',
	'smartcommunitylab.services.utils',
	'smartcommunitylab.services.login',
	'logindummy.controllers.main'
])

.run(function ($ionicPlatform, $window, LoginService) {
	$ionicPlatform.ready(function () {
		if ($window.cordova && $window.cordova.plugins.Keyboard) {
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
			cordova.plugins.Keyboard.disableScroll(true);
		}

		if ($window.StatusBar) {
			StatusBar.styleDefault();
		}
	});

	// AAC
	var aacInitOptions = {
		loginType: LoginService.LOGIN_TYPE.AAC,
		aacUrl: CONF.aacUrl,
		clientId: CONF.clientId,
		clientSecret: CONF.clientSecret
	};

	// cookie
	var cookieInitOptions = {
		loginType: LoginService.LOGIN_TYPE.COOKIE,
		customConfig: {
			BASE_URL: 'https://tn.smartcommunitylab.it/carpooling',
			AUTHORIZE_URL: 'https://tn.smartcommunitylab.it/carpooling/userlogin',
			SUCCESS_REGEX: /userloginsuccess\?profile=(.+)$/,
			ERROR_REGEX: /userloginerror\?error=(.+)$/,
			LOGIN_URL: 'https://tn.smartcommunitylab.it/carpooling/userlogininternal',
			REGISTER_URL: 'https://tn.smartcommunitylab.it/carpooling/register',
			REVOKE_URL: 'https://tn.smartcommunitylab.it/carpooling/logout',
			RESET_URL: 'https://tn.smartcommunitylab.it/carpooling/internal/reset',
			REDIRECT_URL: 'http://localhost'
		}
	};

	LoginService.init(cookieInitOptions);
});
