(function () {
  'use strict';

  angular
    .module('rpShare')
    .controller('rpShareEmailCtrl', [
      '$scope',
      '$rootScope',
      '$routeParams',
      'rpIdentityService',
      'rpAppTitleChangeService',
      'rpToolbarButtonVisibilityService',
      rpShareEmailCtrl
    ]);

  function rpShareEmailCtrl(
    $scope,
    $rootScope,
    $routeParams,
    rpIdentityService,
    rpAppTitleChangeService,
    rpToolbarButtonVisibilityService
  ) {
    console.log('[rpShareCtrl]');

    rpIdentityService.getIdentity(function (identity) {
      console.log('[rpShareEmailCtrl] identity: ' + JSON.stringify(identity));
      $scope.identity = identity;

      if ($routeParams.shareTitle) {
        $scope.shareTitle = $routeParams.shareTitle;
      }

      if ($routeParams.shareLink) {
        $scope.shareLink = $routeParams.shareLink;
      }

      if (!$scope.dialog) {
        rpToolbarButtonVisibilityService.hideAll();
        $rootScope.$emit('rp_tabs_hide');
      }

      if (!$scope.dialog) {
        rpAppTitleChangeService('share via email', true, true);
      }
    });
  }
}());