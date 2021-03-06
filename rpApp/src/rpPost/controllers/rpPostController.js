(function () {
  'use strict';

  function rpPostCtrl(
    $scope,
    $rootScope,
    $routeParams,
    $window,
    $filter,
    $timeout,
    $q,
    $location,
    rpPostService,
    rpAppTitleService,
    rpSubredditsService,
    rpAppLocationService,
    rpAppAuthService,
    rpIdentityService,
    rpToolbarButtonVisibilityService,
    rpSettingsService,
    rpProgressService,
    rpRefreshButtonService
  ) {
    // load limits
    const LOAD_LIMIT = 48;
    const MORE_LIMIT = 24;
    const INJECT_ADS = false;

    // load tracking
    var currentLoad = 0;
    var afterPost = 1;
    var loadingMore = false;
    var thisLoad;

    // event handlers
    var deregisterSettingsChanged;
    var deregisterPostTimeClick;
    var deregisterSlideshowGetShowSub;
    var deregisterSlideshowGetPost;
    var deregisterWindowResize;
    var deregisterRefresh;
    var deregisterPostSortClick;
    var deregisterHidePost;
    var deregisterLayoutWatcher;
    var deregisterMorePosts;
    var addNextPost;

    rpToolbarButtonVisibilityService.hideAll();
    rpToolbarButtonVisibilityService.showButton('showPostSort');
    rpToolbarButtonVisibilityService.showButton('showLayout');

    console.log('[rpPostCtrl]');

    function injectAds(data, start, MAX) {
      console.log('[rpPostCtrl] injectAds, data.length: ' + data.length);
      let interval = 6;
      let count = 1;

      return new Promise((resolve, reject) => {
        data.splice(start, 0, {
          isAd: true,
          data: {
            name: start
          }
        });
        for (let i = start; i < data.length; i++) {
          if (i % interval === 0) {
            data.splice(i, 0, {
              isAd: true,
              data: {
                name: i
              }
            });
            count++;
          }
          if (count >= MAX) {
            break;
          }
        }
        resolve(data);
      });
    }

    /*
      Load Posts
     */
    function getColumn(putInShortest) {
      var shortestColumn;
      var shortestHeight;
      var columns = angular.element('.rp-col-wrapper');

      if (putInShortest) {
        columns.each(function (i) {
          var thisHeight = jQuery(this).height();
          if (
            angular.isUndefined(shortestColumn) ||
            thisHeight < shortestHeight
          ) {
            shortestHeight = thisHeight;
            shortestColumn = i;
          }
        });

        return shortestColumn;
      }
      return $scope.posts.length % columns.length;
    }

    // Adds a posts one at a time,
    function addPosts(posts, putInShortest) {
      let duplicate = false;
      let post = posts.shift();

      if (!post.isAd) {
        for (let i = 0; i < $scope.posts.length; i++) {
          if (!$scope.posts[i].isAd && $scope.posts[i].data.id === post.data.id) {
            if ($scope.posts[i].data.id === post.data.id) {
              duplicate = true;
              break;
            }
          }
        }
      }

      if (duplicate === false && !(post.data || {}).hidden) {
        post.column = getColumn(putInShortest);
        $scope.posts.push(post);
      }

      addNextPost = $timeout(function () {
        console.log('[rpPostCtrl()] addPosts() addNextPost()');
        if (posts.length > 0) {
          addPosts(posts, putInShortest);
        }
      }, 50);
    }

    function addBatch(first, last, posts) {
      console.log('[rpPostCtrl] addBatch(), first: ' +
          first +
          ', last: ' +
          last +
          ', $scope.posts.length: ' +
          $scope.posts.length);

      if ($scope.posts.length > 0) {
        $scope.posts = Array.prototype.concat.apply(
          $scope.posts,
          posts.slice(first, last)
        );
      } else {
        $scope.posts = posts.slice(first, last);
      }

      return $timeout(angular.noop, 0);
    }

    function addPostsInBatches(posts, batchSize) {
      var addNextBatch;
      var addPostsAndRender = $q.when();
      var i;
      console.log('[rpPostCtrl] addPostsInBatches(), posts.length: ' +
          posts.length +
          ', batchSize: ' +
          batchSize);

      for (i = 0; i < posts.length; i += batchSize) {
        addNextBatch = angular.bind(
          null,
          addBatch,
          i,
          Math.min(i + batchSize, posts.length),
          posts
        );
        addPostsAndRender = addPostsAndRender.then(addNextBatch);
      }

      return addPostsAndRender;
    }

    function loadPosts() {
      console.log('[rpPostCtrl] loadPosts()');
      thisLoad = ++currentLoad;

      // If posts are currently being added to scope, cancel adding additional posts
      if (angular.isDefined(addNextPost)) {
        $timeout.cancel(addNextPost);
      }

      $scope.posts = [];
      $scope.havePosts = false;
      $scope.noMorePosts = false;
      rpProgressService.showProgress();

      rpPostService(
        $scope.subreddit,
        $scope.sort,
        '',
        $scope.t,
        LOAD_LIMIT,
        function (err, data) {
          console.log('[rpPostCtrl] load-tracking loadPosts(), currentLoad: ' +
              currentLoad +
              ', thisLoad: ' +
              thisLoad);

          if (thisLoad === currentLoad) {
            rpProgressService.hideProgress();

            if (err) {
              console.log('[rpPostCtrl] err.status: ' + JSON.stringify(err.status));
            } else {
              console.log('[rpPostCtrl] data.length: ' + data.get.data.children.length);
              $scope.havePosts = true;
              rpToolbarButtonVisibilityService.showButton('showRefresh');
              rpToolbarButtonVisibilityService.showButton('showSlideshow');

              rpRefreshButtonService.stopSpinning();

              if (data.get.data.children.length < LOAD_LIMIT) {
                $scope.noMorePosts = true;
              } else {
                $scope.noMorePosts = false;
              }

              if (data.get.data.children.length > 0) {
                if ($scope.subreddit === 'random') {
                  $scope.subreddit = data.get.data.children[0].data.subreddit;
                  rpAppTitleService.changeTitles('r/' + $scope.subreddit);
                  rpAppLocationService(
                    null,
                    '/r/' + $scope.subreddit,
                    '',
                    false,
                    true
                  );
                  console.log('[rpPostCtrl] loadPosts() random, subreddit: ' +
                      $scope.subreddit);
                  console.log('[rpPostCtrl] loadPosts() random, subreddit: ' +
                      $scope.subreddit);
                }

                if (INJECT_ADS) {
                  injectAds(data.get.data.children, 1, 1).then(data => {
                    console.log('[rpPostCtrl] after injecting ads, data.length: ' +
                        data.length);
                    addPosts(data, false);
                  });
                } else {
                  addPosts(data.get.data.children, false);
                }


                if (angular.isUndefined(deregisterLayoutWatcher)) {
                  deregisterLayoutWatcher = $scope.$watch(
                    () => {
                      return rpSettingsService.getSetting('layout');
                    },
                    (newVal, oldVal) => {
                      if (newVal !== oldVal) {
                        loadPosts();
                      }
                    }
                  );
                }

                $timeout(function () {
                  $window.prerenderReady = true;
                }, 10000);
              }
            }
          }
        }
      );
    }

    function initPostCtrl() {
      if (rpAppAuthService.isAuthenticated) {
        rpIdentityService.getIdentity(function (identity) {
          $scope.identity = identity;
        });
      }

      $scope.subreddit = $routeParams.sub;
      $scope.sort = $routeParams.sort ? $routeParams.sort : 'hot';
      $scope.t = angular.isDefined($routeParams.t) ? $routeParams.t : 'week';

      if (angular.isUndefined($scope.subreddit)) {
        rpAppTitleService.changeTitles('frontpage');
      } else if ($scope.subreddit === 'all') {
        rpAppTitleService.changeTitles('r/all');
      }

      if (angular.isDefined($scope.subreddit) && $scope.subreddit !== 'all') {
        $scope.showSub = false;
        rpAppTitleService.changeTitles('r/' + $scope.subreddit);
        rpSubredditsService.setSubreddit($scope.subreddit);
        rpToolbarButtonVisibilityService.showButton('showSubscribe');
        rpToolbarButtonVisibilityService.showButton('showRules');
      } else {
        $scope.showSub = true;
        rpToolbarButtonVisibilityService.hideButton('showSubscribe');
        rpToolbarButtonVisibilityService.hideButton('showRules');
        rpSubredditsService.resetSubreddit();
      }

      if ($scope.sort === 'top' || $scope.sort === 'controversial') {
        rpToolbarButtonVisibilityService.showButton('showPostTime');
      }

      loadPosts();

      console.log(`[rpPostCtrl] $scope.subreddit: ${$scope.subreddit}`);
      console.log('[rpPostCtrl] $scope.sort: ' + $scope.sort);
      console.log('[rpPostCtrl] rpSubredditsService.currentSub: ' +
          rpSubredditsService.currentSub);
    }

    /**
     * SCOPE FUNCTIONS
     * */
    $scope.thisController = this;

    this.completeDeleting = function (id) {
      console.log('[rpPostCtrl] this.completeDeleting()');

      $scope.posts.forEach(function (postIterator, i) {
        if (postIterator.data.name === id) {
          $scope.posts.splice(i, 1);
        }
      });
    };

    $scope.showContext = function (e, post) {
      console.log('[rpPostCtrl] showContext()');

      rpAppLocationService(
        e,
        '/r/' +
          post.data.subreddit +
          '/comments/' +
          $filter('rpAppNameToId36Filter')(post.data.link_id) +
          '/' +
          post.data.id +
          '/',
        'context=8',
        true,
        false
      );
    };

    $scope.morePosts = function () {
      console.log('[rpPostCtrl] morePosts(), loadingMore: ' + loadingMore);

      if ($scope.posts && $scope.posts.length > 0) {
        // calculating the last post to use as after in posts request

        // only use if no ads
        // let lastPostName =
        //   $scope.posts[$scope.posts.length - afterPost].data.name;

        // use this if there are ads present
        let lastPostName;

        for (let i = $scope.posts.length - 1; i > 0; i--) {
          if (!$scope.posts[i].isAd) {
            lastPostName = $scope.posts[i].data.name;
            break;
          }
        }

        console.log('[rpPostCtrl] morePosts(), 1, lastPostName: ' +
            lastPostName +
            ', loadingMore: ' +
            loadingMore);

        if (lastPostName && !loadingMore) {
          console.log('[rpPostCtrl] morePosts(), 2');
          loadingMore = true;
          rpProgressService.showProgress();

          thisLoad = ++currentLoad;

          rpPostService(
            $scope.subreddit,
            $scope.sort,
            lastPostName,
            $scope.t,
            MORE_LIMIT,
            function (err, data) {
              console.log('[rpPostCtrl] load-tracking morePosts(), thisLoad: ' +
                  thisLoad +
                  ', currentLoad: ' +
                  currentLoad);

              if (thisLoad === currentLoad) {
                console.log('[rpPostCtrl] morePosts(), 3');

                rpProgressService.hideProgress();

                if (err) {
                  console.log('[rpPostCtrl] err');
                } else {
                  console.log('[rpPostCtrl] morePosts(), data.length: ' +
                      data.get.data.children.length);

                  if (data.get.data.children.length < MORE_LIMIT) {
                    $scope.noMorePosts = true;
                  } else {
                    $scope.noMorePosts = false;
                  }

                  if (data.get.data.children.length > 0) {
                    afterPost = 1;
                    addPosts(data.get.data.children, true);
                  } else {
                    console.log('[rpPostCtrl] morePosts(), no more posts error, data: ' +
                        JSON.stringify(data));
                    loadingMore = false;
                    afterPost++;
                    $scope.morePosts();
                  }

                  // Array.prototype.push.apply($scope.posts, data.get.data.children);
                  // addPostsInBatches(data.get.data.children, 6);
                }
              }

              loadingMore = false;
            }
          );
        } else if (loadingMore === true) {
          rpProgressService.showProgress();
        }
      }
    };

    /**
     * EVENT HANDLERS
     */

    deregisterPostSortClick = $rootScope.$on('rp_post_sort_click', function (
      e,
      sort
    ) {
      console.log('[rpPostCtrl] onTabClick(), tab: ' + sort);

      $scope.posts = {};
      $scope.noMorePosts = false;
      $scope.sort = sort;

      if ($scope.subreddit) {
        rpAppLocationService(
          null,
          '/r/' + $scope.subreddit + '/' + $scope.sort,
          '',
          false,
          false
        );
      } else {
        rpAppLocationService(null, $scope.sort, '', false, false);
      }

      if (sort === 'top' || sort === 'controversial') {
        rpToolbarButtonVisibilityService.showButton('showPostTime');
      } else {
        rpToolbarButtonVisibilityService.hideButton('showPostTime');
      }

      loadPosts();
    });

    deregisterHidePost = $scope.$on('rp_hide_post', function (e, id) {
      var i;
      for (i = 0; i < $scope.posts.length; i++) {
        if ($scope.posts[i].data.name === id) {
          $scope.posts.splice(i, 1);
          $timeout(angular.noop, 0);
        }
      }
    });

    deregisterRefresh = $rootScope.$on('rp_refresh', function () {
      console.log('[rpPostCtrl] rp_refresh');
      rpRefreshButtonService.startSpinning();
      loadPosts();
    });

    deregisterWindowResize = $rootScope.$on('rp_window_resize', function (
      e,
      to
    ) {
      var i;
      if (!angular.isUndefined($scope.posts)) {
        for (i = 0; i < $scope.posts.length; i++) {
          $scope.posts[i].column = i % to;
        }
      }
    });

    deregisterSlideshowGetPost = $rootScope.$on(
      'rp_slideshow_get_post',
      function (e, i, callback) {
        if (i >= $scope.posts.length / 2) {
          $scope.morePosts();
        }
        callback($scope.posts[i]);
      }
    );

    deregisterSlideshowGetShowSub = $rootScope.$on(
      'rp_slideshow_get_show_sub',
      function (e, callback) {
        callback($scope.showSub);
      }
    );

    deregisterPostTimeClick = $rootScope.$on('rp_post_time_click', function (
      e,
      time
    ) {
      $scope.t = time;

      if ($scope.subreddit) {
        rpAppLocationService(
          null,
          '/r/' + $scope.subreddit + '/' + $scope.sort,
          't=' + $scope.t,
          false,
          false
        );
      } else {
        rpAppLocationService(null, $scope.sort, 't=' + $scope.t, false, false);
      }

      if (angular.isDefined(addNextPost)) {
        $timeout.cancel(addNextPost);
      }
      loadPosts();
    });

    deregisterMorePosts = $rootScope.$on('rp_more_posts', function () {
      $scope.morePosts();
    });

    initPostCtrl();

    $scope.$on('$destroy', function () {
      console.log('[rpPostCtrl] $destroy, $scope.subreddit: ' + $scope.subreddit);
      deregisterSlideshowGetPost();
      deregisterSlideshowGetShowSub();
      deregisterPostTimeClick();
      deregisterPostSortClick();
      deregisterWindowResize();
      deregisterRefresh();
      deregisterHidePost();
      deregisterLayoutWatcher();
      deregisterMorePosts();
    });
  }

  angular
    .module('rpPost')
    .controller('rpPostCtrl', [
      '$scope',
      '$rootScope',
      '$routeParams',
      '$window',
      '$filter',
      '$timeout',
      '$q',
      '$location',
      'rpPostService',
      'rpAppTitleService',
      'rpSubredditsService',
      'rpAppLocationService',
      'rpAppAuthService',
      'rpIdentityService',
      'rpToolbarButtonVisibilityService',
      'rpSettingsService',
      'rpProgressService',
      'rpRefreshButtonService',
      rpPostCtrl
    ]);
}());
