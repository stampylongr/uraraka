(function () {
  'use strict';

  function rpShareEmailCtrl(
    $scope,
    $routeParams,
    rpIdentityService,
    rpAppTitleService,
    rpToolbarButtonVisibilityService
  ) {
    console.log('[rpShareEmailCtrl]');

    if ($routeParams.shareTitle) {
      $scope.shareTitle = $routeParams.shareTitle;
    }

    if ($routeParams.shareLink) {
      $scope.shareLink = $routeParams.shareLink;
    }

    if (!$scope.dialog) {
      rpToolbarButtonVisibilityService.hideAll();
      rpAppTitleService.changeTitles('share via email');
    }

    rpIdentityService.getIdentity(function (identity) {
      $scope.identity = identity;
    });
  }

  angular
    .module('rpShare')
    .controller('rpShareEmailCtrl', [
      '$scope',
      '$routeParams',
      'rpIdentityService',
      'rpAppTitleService',
      'rpToolbarButtonVisibilityService',
      rpShareEmailCtrl
    ]);
}());
