(function () {
  'use strict';

  function rpMessageComposeFormCtrl(
    $scope,
    $rootScope,
    $timeout,
    $mdDialog,
    $window,
    rpMessageComposeService,
    rpAppLocationService
  ) {
    var shareMessage = false;

    $scope.showText = false;
    $scope.messageSending = false;
    $scope.showSend = true;
    // $timeout(angular.noop, 0);
    console.log('[rpMessageComposeFormCtrl] $scope.shareLink: ' + $scope.shareLink);

    if (angular.isDefined($scope.shareLink) && $scope.shareLink !== null) {
      shareMessage = true;

      $scope.subject = 'Check this out, ' + $scope.shareTitle;
      $scope.text = $scope.shareLink;
    }

    // $scope.rpMessageComposeForm.$setUntouched();

    function clearForm() {
      if (!shareMessage) {
        $scope.subject = '';
        $scope.text = '';
      }
      $scope.to = '';

      $scope.rpMessageComposeForm.$setUntouched();
    }

    console.log('close foo');
    $scope.closeDialog = function (e) {
      console.log('[rpMessageComposeFormCtrl] closeDialog(), $scope.dialog: ' + $scope.dialog);

      if ($scope.dialog) {
        console.log('[rpMessageComposeFormCtrl] closeDialog: Dialog.');
        clearForm();
        $mdDialog.hide();
      } else {
        console.log('[rpMessageComposeFormCtrl] closeDialog: $window.history.length: ' + $window.history.length);
        if ($window.history.length > 1) {
          $window.history.back();
        } else {
          rpAppLocationService(null, '/', '', true, false);
        }
      }
    };

    $scope.sendMessage = function () {
      console.log('[rpMessageComposeFormCtrl] sendMessage(), $scope.iden: ' + $scope.iden);
      console.log('[rpMessageComposeFormCtrl] sendMessage(), $scope.captcha: ' + $scope.captcha);

      $scope.messageSending = true;
      // $timeout(angular.noop, 0);


      rpMessageComposeService($scope.subject, $scope.text, $scope.to, $scope.iden, $scope.captcha, function (
        err,
        data
      ) {
        $scope.messageSending = false;
        $timeout(angular.noop, 0);


        if (err) {
          let errorBody = JSON.parse(err.body);

          console.log('[rpMessageComposeFormCtrl] err.body: ' + err.body);
          console.log('[rpMessageComposeFormCtrl] errorBody: ' + JSON.stringify(errorBody));

          if (errorBody.json.errors[0][0] === 'BAD_CAPTCHA') {
            $rootScope.$emit('rp_reset_captcha');

            $scope.feedbackMessage = 'You entered the CAPTCHA incorrectly. Please try again.';

            $scope.showFeedbackAlert = true;
            $scope.showFeedback = true;

            $scope.showButtons = true;
          } else {
            $rootScope.$emit('rp_reset_captcha');
            $scope.feedbackMessage = errorBody.json.errors[0][1];
            $scope.showFeedbackAlert = true;
            $scope.showFeedback = true;
          }
        } else {
          $scope.feedbackMessage = 'Your message was sent successfully :)';
          $scope.showFeedbackAlert = false;
          $scope.showFeedback = true;
          $scope.showSendAnother = true;
          $scope.showSend = false;
        }
      });
    };

    $scope.sendAnother = function () {
      clearForm();
      $rootScope.$emit('rp_reset_captcha');
      $scope.showFeedback = false;
      $scope.showSendAnother = false;
      $scope.showSend = true;
    };
  }

  angular.module('rpMessageCompose')
    .controller('rpMessageComposeFormCtrl', ['$scope',
      '$rootScope',
      '$timeout',
      '$mdDialog',
      '$window',
      'rpMessageComposeService',
      'rpAppLocationService',
      rpMessageComposeFormCtrl
    ]);
}());
