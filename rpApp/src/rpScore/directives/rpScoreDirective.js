(function () {
  'use strict';

  /**
   * Directive for score components
   * requires
   * score,
   * redditId of the post
   * boolean likes whether the user likes the post
   */
  function rpScore() {
    return {
      restrict: 'E',
      templateUrl: 'rpScore/views/rpScore.html',
      controller: 'rpScoreCtrl',
      scope: {
        score: '=',
        redditId: '=',
        likes: '='
      }
    };
  }

  angular.module('rpScore')
    .directive('rpScore', rpScore);
}());
