angular.module('logindummy.controllers.main', [])

.controller('MainCtrl', function ($scope, $ionicPopup, $ionicLoading, Utils, SCLogin) {
	//$scope.userProfile;

	$scope.openRegistrationPopup = function () {
		$scope.userForm = {
			name: '',
			surname: '',
			email: '',
			password: '',
			password2: ''
		};

		var registrationPopup = $ionicPopup.show({
			scope: $scope,
			title: 'Internal AAC registration',
			cssClass: '',
			subTitle: '',
			templateUrl: 'templates/popup-registration.html',
			buttons: [
				{
					text: 'Cancel',
					type: 'button-default',
					onTap: function (e) {}
  				},
				{
					text: 'OK',
					type: 'button-calm',
					onTap: function (e) {
						if (!$scope.userForm || !$scope.userForm.name.trim() || !$scope.userForm.surname.trim() || !$scope.userForm.email.trim() || !Utils.isEmailValid($scope.userForm.email) || !$scope.userForm.password.trim() || !$scope.userForm.password2.trim() || ($scope.userForm.password != $scope.userForm.password2)) {
							e.preventDefault();
						} else {
							return $scope.userForm;
						}
					}
  				}
			]
		});

		registrationPopup.then(function (form) {
			var user = {
				name: form.name,
				surname: form.surname,
				email: form.email,
				password: form.password,
				lang: Utils.getLang()
			};

			SCLogin.register(user).then(
				function () {},
				function () {}
			)
		});
	};

	//$scope.openRegistrationPopup();

	$scope.credentials = {
		email: null,
		password: null
	};

	$scope.login = function (provider) {
		$ionicLoading.show();
		SCLogin.login(provider, $scope.credentials).then(
			function (userProfile) {},
			function (error) {
				console.log(error);
			}
		).finally(function () {
			$ionicLoading.hide();
		});
	};

	$scope.logout = function () {
		if (SCLogin.userIsLogged()) {
			SCLogin.logout().then(
				function () {},
				function () {}
			).finally(function () {});
		}
	};

	$scope.refresh = function () {
		$ionicLoading.show();
		SCLogin.refreshToken().then(
			function () {},
			function () {}
		).finally(function () {
			$ionicLoading.hide();
		});
	};

	$scope.userIsLogged = function () {
		return SCLogin.userIsLogged();
	};

	$scope.getUserProfile = function () {
		return SCLogin.getUserProfile();
	};
});
