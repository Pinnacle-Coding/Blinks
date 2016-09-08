app.controller('StickersController', function($scope, $http, $state, $stateParams, Upload) {

    $scope.loading = true;

    switch ($state.current.name) {
        case 'blinks.stickers':
            $scope.stickers = [];
            $scope.page_current = 1;
            $scope.pagination = [1, 2, 3, 4, 5];
            $scope.loadStickers();
            break;
        case 'blinks.sticker':
            $scope.sticker = undefined;
            $scope.loadSticker($stateParams._id);
            break;
    }

    $scope.loadSticker = function(id) {
        $scope.loading = true;
        $http({
            method: 'GET',
            url: '/api/sticker/'+id
        }).then(function (resp) {
            $scope.sticker = resp.data.sticker;
            $scope.loading = false;
        }, function (resp) {
            Materialize.toast(resp.data.message || 'Failed to load sticker', 4000);
            $scope.loading = false;
        });
    };

    $scope.loadStickers = function() {
        $scope.loading = true;
        $http({
            method: 'GET',
            url: '/api/stickers',
            params: {
                type: 'trending',
                page: $scope.page_current,
                count: 9
            }
        }).then(function(resp) {
            $scope.stickers = resp.data.stickers;
            $scope.loading = false;
        }, function(resp) {
            Materialize.toast(resp.data.message || 'Failed to load stickers', 4000);
            $scope.loading = false;
        });
    };

    $scope.loadStickers();

    $scope.setPage = function(page) {
        $scope.page_current = page;
        $scope.adjustPagination();
        $scope.loadStickers();
    };

    $scope.nextPage = function() {
        $scope.page_current += 1;
        $scope.adjustPagination();
        $scope.loadStickers();
    };

    $scope.previousPage = function() {
        if ($scope.page_current === 1) {
            return;
        }
        $scope.page_current -= 1;
        $scope.adjustPagination();
        $scope.loadStickers();
    };

    $scope.adjustPagination = function() {
        if ($scope.page_current < 3) {
            $scope.pagination = [1, 2, 3, 4, 5];
        } else {
            $scope.pagination = [$scope.page_current - 2, $scope.page_current - 1, $scope.page_current, $scope.page_current + 1, $scope.page_current + 2];
        }
    };

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
