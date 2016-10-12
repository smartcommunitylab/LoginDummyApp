/*
 * Remember to move URLs and other stuff in an external config/constant file
 */

angular.module('smartcommunitylab.services.login', [])

.factory('SCLogin', function ($rootScope, $q, $http, $window) {
	var service = {};

	var libConfigOK;

	service.LOGIN_TYPE = {
		OAUTH: 'oauth',
		COOKIE: 'cookie'
	};

	// 'googlelocal' and 'facebooklocal' used locally
	service.PROVIDER = {
		INTERNAL: 'internal',
		GOOGLE: 'google',
		FACEBOOK: 'facebook'
	};

	var PROVIDER_NATIVE = {
		GOOGLE: 'googlelocal',
		FACEBOOK: 'facebooklocal'
	};

	var AUTH = {
		AUTHORIZE_URL: "/eauth/authorize",
		BASIC_PROFILE: "/basicprofile/me",
		ACCOUNT_PROFILE: "/accountprofile/me",
		TOKEN_URL: "/oauth/token",
		REGISTER_URL: "/internal/register/rest",
		REVOKE_URL: "/eauth/revoke/"
	};

	//"serverRegisterURL": "/internal/register/rest"

	var authWindow = null;

	var settings = {
		loginType: undefined,
		aacUrl: undefined,
		appLoginUrl: undefined,
		redirectUrl: undefined,
		clientId: undefined,
		clientSecret: undefined
	};

	var user = {
		provider: null,
		profile: null,
		tokenInfo: null
	};

	service.localStorage = {
		PROVIDER: 'user_provider',
		PROFILE: 'user_profile',
		TOKENINFO: 'user_tokeInfo',
		getProvider: function () {
			return JSON.parse($window.localStorage.getItem(this.PROVIDER));
		},
		saveProvider: function () {
			$window.localStorage.setItem(this.PROVIDER, JSON.stringify(user.provider));
		},
		getProfile: function () {
			return JSON.parse($window.localStorage.getItem(this.PROFILE));
		},
		saveProfile: function () {
			$window.localStorage.setItem(this.PROFILE, JSON.stringify(user.profile));
		},
		getTokenInfo: function () {
			return JSON.parse($window.localStorage.getItem(this.TOKENINFO));
		},
		saveTokenInfo: function () {
			$window.localStorage.setItem(this.TOKENINFO, JSON.stringify(user.tokenInfo));
		},
		getUser: function () {
			user = {
				provider: this.getProvider(),
				profile: this.getProfile(),
				tokenInfo: this.getTokenInfo()
			};
		},
		saveUser: function () {
			this.saveProvider();
			this.saveProfile();
			this.saveTokenInfo();
		},
		deleteUser: function () {
			$window.localStorage.removeItem(this.PROVIDER);
			$window.localStorage.removeItem(this.PROFILE);
			$window.localStorage.removeItem(this.TOKENINFO);
		}
	};

	service.userIsLogged = function () {
		return (!!user && !!user.provider && !!user.profile && !!user.profile.userId && !!user.tokenInfo);
	};

	var saveToken = function (tokenInfo) {
		user.tokenInfo = tokenInfo;
		// set expiry (after removing 1 hr).
		var t = new Date();
		t.setSeconds(t.getSeconds() + (user.tokenInfo.expires_in - (60 * 60)));
		// FIXME only dev purpose
		//t.setSeconds(t.getSeconds() + 10);
		// FIXME /only dev purpose
		user.tokenInfo.validUntil = t;
		service.localStorage.saveTokenInfo();
	};

	var resetUser = function () {
		user = {
			provider: undefined,
			profile: undefined,
			tokenInfo: undefined
		};
		service.localStorage.deleteUser();
	};

	var isEmailValid = function (email) {
		var regex = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
		return regex.test(email);
	};

	service.init = function (newSettings) {
		var deferred = $q.defer();

		if (!newSettings) {
			libConfigOK = false;
			deferred.reject('Invalid settings');
		} else if (!newSettings.clientId || !newSettings.clientSecret) {
			libConfigOK = false;
			deferred.reject('Invalid client credentials');
		} else if (!newSettings.redirectUrl) {
			libConfigOK = false;
			deferred.reject('Invalid redirectUrl');
		} else if (!newSettings.loginType) {
			libConfigOK = false;
			deferred.reject('Invalid loginType');
		} else {
			var validLoginType = false;
			for (var key in service.LOGIN_TYPE) {
				if (validLoginType == false && newSettings.loginType == service.LOGIN_TYPE[key]) {
					validLoginType = true;
				}
			}

			if (!validLoginType) {
				libConfigOK = false;
				deferred.reject('Invalid login type');
			} else {
				if (newSettings.loginType == service.LOGIN_TYPE.OAUTH && !newSettings.aacUrl) {
					libConfigOK = false;
					deferred.reject('AAC URL needed');
				} else if (newSettings.loginType == service.LOGIN_TYPE.COOKIE && !newSettings.appLoginUrl) {
					libConfigOK = false;
					deferred.reject('App auth URL needed');
				}
			}
		}

		if (libConfigOK != false) {
			// undefined or true
			settings = newSettings;
			libConfigOK = true;
			service.localStorage.getUser();
			deferred.resolve();
		}

		return deferred.promise;
	};

	/*
	 * get token using the authorization code
	 */
	var getToken = function (code) {
		var deferred = $q.defer();

		$http.post(settings.aacUrl + AUTH.TOKEN_URL, null, {
			params: {
				'client_id': settings.clientId,
				'client_secret': settings.clientSecret,
				'code': code,
				'redirect_uri': settings.redirectUrl,
				'grant_type': 'authorization_code'
			}
		}).then(
			function (response) {
				if (!!response.data.access_token) {
					console.log('[LOGIN] AAC token obtained');
					deferred.resolve(response.data);
				} else {
					deferred.resolve(null);
				}
			},
			function (responseError) {
				deferred.reject(responseError);
			}
		);

		return deferred.promise;
	};

	/*
	 * get token using credentials
	 */
	var getTokenInternal = function (credentials) {
		var deferred = $q.defer();

		$http.post(settings.aacUrl + AUTH.TOKEN_URL, null, {
			params: {
				'username': credentials.email,
				'password': credentials.password,
				'client_id': settings.clientId,
				'client_secret': settings.clientSecret,
				'grant_type': 'password'
			},
			headers: {
				'Accept': 'application/json',
			}
		}).then(
			function (response) {
				if (!!response.data.access_token) {
					console.log('[LOGIN] AAC token obtained');
					deferred.resolve(response.data);
				} else {
					deferred.reject(!!response.data.exception ? response.data.exception : null);
				}
			},
			function (reason) {
				deferred.reject(reason);
			}
		);

		return deferred.promise;
	};

	var remote = {
		getBasicProfile: function getBasicProfile(tokenInfo) {
			var deferred = $q.defer();

			$http.get(settings.aacUrl + AUTH.BASIC_PROFILE, {
				headers: {
					'Authorization': 'Bearer ' + tokenInfo.access_token
				}
			}).then(
				function (response) {
					deferred.resolve(response.data);
				},
				function (reason) {
					deferred.reject(reason);
				}
			);

			return deferred.promise;
		},
		getAccountProfile: function getBasicProfile(tokenInfo) {
			var deferred = $q.defer();

			$http.get(settings.aacUrl + AUTH.ACCOUNT_PROFILE, {
				headers: {
					'Authorization': 'Bearer ' + tokenInfo.access_token
				}
			}).then(
				function (response) {
					deferred.resolve(response.data);
				},
				function (reason) {
					deferred.reject(reason);
				}
			);

			return deferred.promise;
		},
		getCompleteProfile: function (tokenInfo) {
			var deferred = $q.defer();

			remote.getBasicProfile(tokenInfo).then(
				function (profile) {
					if (!!profile && !!profile.userId) {
						remote.getAccountProfile(tokenInfo).then(
							function (accountProfile) {
								for (var authority in accountProfile.accounts) {
									for (var k in accountProfile.accounts[authority]) {
										if (k.indexOf('email') >= 0 && !!accountProfile.accounts[authority][k]) {
											profile.email = accountProfile.accounts[authority][k];
										}
									}
								}
								deferred.resolve(profile);
							},
							function (reason) {
								deferred.resolve(profile);
							}
						);
					} else {
						deferred.resolve(profile);
					}
				},
				function (reason) {
					deferred.reject(reason);
				}
			);

			return deferred.promise;
		}
	};

	/*
	 * login with provider (and, if needed, credentials)
	 */
	service.login = function (provider, credentials) {
		var deferred = $q.defer();

		if (!libConfigOK) {
			console.log('[LOGIN] ' + 'Invalid configuration');
			deferred.reject('Invalid configuration');
			return deferred.promise;
		}

		var validProvider = false;
		for (var key in service.PROVIDER) {
			if (validProvider == false && provider == service.PROVIDER[key]) {
				validProvider = true;
			}
		}

		if (!validProvider) {
			deferred.reject('Invalid provider');
			return deferred.promise;
		}

		if (provider == service.PROVIDER.FACEBOOK && ionic.Platform.isWebView() && !!facebookConnectPlugin) {
			// on mobile force Facebook plugin
			provider = PROVIDER_NATIVE.FACEBOOK;
		} else if (provider == service.PROVIDER.GOOGLE && ionic.Platform.isWebView() && !!$window.plugins.googleplus) {
			// on mobile force Google plugin
			provider = PROVIDER_NATIVE.GOOGLE;
		}

		var authorizeProvider = function (token) {
			var deferred = $q.defer();
			var processThat = false;

			// Build the OAuth consent page URL
			var authUrl = settings.aacUrl + AUTH.AUTHORIZE_URL + '/' + provider;
			authUrl += '?client_id=' + settings.clientId + '&response_type=code' + '&redirect_uri=' + settings.redirectUrl;

			if (token) {
				authUrl += '&token=' + token;
			}

			// Open the OAuth consent page in the InAppBrowser
			if (!authWindow) {
				authWindow = $window.open(authUrl, '_blank', 'location=no,toolbar=no');
				processThat = !!authWindow;
			}

			var processURL = function (url, deferred, w) {
				var success = /\?code=(.+)$/.exec(url);
				var error = /\?error=(.+)$/.exec(url);

				if (w && (success || error)) {
					// Always close the browser when match is found
					w.close();
					authWindow = null;
				}

				if (success) {
					var code = success[1];
					if (code.substring(code.length - 1) == '#') {
						code = code.substring(0, code.length - 1);
					}

					//console.log('[LOGIN] AAC code obtained: ' + decodeURIComponent(code));
					console.log('[LOGIN] AAC code obtained');
					deferred.resolve(code);
				} else if (error) {
					//The user denied access to the app
					deferred.reject({
						error: error[1]
					});
				}
			};

			if (ionic.Platform.isWebView()) {
				if (processThat) {
					authWindow.addEventListener('loadstart', function (e) {
						//console.log('[LOGIN] ' + e);
						var url = e.url;
						processURL(url, deferred, authWindow);
					});
				}
			} else {
				angular.element($window).bind('message', function (event) {
					$rootScope.$apply(function () {
						processURL(event.data, deferred);
					});
				});
			}

			return deferred.promise;
		};

		/* Actions by provider */
		switch (provider) {
			case PROVIDER_NATIVE.GOOGLE:
				/*
				Uses the cordova-plugin-googleplus plugin
				https://github.com/EddyVerbruggen/cordova-plugin-googleplus
				*/
				//'offline': true
				var options = {
					'scopes': 'profile email'
				};

				if (ionic.Platform.isAndroid()) {
					options['webClientId'] = CONF.googleplus.login.webClientId;
				}

				$window.plugins.googleplus.login(options,
					function (obj) {
						if (!!obj.idToken) {
							console.log('[LOGIN] ' + provider + ' token obtained: ' + obj.idToken);
							authorizeProvider(obj.idToken).then(
								function (code) {
									getToken(code).then(
										function (tokenInfo) {
											saveToken(tokenInfo);
											user.provider = provider;
											console.log('[LOGIN] Logged in with ' + user.provider);
											remote.getCompleteProfile(user.tokenInfo).then(
												function (profile) {
													user.profile = profile;
													service.localStorage.saveUser();
													deferred.resolve(profile);
												},
												function (reason) {
													deferred.reject(reason);
												}
											);
										},
										function (error) {
											deferred.reject(error);
										}
									);
								},
								function (reason) {
									console.log('[LOGIN] ' + reason);
									deferred.reject(reason);
								}
							);
						}
					},
					function (msg) {
						console.log('[LOGIN] ' + 'Login googlelocal error: ' + msg);
						deferred.reject('Login googlelocal error: ' + msg);
					}
				);
				break;
			case PROVIDER_NATIVE.FACEBOOK:
				/*
				Uses the cordova-plugin-facebook4 plugin
				https://github.com/jeduan/cordova-plugin-facebook4
				*/
				var gotProviderToken = function (response) {
					console.log('[LOGIN] FACEBOOK RESPONSE ' + JSON.stringify(response));
					console.log('[LOGIN] ' + provider + ' token obtained: ' + response.authResponse.accessToken);
					authorizeProvider(response.authResponse.accessToken).then(
						function (code) {
							getToken(code).then(
								function (tokenInfo) {
									saveToken(tokenInfo);
									user.provider = provider;
									console.log('[LOGIN] logged in with ' + user.provider);
									remote.getCompleteProfile(user.tokenInfo).then(
										function (profile) {
											user.profile = profile;
											service.localStorage.saveUser();
											deferred.resolve(profile);
										},
										function (reason) {
											deferred.reject(reason);
										}
									);
								},
								function (error) {
									deferred.reject(error);
								}
							);
						},
						function (reason) {
							console.log('[LOGIN] ' + reason);
							deferred.reject(reason);
						}
					);
				};

				var facebookLogin = function () {
					facebookConnectPlugin.login(['public_profile', 'email'], gotProviderToken, function (error) {
						deferred.reject(error);
					});
				};

				facebookConnectPlugin.getLoginStatus(
					function (response) {
						response.status == 'connected' ? gotProviderToken(response) : facebookLogin();
					},
					function () {
						facebookLogin();
					}
				);
				break;
			case service.PROVIDER.GOOGLE:
				authorizeProvider().then(
					function (code) {
						getToken(code).then(
							function (tokenInfo) {
								saveToken(tokenInfo);
								user.provider = provider;
								console.log('[LOGIN] Logged in with ' + user.provider);
								remote.getCompleteProfile(user.tokenInfo).then(
									function (profile) {
										user.profile = profile;
										service.localStorage.saveUser();
										deferred.resolve(profile);
									},
									function (reason) {
										deferred.reject(reason);
									}
								);
							},
							function (error) {
								deferred.reject(error);
							}
						);
					},
					function (reason) {
						console.log('[LOGIN] ' + reason);
						deferred.reject(reason);
					}
				);
				break;
			case service.PROVIDER.INTERNAL:
				/*
				Uses the internal AAC sign-in system
				*/
				if (!credentials || !credentials.email || !credentials.password) {
					deferred.reject('Invalid credentials');
					break;
				}

				getTokenInternal(credentials).then(
					function (tokenInfo) {
						saveToken(tokenInfo);
						user.provider = provider;
						console.log('[LOGIN] logged in with ' + user.provider);
						remote.getCompleteProfile(user.tokenInfo).then(
							function (profile) {
								user.profile = profile;
								service.localStorage.saveUser();
								deferred.resolve(profile);
							},
							function (reason) {
								deferred.reject(reason);
							}
						);
					},
					function (reason) {
						deferred.reject(reason);
					}
				);
				break;
			default:
				deferred.reject('Provider "' + provider + '" still unsupported.');
		}

		return deferred.promise;
	};

	var refreshTokenDeferred = null;
	var refreshTokenTimestamp = null;
	service.refreshToken = function () {
		// 10 seconds
		if (!!refreshTokenDeferred && ((new Date().getTime()) < (refreshTokenTimestamp + (1000 * 10)))) {
			console.log('[LOGIN] use recent refreshToken deferred!');
			return refreshTokenDeferred.promise;
		}

		refreshTokenTimestamp = new Date().getTime();
		refreshTokenDeferred = $q.defer();

		// check for expiry.
		var now = new Date();
		if (!!user && !!user.tokenInfo && !!user.tokenInfo.refresh_token) {
			var validUntil = new Date(user.tokenInfo.validUntil);
			if (validUntil.getTime() >= now.getTime() + (60 * 60 * 1000)) {
				refreshTokenDeferred.resolve(user.tokenInfo.access_token);
			} else {
				$http.post(settings.aacUrl + AUTH.TOKEN_URL, null, {
					params: {
						'client_id': settings.clientId,
						'client_secret': settings.clientSecret,
						'refresh_token': user.tokenInfo.refresh_token,
						'grant_type': 'refresh_token'
					}
				}).then(
					function (response) {
						if (response.data.access_token) {
							console.log('[LOGIN] AAC token refreshed');
							saveToken(response.data);
							service.localStorage.saveTokenInfo();
							refreshTokenDeferred.resolve();
						} else {
							resetUser();
							console.log('[LOGIN] invalid refresh_token');
							refreshTokenDeferred.reject(null);
						}
					},
					function (reason) {
						resetUser();
						refreshTokenDeferred.reject(reason);
					}
				);
			}
		} else {
			resetUser();
			refreshTokenDeferred.reject(null);
		}

		return refreshTokenDeferred.promise;
	};

	service.logout = function () {
		var deferred = $q.defer();

		if (settings.loginType == service.LOGIN_TYPE.OAUTH) {
			switch (user.provider) {
				case PROVIDER_NATIVE.GOOGLE:
					$window.plugins.googleplus.logout(
						function (msg) {
							resetUser();
							console.log('[LOGIN] ' + PROVIDER_NATIVE.GOOGLE + ' logout successfully (' + msg + ')');
							deferred.resolve(msg);
						},
						function () {
							deferred.reject();
						}
					);
					break;
				case PROVIDER_NATIVE.FACEBOOK:
					facebookConnectPlugin.logout(
						function () {
							resetUser();
							console.log('[LOGIN] ' + PROVIDER_NATIVE.FACEBOOK + ' logout successfully');
							deferred.resolve();
						},
						function () {
							deferred.reject();
						}
					);
					break;
				case service.PROVIDER.INTERNAL:
					$http.get(settings.aacUrl + AUTH.REVOKE_URL + user.tokenInfo.access_token, {
						headers: {
							'Authorization': 'Bearer ' + user.tokenInfo.access_token
						}
					}).then(
						function (response) {
							resetUser();
							console.log('[LOGIN] ' + service.PROVIDER.INTERNAL + ' logout successfully (token revoked)');
							deferred.resolve(response.data);

						},
						function (reason) {
							deferred.reject(reason);
						}
					);
					break;
				default:
			}
		} else if (settings.loginType == service.LOGIN_TYPE.COOKIE) {
			/*
			var complete = function (response) {
				StorageSrv.reset().then(function () {
					try {
						cookieMaster.clear(
							function () {
								console.log('[LOGIN] ' + 'Cookies have been cleared');
								deferred.resolve(response.data);
							},
							function () {
								console.log('[LOGIN] ' + 'Cookies could not be cleared');
								deferred.resolve(response.data);
							});
					} catch (e) {
						deferred.resolve(e);
					}
				});
			};

			CacheSrv.reset();

			$http.get(settings.appLoginUrl + AUTH.LOGOUT_URL, {
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				}
			}).then(
				function (response) {
					complete(response);
				},
				function (reason) {
					deferred.reject(reason.data ? reason.data.errorMessage : reason);
				}
			);
			*/
		}

		return deferred.promise;
	};

	/*
	 * registration in the internal AAC
	 */
	service.register = function (user) {
		var deferred = $q.defer();

		if (!user || !user.name.trim() || !user.surname.trim() || !user.email.trim() || !isEmailValid(user.email) || !user.password.trim()) {
			deferred.reject();
			return deferred.promise;
		}

		$http.post(settings.aacUrl + AUTH.REGISTER_URL, user, {
			params: {
				'client_id': settings.clientId,
				'client_secret': settings.clientSecret,
			},
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			}
		}).then(
			function (response) {
				deferred.resolve();
			},
			function (reason) {
				deferred.reject(reason);
			}
		);

		return deferred.promise;
	};

	service.getUserProfile = function () {
		if (!!user.profile && !!user.profile.userId) {
			return user.profile;
		}
		return null;
	};

	return service;
});
