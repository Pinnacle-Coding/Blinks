app.controller('stickersController', function($scope, $http) {

    $scope.stickers = [];
    $scope.loading = true;

    $scope.page_current = 1;
    $scope.pagination = [1, 2, 3, 4, 5];

    $http({
        method: 'GET',
        url: '/api/stickers',
        params: {
            type: 'trending'
        }
    }).then(function(resp) {
        $scope.stickers = resp.data.stickers;
        $scope.loading = false;
    }, function(resp) {
        Materialize.toast(resp.data.message || 'Failed to load stickers', 4000);
        $scope.loading = false;
    });

    $scope.nextPage = function() {
        $scope.page_current += 1;
        $scope.adjustPagination();
    };

    $scope.previousPage = function() {
        if ($scope.page_current === 1) {
            return;
        }
        $scope.page_current -= 1;
        $scope.adjustPagination();
    };

    $scope.adjustPagination = function() {
        if ($scope.page_current < 3) {
            $scope.pagination = [1, 2, 3, 4, 5];
        }
        else {
            $scope.pagination = [$scope.page_current - 2, $scope.page_current - 1, $scope.page_current, $scope.page_current + 1, $scope.page_current + 2]
        }
    }

    $scope.concatTags = function(sticker) {
        if (!sticker) {
            return '';
        }
        var tags = sticker.tags;
        var tag_names = [];
        for (var i in tags) {
            tag_names.push(tags[i].name);
        }
        return tag_names.join(', ');
    };
});
