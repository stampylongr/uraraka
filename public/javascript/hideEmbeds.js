$(function() {

	mediaCheck({
		media: '(max-width: 970px)',
		entry: oneColumn,
		exit: twoColumns
	});

	mediaCheck({
		media: '(max-width: 1550px)',
		entry: twoColumns,
	});

	mediaCheck({
		media: '(min-width: 1550px)',
		entry: threeColumns,
	});


	function oneColumn() {
		var scope = angular.element($('.rp-subreddit-posts')).scope();
		if (scope) {
			scope.$apply(function() {
				scope.columns = [1];
				$('#rp-posts-col').each().removeClass('rp-posts-col-lg');
				$('#rp-posts-col').each().removeClass('rp-posts-col-md');
				$('#rp-posts-col').each().addClass('rp-posts-col-sm');
			});
		}
	}

	function twoColumns() {
		var scope = angular.element($('.rp-subreddit-posts')).scope();
		if (scope) {
			scope.$apply(function() {
				scope.columns = [1, 2];
				$('#rp-posts-col').each().removeClass('rp-posts-col-lg');
				$('#rp-posts-col').each().removeClass('rp-posts-col-sm');
				$('#rp-posts-col').each().addClass('rp-posts-col-md');
			});
		}
	}

	function threeColumns() {
		var scope = angular.element($('.rp-subreddit-posts')).scope();
		if (scope) {
			scope.$apply(function() {
				scope.columns = [1, 2, 3];
				$('#rp-posts-col').each().removeClass('rp-posts-col-sm');
				$('#rp-posts-col').each().removeClass('rp-posts-col-md');
				$('#rp-posts-col').each().addClass('rp-posts-col-lg');
			});
		}
	}

});
