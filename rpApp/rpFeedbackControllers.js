'use strict';

var rpFeedbackControllers = angular.module('rpFeedbackControllers', []);

rpFeedbackControllers.controller('rpFeedbackSidenavCtrl', [
    '$scope',
    '$mdDialog',
    'rpSettingsService',
    'rpLocationService',
    'rpAuthService',
    'rpToastUtilService',
    'rpIsMobileViewService',
    function(
        $scope,
        $mdDialog,
        rpSettingsService,
        rpLocationService,
        rpAuthService,
        rpToastUtilService,
        rpIsMobileViewService
    ) {

        console.log('[rpFeedbackSidenavCtrl] load');

        $scope.showFeedback = function(e) {
            console.log('[rpFeedbackSidenavCtrl] showFeedback()');
            // if (rpAuthService.isAuthenticated) {

            if ((rpSettingsService.settings.submitDialog && !e.ctrlKey) || rpIsMobileViewService.isMobileView()) {
                $mdDialog.show({
                    controller: 'rpFeedbackDialogCtrl',
                    templateUrl: 'rpFeedbackDialog.html',
                    targetEvent: e,
                    clickOutsideToClose: false,
                    escapeToClose: false,
                });

            } else {
                rpLocationService(e, '/feedback', '', true, false);
            }
            // } else {
            //     rpToastUtilService("you must log in to submit feedback", "sentiment_neutral");
            // }

        };
    }
]);

rpFeedbackControllers.controller('rpFeedbackDialogCtrl', [
    '$scope',
    'rpSettingsService',
    function($scope, rpSettingsService) {
        console.log('[rpFeedbackDialogCtrl] load');
        $scope.isDialog = true;
        $scope.animations = rpSettingsService.settings.animations;
    }
]);

rpFeedbackControllers.controller('rpFeedbackCtrl', [
    '$scope',
    '$rootScope',
    'rpTitleChangeService',

    function($scope, $rootScope, rpTitleChangeService) {
        console.log('[rpFeedbackCtrl] load');

        if (!$scope.isDialog) {
            $rootScope.$emit('rp_hide_all_buttons');
            $rootScope.$emit('rp_tabs_hide');
            rpTitleChangeService('send feedback', true, true);
        }

        $scope.isFeedback = true;

        $scope.formatting = false;
        $scope.toggleFormatting = function() {
            $scope.formatting = !$scope.formatting;
        };
    }
]);

rpFeedbackControllers.controller('rpFeedbackFormCtrl', [
    '$scope',
    '$timeout',
    '$mdDialog',
    '$window',
    'rpFeedbackUtilService',
    'rpLocationService',
    'rpIdentityService',

    function(
        $scope,
        $timeout,
        $mdDialog,
        $window,
        rpFeedbackUtilService,
        rpLocationService,
        rpIdentityService

    ) {
        console.log('[rpFeedbackFormCtrl]');

        $scope.showButtons = true;
        $scope.showSubmit = true;
        $scope.showFeedback = false;
        $scope.feedbackMessage = "";
        $scope.showFeedbackAlert = false;

        function resetForm() {
            $scope.text = "";
            $scope.title = "";
            $scope.showButtons = true;
            $scope.showSubmit = true;
            $scope.feedbackMessage = "";
            $scope.showFeedbackAlert = false;
            angular.element('#feedback-title').focus();
        }

        $scope.submitForm = function() {
            console.log('[rpFeedbackFormCtrl] submitForm()');

            $scope.showProgress = true;
            $scope.showButtons = false;
            $scope.showFeedback = false;
            $scope.feedbackMessage = "";
            $scope.showFeedbackAlert = false;
            $scope.showFeedbackSuccess = false;

            var name;

            rpIdentityService.getIdentity(function(identity) {
                name = identity === null ? 'user not logged in' : identity.name;

                console.log('[rpFeedbackFormCtrl] $scope.title: ' + $scope.title);
                console.log('[rpFeedbackFormCtrl] $scope.text: ' + $scope.text);
                console.log('[rpFeedbackFormCtrl] name: ' + name);

                rpFeedbackUtilService($scope.title, $scope.text, name, function(err, data) {

                    if (err) {
                        console.log('[rpFeedbackFormCtrl] err');
                        console.log('[rpFeedbackFormCtrl] err: ' + JSON.stringify(err));
                        $scope.showProgress = false;
                        $scope.showSubmit = true;
                        $scope.showButtons = true;
                        // $timeout(angular.noop, 0);

                    } else {
                        console.log('[rpFeedbackFormCtrl] success');
                        $scope.feedbackMessage = "Feedback Submitted, Thank you for helping to improve reddup";
                        $scope.feedbackIcon = 'sentiment_very_satisfied';
                        $scope.showFeedbackSuccess = true;
                        $scope.showFeedbackIcon = true;
                        $scope.showFeedback = true;
                        $scope.showProgress = false;
                        $scope.showAnother = true;
                        $scope.showSubmit = true;
                        $scope.showButtons = true;
                        //$timeout(angular.noop, 0);

                    }

                });

            });
        };

        $scope.resetForm = function() {
            resetForm();
        };

        $scope.closeDialog = function(e) {
            console.log('[rpFeedbackFormCtrl] closeDialog()');

            if ($scope.isDialog) {
                console.log('[rpFeedbackFormCtrl] closeDialog: Dialog.');
                $mdDialog.hide();
            } else {
                console.log('[rpFeedbackFormCtrl] closeDialog: $window.history.length: ' + $window.history.length);

                if ($window.history.length > 1) {
                    $window.history.back();

                } else {
                    rpLocationService(null, '/', '', true, false);
                }

            }

        };
    }
]);