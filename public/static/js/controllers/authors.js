app.controller('AuthorsController', function($scope, $http, $state, $stateParams, Upload) {

    // Utility functions/variables ...

    $scope.uploading = false;

    $scope.upload = function(url, data, method, success, error) {
        Upload.upload({
            url: url,
            data: data,
            method: method
        }).then(success, error, function(evt) {

        });
    };

    // Loading functions ...

    $scope.loading = true;

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

    $scope.loadAuthor = function(id) {
        $http({
            method: 'GET',
            url: '/api/author/' + id
        }).then(function(resp) {
            $scope.author = resp.data.author;
            $scope.authorEdit = {
                name: $scope.author.name,
            };
            if ($scope.author.location) {
                $scope.authorEdit.location = $scope.author.location;
            }
            $('#authorNameLabel').addClass('active');
            $('#authorLocationLabel').addClass('active');
            $scope.loading = false;
        }, function(resp) {
            Materialize.toast(resp.data.message || 'Failed to load author', 4000);
            $scope.loading = false;
        });
    };

    // On load, call loading functions

    switch ($state.current.name) {
        case 'blinks.authors':
            $scope.authors = [];
            $scope.page_current = 1;
            $scope.pagination = [1, 2, 3, 4, 5];
            $scope.loadAuthors();
            break;
        case 'blinks.author':
            $scope.author = undefined;
            $scope.loadAuthor($stateParams.id);
            break;
    }

    $scope.editAuthor = function() {
        $scope.uploading = true;
        $scope.upload('/api/author/' + $scope.author._id, $scope.authorEdit, 'PUT', function(resp) {
            Materialize.toast(resp.data.message || 'Author updated successfully', 4000);
            $scope.author = resp.data.author;
            $scope.authorEdit = {
                name: $scope.author.name,
            };
            if ($scope.author.location) {
                $scope.authorEdit.location = $scope.author.location;
            }
            $('#authorNameLabel').addClass('active');
            $('#authorLocationLabel').addClass('active');
            $scope.uploading = false;
        }, function(resp) {
            Materialize.toast(resp.data.message || 'An error occurred when updating the author', 4000);
            $scope.uploading = false;
        });
    };

    $scope.deleteAuthor = function () {
        $scope.loading = true;
        $http({
            method: 'DELETE',
            url: '/api/author/' + $scope.author._id,
            data: $scope.authorDelete,
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            }
        }).then(function(resp) {
            Materialize.toast(resp.data.message || 'Author deleted successfully', 4000);
            $scope.author = undefined;
            $scope.authorDelete = {};
            $scope.loading = false;
        }, function(resp) {
            Materialize.toast(resp.data.message || 'Failed to delete author', 4000);
            $scope.loading = false;
        });
    };

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

    $scope.goToAuthor = function(author) {
        window.location.href = '/author/' + author.username;
    };
});
