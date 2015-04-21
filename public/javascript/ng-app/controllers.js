'use strict';

/* Controllers */

var redditPlusControllers = angular.module('redditPlusControllers', []);

/*
	Top level controller.
	controls sidenav toggling. (This might be better suited for the sidenav controller no?)
 */
redditPlusControllers.controller('AppCtrl', ['$scope', '$timeout', '$mdSidenav', '$log', 'titleChangeService',
	function($scope, $timeout, $mdSidenav, $log, titleChangeService) {
	$scope.appTitle = 'reddit: the frontpage of the internet';

	$scope.$on('handleTitleChange', function(e, d) {
		$scope.appTitle = titleChangeService.title;
	});

		$scope.toggleLeft = function() {
		$mdSidenav('left').toggle();
	};

	$scope.close = function() {
		$mdSidenav('left').close();
	};
	}
]);

redditPlusControllers.controller('identityCtrl', ['$scope', 'identityService',
	function($scope, identityService){
	$scope.identity = identityService.query();
	}]
);

redditPlusControllers.controller('toastCtrl', ['$scope', '$rootScope', '$mdToast', 'toastMessage',
	function($scope, $rootScope, $mdToast, toastMessage){
		$scope.toastMessage = toastMessage;

		$scope.closeToast = function() {
			$mdToast.close();
		};

	}
]);

// redditPlusControllers.controller('LeftCtrl', function($scope, $timeout, $mdSidenav, $log) {
//   $scope.close = function() {
// 	$mdSidenav('left').close();
//   };
// });

/*
	Toolbar controller handles title change through titleService.
 */
redditPlusControllers.controller('toolbarCtrl', ['$scope', '$rootScope', '$log', 'titleChangeService',
	function($scope, $rootScope, $log, titleChangeService) {
		$scope.filter = false;

	$scope.toolbarTitle = 'reddit: the frontpage of the internet';
	$scope.$on('handleTitleChange', function(e, d) {
		$scope.toolbarTitle = titleChangeService.title;
	});

	$rootScope.$on('tab_change', function(e, tab) {
		if (tab == 'top' || tab == 'controversial') {
			$scope.filter = true;
		} else {
			$scope.filter = false;
		}
	});
	}
]);

redditPlusControllers.controller('tabsCtrl', ['$scope', '$rootScope', '$log', 'subredditService',
	function($scope, $rootScope, $log, subredditService) {
	$scope.subreddit = 'all';
	$scope.selectedIndex = 0;

	$scope.$on('handleSubredditChange', function(e, d){
		$scope.subreddit = subredditService.subreddit;
	});

	$rootScope.$on('tab_change', function(e, tab){
		switch(tab) {
			case 'hot':
				$scope.selectedIndex = 0;
				break;
			case 'new':
				$scope.selectedIndex = 1;
				break;
			case 'rising':
				$scope.selectedIndex = 2;
				break;
			case 'controversial':
				$scope.selectedIndex = 3;
				break;
			case 'top':
				$scope.selectedIndex = 4;
				break;
			default:
				$scope.selectedIndex = 0;
				break;
		}
	});

	$scope.tabClick = function(tab){
		$rootScope.$emit('tab_click', tab);
	};
	}
]);

redditPlusControllers.controller('timeFilterCtrl', ['$scope', '$rootScope', 
	function($scope, $rootScope) {
		$scope.selectTime = function(value){
			$rootScope.$emit('t_click', value);
		};

	}
]);



redditPlusControllers.controller('commentsSortCtrl', ['$scope', '$rootScope',
	function($scope, $rootScope) {
		
		$scope.selectedIndex = 0;
		$scope.sort = 'confidence';

		$scope.commentsSort = function(sort){
			
			$rootScope.$emit('comments_sort', sort);
			switch(sort) {
				case 'confidence':
					$scope.selectedIndex = 0;
					$scope.sort = 'confidence';
					break;
				case 'top':
					$scope.selectedIndex = 1;
					$scope.sort = 'top';
					break;
				case 'new':
					$scope.selectedIndex = 2;
					$scope.sort = 'new';
					break;
				case 'hot':
					$scope.selectedIndex = 3;
					$scope.sort = 'hot';
					break;
				case 'controversial':
					$scope.selectedIndex = 4;
					$scope.sort = 'controversial';
					break;
				case 'old':
					$scope.selectedIndex = 5;
					$scope.sort = 'old';
					break;
				default:
					$scope.selectedIndex = 0;
					$scope.sort = 'confidence';
					break;
			}
		};
	}
]);

redditPlusControllers.controller('commentsCtrl', ['$scope', '$rootScope', '$mdDialog', 'post', 'commentsService',
	function($scope, $rootScope, $mdDialog, post, commentsService) {
		
		$scope.post = post;
		if (!$scope.sort)
			$scope.sort = 'confidence';

		getComments($scope, commentsService);

		$rootScope.$on('comments_sort', function(e, sort) {
			$scope.sort = sort;
			getComments($scope, commentsService);
		});

		$scope.closeDialog = function() {
			$mdDialog.hide();
		};

		$scope.upvotePost = function() {
			$rootScope.$emit('upvote_post', post);
		};

		$scope.downvotePost = function() {
			$rootScope.$emit('downvote_post', post);
		};

		$scope.savePost = function() {
			$rootScope.$emit('save_post', post);
		};

	}

]);

function getComments(scope, commentsService) {
	scope.threadLoading = true;
	commentsService.query({
		subreddit: scope.post.data.subreddit, 
		article: scope.post.data.id,
		sort: scope.sort
	}, function(data) {
		scope.comments = data[1].data.children;
		scope.threadLoading = false;
	});
}

redditPlusControllers.controller('commentCtrl', ['$scope', '$rootScope', '$element', '$compile', 'moreChildrenService',
	function($scope, $rootScope, $element, $compile, moreChildrenService) {

		if ($scope.comment.data.replies) {
			$scope.childDepth = $scope.depth + 1;
		}

		$scope.showReply = false;

		$scope.showMore = function() {
			$scope.loadingMoreChildren = true;
			moreChildrenService.query({
				sort: $scope.sort,
				link_id: $scope.post.data.name,
				children: $scope.comment.data.children.join(",")
			}, function(data) {
				$scope.loadingMoreChildren = false;
				$scope.moreChildren = data.json.data.things;
				console.log("[moreChildren.length]" + $scope.moreChildren.length);
				$compile("<rp-comment ng-repeat='comment in moreChildren' comment='comment' depth='depth' post='post' sort='sort'></rp-comment>")($scope, function(cloned, scope) {
					$element.replaceWith(cloned);
				});				
			});
		};

		$scope.toggleReply = function() {
			$scope.showReply = !$scope.showReply;
		};

		$scope.upvotePost = function() {
			$rootScope.$emit('upvote_post', $scope.comment);
		};

		$scope.downvotePost = function() {
			$rootScope.$emit('downvote_post', $scope.comment);
		};

		$scope.savePost = function() {
			$rootScope.$emit('save_post', $scope.comment);
		};		


	}
]);

redditPlusControllers.controller('commentMediaCtrl', ['$scope', 
	function($scope) {
		console.log('[rpCommentMediaCtrl]');
	}
]);


/*
	Post Media Controller
	controls revealing an embedded video
 */
redditPlusControllers.controller('embedCtrl', ['$scope', '$log',
	function($scope, $log) {

	$scope.post.showEmbed = false;

	$scope.show = function() {
		$scope.post.showEmbed = true;
	};

	$scope.hide = function() {
		$scope.post.showEmbed = false;
	};

	}
]);

/*
	Post Media Controller
	controls revealing a video
 */
redditPlusControllers.controller('videoCtrl', ['$scope', '$log',
	function($scope, $log) {

	$scope.post.showVideo = false;

	$scope.show = function() {
		$scope.post.showVideo = true;
	};

	$scope.hide = function() {
		$scope.post.showVideo = false;
	};

	}
]);

redditPlusControllers.controller('tweetCtrl', ['$scope', '$log', 'tweetService',
	function($scope, $log, tweetService) {
	$scope.tweet = "";
	var id = $scope.post.data.url.substring($scope.post.data.url.lastIndexOf('/')+1);
	var data = tweetService.query({id: id}, function(data){
		$scope.tweet = data.html;
	//   twttr.widgets.load();
	});
	}
]);

/*
	Sidenav Subreddits Controller
	Gets popular subreddits.
 */
redditPlusControllers.controller('subredditsCtrl', ['$scope', 'subredditsService',
	function($scope, subredditsService){
		$scope.subs = subredditsService.query();
	}
]);

/*
	Imgur Album Info, [not working]
 */
redditPlusControllers.controller('imgurAlbumCtrl',
		[
			'$scope',
			'$log',
			'$routeParams',
			'imgurAlbumService',
			'imgurGalleryService',
	function($scope, $log, $routeParams, imgurAlbumService, imgurGalleryService){
	var imageIndex = 0;
	var selectedImageId = "";
	$scope.currentImage = 0;
	$scope.currentImageUrl = "";
	$scope.imageDescription = "";
	$scope.imageTitle = "";

	var url = $scope.post.data.url;

	//get last segment of url and remove unwanted stuff
	if (url.indexOf('/gallery/') > 0) {
		if (url.indexOf('/new') > 0) {
		url = url.substring(0, url.indexOf('/new'));
		}
	}

		//more crap that you find in imgur urls
	var id = url.substring(url.lastIndexOf('/')+1)
		.replace('?gallery', '')
		.replace('#0', '')
		.replace('?1', '');

		// ...
	if (id.indexOf('#') > 0) {
		selectedImageId = id.substr(id.lastIndexOf('#')+1);
		id = id.substring(0, id.lastIndexOf('#'));
	}


		//START SETTINGS ALBUM INFO.

	//some albums are just a comma separated list of images
	if (id.indexOf(',') > 0) { //implicit album (comma seperated list of image ids)
		var images = [];
		var imageIds = id.split(',');
		imageIds.forEach(function(value, i){
		images.push({"link" : "http://i.imgur.com/" + value + ".jpg"});
		});

		$scope.album = {
		"data" : {
			"images_count": imageIds.length,
			"images": images
		}
		};
		setCurrentImage();
	}


		//Not an Album but a Gallery. Use the Gallery Service.
		else {

		if (url.indexOf('/gallery/') > 0) {
			// imgurGalleryAlbumService.query({id: id}, function(data){
			imgurGalleryService.query({id: id}, function(gallery){

								if (gallery.data.is_album) {

										$scope.album = gallery;

						if (selectedImageId) {
							imageIndex = findImageById(selectedImageId, $scope.album.data.images);
						}

						setCurrentImage();

								} else {

										// $log.log('Gallery Image: ' + id);

										var images = [];
										images[0] = {
											"link": gallery.data.link
										};

										$scope.album = {
											"data" : {
												"images_count": 1,
												"images": images
											}
										};

										setCurrentImage();

								}

				}, function(error) {
									$log.log('Error retrieving Gallery data, ' + id);
									$log.log(error);
				});
		}

				//An actual Album! use the album service.
				else {
			imgurAlbumService.query({id: id}, function(album) {
				$scope.album = album;

				if(selectedImageId) {
					imageIndex = findImageById(selectedImageId, $scope.album.data.images);
				}

				setCurrentImage();
				}, function(error) {
					var images = [];
					images[0] = {
					"link": 'http://i.imgur.com/' + id + '.jpg'
					};

					$scope.album = {
					"data" : {
						"images_count": 1,
						"images": images
					}
					};
					setCurrentImage();
				});
		}
	}

	$scope.prev = function(n) {
		$scope.$emit('album_image_change');
		if(--imageIndex < 0)
		imageIndex = n-1;
		setCurrentImage();
	};

	$scope.next = function(n) {
		$scope.$emit('album_image_change');
		if(++imageIndex == n)
		imageIndex = 0;
		setCurrentImage();
	};

	function setCurrentImage() {
		$scope.currentImageUrl = $scope.album.data.images[imageIndex].link;
		$scope.imageDescription = $scope.album.data.images[imageIndex].description;
		$scope.imageTitle = $scope.album.data.images[imageIndex].title;
		$scope.currentImage = imageIndex+1;
	}

	function findImageById(id, images) {
		for (var i = 0; i < images.length; i++) {
			if (images[i].id == id) {
				return i;
			}
		}
	}

	}
]);

// redditPlusControllers.controller('imgurAlbumCtrl', ['$scope', '$routeParams', '$log', 'imgAlbumService',
//   function($scope, $routeParams, $log, imgurAlbumService){
//     $log.log('[imgurAlbumCtrl]');
//   }
// ]);

/*
	Progress bar controller.
	based on https://github.com/chieffancypants/angular-loading-bar
	need to adjust increment numbers, loading bar can finish then jump back when refreshing.
 */
redditPlusControllers.controller('progressCtrl', ['$scope', '$rootScope', '$log', '$timeout',

	function($scope, $rootScope, $log, $timeout){

			$scope.loading = false;

			$rootScope.$on('progressLoading', function(e, d){
				// $log.log('progressLoading');
				$scope.loading = true;
			});

			$rootScope.$on('progressComplete', function(e,d){
				// $log.log('progressComplete');
					 $scope.loading = false;
			});
		}

]);

// redditPlusControllers.controller('progressCtrl', ['$scope', '$rootScope', '$log', '$timeout',
//   function($scope, $rootScope, $log, $timeout){
// 	$scope.value = 0.2;
// 	$scope.loading = true;
// 	var incTimeout = 0;
//
// 	$rootScope.$on('progressLoading', function(e, d){
// 	  // $log.log('progressLoading');
// 	  $scope.loading = true;
// 	  set(20);
// 	});
// 	$rootScope.$on('progressComplete', function(e,d){
// 	  // $log.log('progressComplete');
// 	  set(100);
// 	  $timeout(function(){
// 		$scope.loading = false;
// 	  }, 600);
// 	});
// 	$rootScope.$on('progress', function(e, d){
// 	  // $log.log('progress: ' + d.value);
// 	  set(d.value);
// 	});
//
// 	function set(n) {
// 	  if ($scope.loading === false) return;
// 	  $scope.value = n;
//
// 	  $timeout.cancel(incTimeout);
// 	  incTimeout = $timeout(function(){
// 		inc();
// 	  }, 750);
// 	}
//
//
// 	function inc() {
// 	  var rnd = 0;
// 		// TODO: do this mathmatically instead of through conditions
// 		var stat = $scope.value/100;
// 		if (stat >= 0 && stat < 0.25) {
// 		  // Start out between 3 - 6% increments
// 		  rnd = (Math.random() * (5 - 3 + 1) + 3) / 100;
// 		} else if (stat >= 0.25 && stat < 0.65) {
// 		  // increment between 0 - 3%
// 		  rnd = (Math.random() * 3) / 100;
// 		} else if (stat >= 0.65 && stat < 0.9) {
// 		  // increment between 0 - 2%
// 		  rnd = (Math.random() * 2) / 100;
// 		} else if (stat >= 0.9 && stat < 0.99) {
// 		  // finally, increment it .5 %
// 		  rnd = 0.005;
// 		} else {
// 		  // after 99%, don't increment:
// 		  rnd = 0;
// 		}
// 		// $log.log("RANDOM INC: " + rnd*1000);
// 		$scope.value += rnd*500;
// 	}
//   }
// ]);
