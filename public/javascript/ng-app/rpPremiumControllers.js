'use strict';

var rpPremiumControllers = angular.module('rpPremiumControllers', []);

rpPremiumControllers.controller('rpPremiumSidenavCtrl', [
	'$scope',
	'$rootScope',
	'$mdDialog',
	'rpSettingsUtilService',
	'rpLocationUtilService',
	'rpIsMobileViewUtilService',
	'rpPremiumSubscriptionUtilService',

	function(
		$scope,
		$rootScope,
		$mdDialog,
		rpSettingsUtilService,
		rpLocationUtilService,
		rpIsMobileViewUtilService,
		rpPremiumSubscriptionUtilService

	) {
		console.log('[rpPremiumSidenavCtrl] load');

		checkSubscription();
		$scope.showPremium = function(e) {

			console.log('[rpPremiumSidenavCtrl] $scope.$parent.animations: ' + $scope.$parent.animations);
			console.log('[rpPremiumSidenavCtrl] $scope.animations: ' + $scope.animations);

			if ((rpSettingsUtilService.settings.settingsDialog && !e.ctrlKey) || rpIsMobileViewUtilService.isMobileView()) {
				$mdDialog.show({
					controller: 'rpSettingsDialogCtrl',
					templateUrl: 'rpSettingsDialog.html',
					clickOutsideToClose: true,
					escapeToClose: true,
					locals: {
						animations: $scope.animations,
						theme: $scope.theme,
						tab: 1
					}
				});

			} else {
				rpLocationUtilService(e, '/settings', 'selected=1', true, false);
			}

		};

		var deregisterPremiumSubscriptionUpdate = $rootScope.$on('rp_premium_billing_agreement_update', function(e, subscription) {
			checkSubscription();
		});

		function checkSubscription() {
			rpPremiumSubscriptionUtilService.isSubscribed(function(isSubscribed) {
				$scope.isSubscribed = isSubscribed;
			});
		}

		$scope.$on('$destroy', function() {
			deregisterPremiumSubscriptionUpdate();
		});
	}
]);

rpPremiumControllers.controller('rpPremiumCtrl', [
	'$scope',
	'$rootScope',
	'$mdDialog',
	'$mdBottomSheet',
	'rpPremiumSubscriptionUtilService',

	function(
		$scope,
		$rootScope,
		$mdDialog,
		$mdBottomSheet,
		rpPremiumSubscriptionUtilService
	) {
		console.log('[rpPremiumCtrl]');

		var deregisterPremiumSubscriptionUpdate = $rootScope.$on('rp_premium_billing_agreement_update', function(e, billingAgreement) {
			checkSubscription();
		});

		function checkSubscription() {
			rpPremiumSubscriptionUtilService.isSubscribed(function(isSubscribed) {
				$scope.isSubscribed = isSubscribed;
			});
		}

		$scope.toggleShowForm = function(e) {
			console.log('[rpPremiumCtrl] showForm()');
			$scope.showForm = !$scope.showForm;
		};

		$scope.closeDialog = function(e) {
			$mdDialog.hide();
			$mdBottomSheet.hide();
		};

		$scope.subscribe = function() {
			rpPremiumSubscriptionUtilService.subscribe();
		};

		$scope.$on('$destroy', function() {
			deregisterPremiumSubscriptionUpdate();
		});

		checkSubscription();
	}
]);

rpPremiumControllers.controller('rpPremiumSubscriptionCtrl', [
	'$scope',
	'$rootScope',
	'moment',
	'rpPremiumSubscriptionUtilService',


	function(
		$scope,
		$rootScope,
		moment,
		rpPremiumSubscriptionUtilService

	) {
		console.log('[rpPremiumSubscriptionCtrl]');

		$scope.billingAgreement = null;
		$scope.showCancelConfirmation = false;
		$scope.cancelling = false;

		rpPremiumSubscriptionUtilService.getBillingAgreement(function(data) {
			$scope.billingAgreement = data;
			console.log('[rpPremiumSubscriptionCtrl] getBillingAgreement, data: ' + JSON.stringify(data));

			$scope.currentPeriodStart = moment(new Date($scope.billingAgreement.start_date)).format("Do MMMM, YYYY");
			$scope.currentPeriodEnd = moment(new Date($scope.billingAgreement.agreement_details.next_billing_date)).format("Do MMMM, YYYY");

			// $scope.currentPeriodStart = new Date(data.current_period_start);

		});

		$scope.toggleCancelConfirmation = function(e) {
			$scope.showCancelConfirmation = !$scope.showCancelConfirmation;
		};

		$scope.cancelSubscription = function(e) {
			$scope.cancelling = true;
			console.log('[rpPremiumSubscriptionCtrl] cancelSubscription()');
			rpPremiumSubscriptionUtilService.cancel(function(error) {
				if (error) {
					console.log('[rpPremiumSubscriptionCtrl] cancelSubscription(), error cancelling subscription');
				} else {
					console.log('[rpPremiumSubscriptionCtrl] cancelSubscription(), subscription canceled');
				}
				$scope.cancelling = false;
			});

		};

		var deregisterPremiumSubscriptionUpdate = $rootScope.$on('rp_premium_billing_agreement_update', function(e, billingAgreement) {
			$scope.billingAgreement = billingAgreement;
		});

		$scope.$on('$destroy', function() {
			deregisterPremiumSubscriptionUpdate();
		});

	}
]);

// rpPremiumControllers.controller('rpPremiumFormCtrl', [
//     '$scope',
//     function($scope) {
//         console.log('[rpPremiumFormCtrl]');
//
//         $scope.submit = function(e) {
//             console.log('[rpPremiumFormCtrl] submit()');
//
//
//
//
//         };
//
//     }
// ]);