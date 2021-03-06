(function () {
  'use strict';

  function rpShareCtrl(
    $scope,
    $window,
    $filter,
    $mdBottomSheet,
    $mdDialog,
    rpAppLocationService,
    rpSettingsService,
    rpAppGoogleUrlService,
    rpAppAuthService,
    rpToastService,
    rpAppIsMobileViewService,
    rpLoginService,
    post
  ) {
    var shareLink = post
      ? 'https://uraraka.herokuapp.com' + post.data.permalink
      : 'https://uraraka.herokuapp.com';
    var shareTitle = post ? post.data.title : 'uraraka.herokuapp.com';
    var shareThumb = 'https://uraraka.herokuapp.com/images/reddup.png';
    var fbUrl;
    var text;

    console.log('[rpShareCtrl] $scope.$parent.animations: ' + $scope.$parent.animations);
    console.log('[rpShareCtrl] shareLink: ' + post.data.url);

    if (post && post.data.thumbnail !== '' && post.data.thumbnail !== 'self') {
      shareThumb = post.data.thumbnail;
    }

    $scope.items = [
      // {name: 'buffer', icon: '/icons/ic_warning_black_48px.svg'},
      {
        name: 'reddit user',
        icon: '/icons/reddit-square.svg'
      },
      {
        name: 'email',
        icon: '/icons/ic_email_black_48px.svg'
      },
      {
        name: 'twitter',
        icon: '/icons/twitter-box.svg'
      }
      // {
      //   name: 'facebook',
      //   icon: '/icons/facebook-box.svg'
      // },
    ];

    $scope.listItemClicked = function (e, $index) {
      console.log('[rpShareCtrl] listItemClicked, $index: ' + $index);

      $mdBottomSheet.hide();

      switch ($index) {
        case 0:
          if (rpAppAuthService.isAuthenticated) {
            if (
              (rpSettingsService.getSetting('composeDialog') && !e.ctrlKey) ||
              rpAppIsMobileViewService.isMobileView()
            ) {
              $mdDialog.show({
                controller: 'rpMessageComposeDialogCtrl',
                templateUrl:
                  'rpMessage/rpMessageCompose/views/rpMessageComposeDialog.html',
                clickOutsideToClose: false,
                escapeToClose: false,
                targetEvent: e,
                locals: {
                  shareLink: shareLink,
                  shareTitle: shareTitle
                }
              });
            } else {
              rpAppLocationService(
                e,
                '/message/compose/',
                'shareTitle=' + shareTitle + '&shareLink=' + shareLink,
                true,
                false
              );
            }
          } else {
            rpLoginService.showDialog();
          }

          break;

        case 1:
          console.log('[rpShareCtrl] email');

          if (rpAppAuthService.isAuthenticated) {
            if (
              (rpSettingsService.getSetting('composeDialog') && !e.ctrlKey) ||
              rpAppIsMobileViewService.isMobileView()
            ) {
              console.log('[rpShareCtrl] email, show email dialog...');
              $mdDialog.show({
                controller: 'rpShareEmailDialogCtrl',
                templateUrl: 'rpShare/views/rpShareEmailDialog.html',
                clickOutsideToClose: false,
                escapeToClose: false,
                targetEvent: e,
                locals: {
                  shareLink: shareLink,
                  shareTitle: shareTitle
                }
              });
            } else {
              rpAppLocationService(
                e,
                '/share/email/',
                'shareTitle=' + shareTitle + '&shareLink=' + shareLink,
                true,
                false
              );
            }
          } else {
            rpLoginService.showDialog();
          }

          break;

        case 2:
          console.log('[rpShareCtrl] twitter, shareTitle: ' + shareTitle);
          if (shareTitle.length + shareLink.length < 127) {
            text = shareTitle + ', ' + shareLink + ' via @reddup';

            $window.open(
              'https://twitter.com/intent/tweet?text=' +
                encodeURIComponent(text) +
                ' via @reddup',
              'Share with twitter',
              'height=500,width=500'
            );
          } else {
            rpAppGoogleUrlService(shareLink, function (err, data) {
              if (err) {
                console.log('[rp_twitter_message] error occurred shortening url.');
              } else {
                console.log('[rp_twitter_message] data.id: ' + data.id);
                console.log('[rp_twitter_message] shareTitle.length: ' + shareTitle.length);
                console.log('[rp_twitter_message] data.id.length: ' + data.id.length);

                if (shareTitle.length + data.id.length < 123) {
                  text = shareTitle + ', ' + data.id + ' via https://uraraka.herokuapp.com';
                } else {
                  console.log('[rp_twitter_message] use short title');

                  let shortTitle = shareTitle.substr(0, 123 - data.id.length);
                  text = shortTitle + '.. ' + data.id + ' via https://uraraka.herokuapp.com';
                }

                $window.open(
                  'https://twitter.com/intent/tweet?text=' +
                    encodeURIComponent(text),
                  'Share with twitter',
                  'height=500,width=500'
                );
              }
            });
          }

          break;

        case 3:
          console.log('[rpShareCtrl] facebook');
          console.log('[rpShareCtrl] facebook, shareThumb: ' + shareThumb);

          fbUrl =
            'https://www.facebook.com/dialog/feed?app_id=868953203169873&name=';
          fbUrl += encodeURIComponent(shareTitle);
          fbUrl += '&link=';
          fbUrl += encodeURIComponent(shareLink);
          fbUrl += '&redirect_uri=';
          fbUrl += encodeURIComponent('https://uraraka.herokuapp.com/facebookComplete');
          fbUrl += '&picture=';
          fbUrl += shareThumb;
          fbUrl += '&display=popup';

          $window.open(fbUrl, 'Share with facebook', 'height=500,width=500');

          break;

        default:
      }
    };
  }

  angular
    .module('rpShare')
    .controller('rpShareCtrl', [
      '$scope',
      '$window',
      '$filter',
      '$mdBottomSheet',
      '$mdDialog',
      'rpAppLocationService',
      'rpSettingsService',
      'rpAppGoogleUrlService',
      'rpAppAuthService',
      'rpToastService',
      'rpAppIsMobileViewService',
      'rpLoginService',
      'post',
      rpShareCtrl
    ]);
}());
