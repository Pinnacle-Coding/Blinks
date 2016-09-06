app.controller('AuthorsController', function($scope, $http, Page) {

    Page.setTitle('Authors');

    $scope.authors = [];
    $scope.loading = true;

    $scope.page_current = 1;
    $scope.pagination = [1, 2, 3, 4, 5];

    $scope.loadAuthors = function() {
        $http({
            method: 'GET',
            url: '/api/authors',
            params: {
                type: 'trending',
                page: $scope.page_current,
                count: 6
            }
        }).then(function(resp) {
            $scope.authors = resp.data.authors;
            $scope.loading = false;
        }, function(resp) {
            Materialize.toast(resp.data.message || 'Failed to load authors', 4000);
            $scope.loading = false;
        });
    };

    $scope.loadAuthors();

    $scope.setPage = function(page) {
        $scope.page_current = page;
        $scope.adjustPagination();
        $scope.loadAuthors();
    };

    $scope.nextPage = function() {
        $scope.page_current += 1;
        $scope.adjustPagination();
        $scope.loadAuthors();
    };

    $scope.previousPage = function() {
        if ($scope.page_current === 1) {
            return;
        }
        $scope.page_current -= 1;
        $scope.adjustPagination();
        $scope.loadAuthors();
    };

    $scope.adjustPagination = function() {
        if ($scope.page_current < 3) {
            $scope.pagination = [1, 2, 3, 4, 5];
        } else {
            $scope.pagination = [$scope.page_current - 2, $scope.page_current - 1, $scope.page_current, $scope.page_current + 1, $scope.page_current + 2];
        }
    };
});
