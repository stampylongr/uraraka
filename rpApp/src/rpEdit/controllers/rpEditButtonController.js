(function () {
  'use strict';

  function rpEditButtonCtrl($scope, $timeout) {
    console.log('[rpEditButtonCtrl]');

    $scope.parentCtrl.isEditing = false;
    // $timeout(angular.noop, 0);

    $scope.toggleEditing = function () {
      $scope.parentCtrl.isEditing = !$scope.parentCtrl.isEditing;
      // $timeout(angular.noop, 0);
    };
  }

  angular.module('rpEdit')
    .controller('rpEditButtonCtrl', [
      '$scope',
      '$timeout',
      rpEditButtonCtrl
    ]);
}());
