app.controller('PacksController', function ($scope, $http) {

    $scope.packs = [];
    $scope.loading = true;

    $scope.page_current = 1;
    $scope.pagination = [1, 2, 3, 4, 5];

    $scope.loadPacks = function () {
        $scope.loading = true;
        $http({
            method: 'GET',
            url: '/api/packs',
            params: {
                type: 'trending',
                page: $scope.page_current,
                count: 3
            }
        }).then(function (resp) {
            $scope.packs = resp.data.packs;
            $scope.loading = false;
        }, function (resp) {
            Materialize.toast(resp.data.message || 'Failed to load packs', 4000);
            $scope.loading = false;
        });
    };

    $scope.loadPacks();

    $scope.setPage = function(page) {
        $scope.page_current = page;
        $scope.adjustPagination();
        $scope.loadPacks();
    };

    $scope.nextPage = function() {
        $scope.page_current += 1;
        $scope.adjustPagination();
        $scope.loadPacks();
    };

    $scope.previousPage = function() {
        if ($scope.page_current === 1) {
            return;
        }
        $scope.page_current -= 1;
        $scope.adjustPagination();
        $scope.loadPacks();
    };

    $scope.adjustPagination = function() {
        if ($scope.page_current < 3) {
            $scope.pagination = [1, 2, 3, 4, 5];
        } else {
            $scope.pagination = [$scope.page_current - 2, $scope.page_current - 1, $scope.page_current, $scope.page_current + 1, $scope.page_current + 2];
        }
    };
});
