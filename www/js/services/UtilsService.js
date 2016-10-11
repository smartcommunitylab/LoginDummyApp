angular.module('smartcommunitylab.services.utils', [])

.factory('Utils', function ($rootScope, $window) {
	var utilsService = {};

	utilsService.roundDecimalPlaces = function (num, decimalPlaces) {
		// default: 1 decimal places
		decimalPlaces = !decimalPlaces ? 1 : decimalPlaces;
		return Math.round(num * 10 * decimalPlaces) / (10 * decimalPlaces);
	};

	utilsService.checkFiscalCode = function (cf) {
		var re = /^[A-Za-z]{6}[0-9]{2}[A-Za-z]{1}[0-9]{2}[A-Za-z]{1}[0-9]{3}[A-Za-z]{1}$/;
		return re.test(cf);
	};

	utilsService.getLang = function () {
		var browserLanguage = '';
		// works for earlier version of Android (2.3.x)
		var androidLang;
		if ($window.navigator && $window.navigator.userAgent && (androidLang = $window.navigator.userAgent.match(/android.*\W(\w\w)-(\w\w)\W/i))) {
			browserLanguage = androidLang[1];
		} else {
			// works for iOS, Android 4.x and other devices
			browserLanguage = $window.navigator.userLanguage || $window.navigator.language;
		}

		var lang = browserLanguage.substring(0, 2);
		if (lang != 'it' && lang != 'en' && lang != 'de') {
			lang = 'en'
		};

		return lang;
	};

	utilsService.getLanguage = function () {
		navigator.globalization.getLocaleName(
			function (locale) {
				alert('locale: ' + locale.value + '\n');
			},
			function () {
				alert('Error getting locale\n');
			}
		);
	};

	utilsService.isOnline = function () {
		if (navigator && navigator.connection) {
			return (navigator.connection.type !== Connection.NONE);
		}
		return true;
	};

	utilsService.compare = function (obj1, obj2) {
		return JSON.stringify(obj1) === JSON.stringify(obj2);
	};

	utilsService.isEmailValid = function (email) {
		var regex = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
		return regex.test(email);
	};

	utilsService.isUrlValid = function (url) {
		var res = url.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
		if (res == null) {
			return false;
		} else {
			return true;
		}
	};

	utilsService.roundTime = function () {
		var epochs = (((new Date()).getHours() * 60) + ((new Date()).getMinutes()));
		epochs = Math.floor(epochs / 15) * 15 * 60;
		return epochs * 1000;
	}

	return utilsService;
});
