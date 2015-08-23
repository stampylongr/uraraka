'use strict';

var rpUserControllers = angular.module('rpUserControllers', []);

rpUserControllers.controller('rpUserCtrl', 
	[
		'$scope', 
		'$rootScope',
		'$window',
		'$routeParams',
		'$filter',
		'$location',
		'$mdDialog',
		'rpUserUtilService',
		'rpTitleChangeService',
		'rpSettingsUtilService',
		'rpSaveUtilService',
		'rpUpvoteUtilService',
		'rpDownvoteUtilService',
		'rpByIdUtilService',
		'rpUserTabUtilService',
		'rpUserFilterButtonUtilService',
		'rpPostFilterButtonUtilService',
		'rpSubscribeButtonUtilService',
		'rpLocationUtilService',
		'rpIdentityUtilService',
		'rpSearchFormUtilService',
		'rpSearchFilterButtonUtilService',
		'rpToolbarShadowUtilService',
	
	function($scope, $rootScope, $window, $routeParams, $filter, $location, $mdDialog, rpUserUtilService, rpTitleChangeService, rpSettingsUtilService, rpSaveUtilService, 
		rpUpvoteUtilService, rpDownvoteUtilService, rpByIdUtilService, rpUserTabUtilService, rpUserFilterButtonUtilService, rpPostFilterButtonUtilService, 
		rpSubscribeButtonUtilService, rpLocationUtilService, rpIdentityUtilService, rpSearchFormUtilService, rpSearchFilterButtonUtilService, rpToolbarShadowUtilService) {

		rpPostFilterButtonUtilService.hide();
		rpSubscribeButtonUtilService.hide();
		rpSearchFormUtilService.hide();
		rpSearchFilterButtonUtilService.hide();
		rpToolbarShadowUtilService.setShowToolbarShadow(false);

		var loadingMore = false;
		$scope.havePosts = false;
		
		var value = $window.innerWidth;
		if (value > 1550) $scope.columns = [1, 2, 3];
		else if (value > 970) $scope.columns = [1, 2];
		else $scope.columns = [1];

		var username = $routeParams.username;
		var where = $routeParams.where || 'overview';
		var sort = $routeParams.sort || 'new';
		var t = $routeParams.t || 'none';

		rpIdentityUtilService.getIdentity(function(identity) {
			$scope.me = (username.toLowerCase() === identity.name.toLowerCase());
			console.log('[rpUserCtrl] me: ' + $scope.me);
		});
		
		rpUserTabUtilService.setTab(where);
		console.log('[rpUserCtrl] where: ' + where);

		if (sort === 'top' || sort === 'controversial') {
			rpUserFilterButtonUtilService.show();
		} else {
			rpUserFilterButtonUtilService.hide();
		}

		rpTitleChangeService.prepTitleChange('u/' + username);

		/*
			Manage setting to open comments in a dialog or window.
		*/
		$scope.commentsDialog = rpSettingsUtilService.settings.commentsDialog;

		$rootScope.$emit('progressLoading');

		rpUserUtilService(username, where, sort, '', t, function(data) {
			$rootScope.$emit('progressComplete');
			
			if (data)
				rpTitleChangeService.prepTitleChange('u/' + data[0].data.author);
			
			$scope.posts = data;
			$scope.havePosts = true;
		});

		$scope.morePosts = function() {
			if ($scope.posts && $scope.posts.length > 0) {
				
				var lastPostName = $scope.posts[$scope.posts.length-1].data.name;
				
				if (lastPostName && !loadingMore) {
				
					loadingMore = true;
				
					$rootScope.$emit('progressLoading');
				
					rpUserUtilService(username, where, sort, lastPostName, t, function(data) {
						Array.prototype.push.apply($scope.posts, data);
						$rootScope.$emit('progressComplete');
						loadingMore = false;
					});
				
				}
			}
		};

		var deregisterUserSortClick = $rootScope.$on('user_sort_click', function(e, s){
			console.log('[rpUserCtrl] user_sort_click');
			$scope.posts = {};
			
			sort = s;

			$location.path('/u/' + username + '/' + where, false).search('sort=' + sort).replace();

			if (sort === 'top' || sort === 'controversial') {
				rpUserFilterButtonUtilService.show();
			} else {
				rpUserFilterButtonUtilService.hide();
			}

			$scope.havePosts = false;
			
			$rootScope.$emit('progressLoading');
			
			
			rpUserUtilService(username, where, sort, '', t, function(data) {
				
				$rootScope.$emit('progressComplete');
				
				$scope.posts = data;
				$scope.havePosts = true;

			});

		});

		var deregisterUserTClick = $rootScope.$on('user_t_click', function(e, time){
			console.log('[rpUserCtrl] user_t_click');
			$scope.posts = {};

			t = time;

			$location.path('/u/' + username + '/' + where, false).search('sort=' + sort + '&t=' + t).replace();

			$scope.havePosts = false;
			
			$rootScope.$emit('progressLoading');

			rpUserUtilService(username, where, sort, '', t, function(data) {
				
				$rootScope.$emit('progressComplete');
				
				$scope.posts = data;
				$scope.havePosts = true;

			});

		});

		var deregisterUserTabClick = $rootScope.$on('user_tab_click', function(e, tab) {
			console.log('[rpUserCtrl] user_tab_click');
			$scope.posts = {};
			
			where = tab;

			$location.path('/u/' + username + '/' + where, false).search('').replace();

			$scope.havePosts = false;
			$rootScope.$emit('progressLoading');
			
			rpUserUtilService(username, where, sort, '', t, function(data) {
				
				$rootScope.$emit('progressComplete');
				
				$scope.posts = data;
				$scope.havePosts = true;

			});
		});

		$scope.savePost = function(post) {
				
			rpSaveUtilService(post);

		};

		$scope.upvotePost = function(post) {

			rpUpvoteUtilService(post);

		};
		
		$scope.downvotePost = function(post) {
			
			rpDownvoteUtilService(post);

		};

		$scope.showCommentsUser = function(e, post) {
			var id = post.data.link_id || post.data.name;
			rpByIdUtilService(id, function(data) {
			
				if ($scope.commentsDialog && !e.ctrlKey) {
					$mdDialog.show({
						controller: 'rpCommentsDialogCtrl',
						templateUrl: 'partials/rpCommentsDialog',
						targetEvent: e,
						// parent: angular.element('#rp-content'),
						locals: {
							post: data
						},
						clickOutsideToClose: true,
						escapeToClose: false

					});
				
				} else {
					rpLocationUtilService(e, '/r/' + data.data.subreddit + '/comments/' + data.data.id, '', true, false);
				}

			});
		};

		$scope.showContext = function(e, post) {
			console.log('[rpUserCtrl] showContext()');

			if ($scope.commentsDialog && !e.ctrlKey) {
			
				var id = post.data.link_id || post.data.name;

				rpByIdUtilService(id, function(data) {
					
					data.comment = post.data.id;
					data.context = 8;
					$mdDialog.show({
						controller: 'rpCommentsDialogCtrl',
						templateUrl: 'partials/rpCommentsDialog',
						targetEvent: e,
						locals: {
							post: data
						},
						clickOutsideToClose: true,
						escapeToClose: false

					});
				});

			} else {

				rpLocationUtilService(e, '/r/' + post.data.subreddit + 
					'/comments/' + 
					$filter('rp_name_to_id36')(post.data.link_id) + 
					'/' + post.data.id + '/', 'context=8', true, false);
			}
		};

		$scope.$on('$destroy', function() {
			deregisterUserTClick();
			deregisterUserSortClick();
			deregisterUserTabClick();
		});
	}
]);

rpUserControllers.controller('rpUserReplyCtrl', ['$scope', 'rpPostCommentUtilService', 
	function($scope, rpPostCommentUtilService) {
		
		$scope.postReply = function(name, comment) {

			rpPostCommentUtilService(name, comment, function(data) {

				$scope.reply = "";
				$scope.rpPostReplyForm.$setUntouched();

			});

		};
	}
]);

rpUserControllers.controller('rpUserTabsCtrl', ['$scope', '$rootScope', 'rpUserTabUtilService', 'rpUserSortButtonUtilService',
	
	function($scope, $rootScope, rpUserTabUtilService, rpUserSortButtonUtilService) {
	
		selectTab();
		var firstLoadOver = false;

		$scope.tabClick = function(tab) {
			console.log('[rpUserTabsCtrl] tabClick()');
			
			if (firstLoadOver) {
				$rootScope.$emit('user_tab_click', tab);
				rpUserTabUtilService.setTab(tab);
				
			} else {
				firstLoadOver = true;
			}
		};

		var deregisterUserTabChange = $rootScope.$on('user_tab_change', function(e, tab){
			console.log('[rpUserTabsCtrl] user_tab_change');

			selectTab();
		});

		function selectTab() {
			console.log('[rpUserTabsCtrl] selectTab()');

			var tab = rpUserTabUtilService.tab;

			if (tab === 'overview' || tab === 'submitted' || tab === 'comments') {
				rpUserSortButtonUtilService.show();
			} else {
				rpUserSortButtonUtilService.hide();
			}

			switch(tab) {
				case 'overview':
					$scope.selectedIndex = 0;
					break;
				case 'submitted':
					$scope.selectedIndex = 1;
					break;
				case 'comments':
					$scope.selectedIndex = 2;
					break;
				case 'gilded':
					$scope.selectedIndex = 3;
					break;
				
				case 'upvoted':
					$scope.selectedIndex = 4;
					break;
				case 'downvoted':
					$scope.selectedIndex = 5;
					break;
				case 'hidden':
					$scope.selectedIndex = 6;
					break;
				case 'saved':
					$scope.selectedIndex = 7;
					break;

				default:
					$scope.selectedIndex = 0;
					break;
			}
		}

		$scope.$on('$destroy', function() {
			deregisterUserTabChange();
		});
	}
]);

rpUserControllers.controller('rpUserSortCtrl', ['$scope', '$rootScope', 'rpUserFilterButtonUtilService',
	function($scope, $rootScope, rpUserFilterButtonUtilService) {
		$scope.selectSort = function(value) {
			console.log('[rpUserSortCtrl] selectSort()');

			if (value === 'top' || value === 'controversial') {
				rpUserFilterButtonUtilService.show();
			} else {
				rpUserFilterButtonUtilService.hide();
			}

			$rootScope.$emit('user_sort_click', value);
		};
	}
]);

rpUserControllers.controller('rpUserTimeFilterCtrl', ['$scope', '$rootScope', 
	function($scope, $rootScope) {
		$scope.selectTime = function(value){
			console.log('[rpUserTimeFilterCtrl] selectTime()');

			$rootScope.$emit('user_t_click', value);
		};
	}
]);
