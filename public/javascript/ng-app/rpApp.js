'use strict';

/* App Module */

var rpApp = angular.module('rpApp', [
	'ngRoute',
	'ngMaterial',
	'ngAnimate',
	'ngSanitize',
	'linkify',
	'angularMoment',
	'RecursionHelper',
	'ng-mfb',
	'debounce',
	'mediaCheck',
	'angular-google-adsense',
	'rpServices',
	'rpUtilServices',
	'rpImgurUtilServices',
	'rpResourceServices',
	'rpFilters',
	'rpDirectives',
	'rpMediaDirectives',
	'rpControllers',
	'rpPostControllers',
	'rpUserControllers',
	'rpMessageControllers',
	'rpArticleControllers',
	'rpCommentControllers',
	'rpMediaControllers',
	'rpProgressControllers',
	'rpCaptchaControllers',
	'rpSettingsControllers',
	'rpSearchControllers',
	'rpShareControllers',
	'rpSubmitControllers',
	'rpScoreControllers',
	'rpReplyFormControllers',
	'rpDeleteControllers',
	'rpSaveControllers',
	'rpGildControllers',
	'rpEditFormControllers',
	'rpLinkControllers',
	'rpTabsControllers',
	'rpRedditApiServices'

]);

/*
	Uncomment to enable digest cycle timer
 */
// rpApp.config(function($rootScopeProvider) {
// 	$rootScopeProvider.digestTtl(15);
// });

rpApp.constant('angularMomentConfig', {
	preprocess: 'unix',
	timezone: 'utc'
});

rpApp.config(['$routeProvider', '$locationProvider',
	function($routeProvider, $locationProvider) {

		$routeProvider.

		when('/submitLink', {
			templateUrl: 'partials/rpSubmitLink'
		})

		.when('/submitText', {
			templateUrl: 'partials/rpSubmitText'
		})

		.when('/:sub/search', {
			templateUrl: 'partials/rpSearch',
			controller: 'rpSearchCtrl'
		})

		.when('/search', {
			templateUrl: 'partials/rpSearch',
			controller: 'rpSearchCtrl'
		})

		.when('/settings', {
			templateUrl: 'partials/rpSettings',
			controller: 'rpSettingsCtrl'
		})

		.when('/message', {
			templateUrl: 'partials/rpMessage',
			controller: 'rpMessageCtrl'
		})

		.when('/message/compose', {
			templateUrl: 'partials/rpMessageCompose',
			controller: 'rpMessageComposeCtrl'
		})

		.when('/message/:where', {
			templateUrl: 'partials/rpMessage',
			controller: 'rpMessageCtrl'
		})

		.when('/u/:username', {
			templateUrl: 'partials/rpUser',
			controller: 'rpUserCtrl'
		})

		.when('/u/:username/:where', {
			templateUrl: 'partials/rpUser',
			controller: 'rpUserCtrl'
		})

		.when('/user/:username', {
			templateUrl: 'partials/rpUser',
			controller: 'rpUserCtrl'
		})

		.when('/user/:username/:where', {
			templateUrl: 'partials/rpUser',
			controller: 'rpUserCtrl'
		})

		.when('/r/:subreddit/comments/:article/:slug/:comment', {
			templateUrl: 'partials/rpArticleCard',
			controller: 'rpArticleCtrl'
		})

		.when('/r/:subreddit/comments/:article/:comment', {
			templateUrl: 'partials/rpArticleCard',
			controller: 'rpArticleCtrl'
		})

		.when('/r/:subreddit/comments/:article', {
			templateUrl: 'partials/rpArticleCard',
			controller: 'rpArticleCtrl'
		})

		.when('/r/:sub/:sort', {
			templateUrl: 'partials/rpPosts',
			controller: 'rpPostsCtrl'
		})


		.when('/error/:errorcode', {
			templateUrl: 'partials/rpRouteError',
		})

		.when('/error', {
			templateUrl: 'partials/rpRouteError'
		})

		.when('/facebookComplete', {
			templateUrl: 'partials/rpFacebookComplete'
		})

		.when('/r/:sub', {
			templateUrl: 'partials/rpPosts',
			controller: 'rpPostsCtrl'
		})

		.when('/:sort', {
			templateUrl: 'partials/rpPosts',
			controller: 'rpPostsCtrl'
		})

		.when('/', {
			templateUrl: 'partials/rpPosts',
			controller: 'rpPostsCtrl'
		})


		.otherwise({
			templateUrl: 'partials/rpRouteError'
		});

		$locationProvider.html5Mode(true);
	}
]);

rpApp.config(['$mdThemingProvider', function($mdThemingProvider) {
	$mdThemingProvider.theme('default')
		// .primaryPalette('blue')
		// .primaryPalette('deep-orange')
		.primaryPalette('deep-orange')
		// If you specify less than all of the keys, it will inherit from the
		// default shades
		.accentPalette('deep-orange', {
			'default': '500'
		});

	$mdThemingProvider.theme('indigo').primaryPalette('indigo').accentPalette('indigo', {
		'default': '500'
	});
	$mdThemingProvider.theme('blue').primaryPalette('blue').accentPalette('blue', {
		'default': '500'
	});
	$mdThemingProvider.theme('red').primaryPalette('red').accentPalette('red', {
		'default': '500'
	});
	$mdThemingProvider.theme('purple').primaryPalette('purple').accentPalette('purple', {
		'default': '500'
	});
	$mdThemingProvider.theme('pink').primaryPalette('pink').accentPalette('pink', {
		'default': '500'
	});
	$mdThemingProvider.theme('green').primaryPalette('green').accentPalette('green', {
		'default': '500'
	});

	$mdThemingProvider.alwaysWatchTheme(true);

}]);

/*
	http://joelsaupe.com/programming/angularjs-change-path-without-reloading/
 */
rpApp.run(['$route', '$rootScope', '$location', function($route, $rootScope, $location) {


	var original = $location.path;

	$location.path = function(path, reload) {
		if (reload === false) {
			var lastRoute = $route.current;

			console.log('[rpApp] LISTENER SET');

			var un = $rootScope.$on('$locationChangeSuccess', function() {
				console.log('[rpApp] $locationChangeSuccess (LISTENER UNSET)');
				$route.current = lastRoute;
				un();
			});
		}
		return original.apply($location, [path]);
	};

}]);

// rpApp.run(['$rootScope', function($rootScope) {
// 	var $oldDigest = $rootScope.$digest;
// 	var $newDigest = function() {
// 		console.time("$digest");
// 		$oldDigest.apply($rootScope);
// 		console.timeEnd("$digest");
// 	};
// 	$rootScope.$digest = $newDigest;
// }]);


/*
empty digest cycle listener
 */
// rpApp.run(['$rootScope', function($rootScope) {
// 	$rootScope.$watch(function() {
// 		console.log('[height digest cycle]');
// 	});
// }]);