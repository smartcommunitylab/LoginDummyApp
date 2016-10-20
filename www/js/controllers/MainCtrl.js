angular.module('logindummy.controllers.main', [])

.controller('MainCtrl', function ($scope, $ionicPopup, $ionicLoading, Utils, LoginService) {
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

			LoginService.register(user).then(
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
		LoginService.login(provider, $scope.credentials).then(
			function (userProfile) {},
			function (error) {
				console.log(error);
			}
		).finally(function () {
			$ionicLoading.hide();
		});
	};

	$scope.logout = function () {
		if (LoginService.userIsLogged()) {
			LoginService.logout().then(
				function () {},
				function () {}
			).finally(function () {});
		}
	};

	$scope.refresh = function () {
		$ionicLoading.show();
		LoginService.refreshToken().then(
			function () {},
			function () {}
		).finally(function () {
			$ionicLoading.hide();
		});
	};

	$scope.userIsLogged = function () {
		return LoginService.userIsLogged();
	};

	$scope.getUserProfile = function () {
		return LoginService.getUserProfile();
	};
});
