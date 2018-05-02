(function () {
  'use strict';

  function rpAppTitleChangeService($rootScope) {
    return function (title, page, toolbar) {
      console.log('[rpAppTitleChangeService] title: ' + title);

      if (page) {
        $rootScope.$emit('rp_title_change_page', title);
      }

      if (toolbar) {
        $rootScope.$emit('rp_title_change_toolbar', title);
      }
    };
  }

  angular.module('rpApp')
    .factory('rpAppTitleChangeService', [
      '$rootScope',
      rpAppTitleChangeService
    ]);
}());