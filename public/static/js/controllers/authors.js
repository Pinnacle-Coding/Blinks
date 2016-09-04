app.controller('authorsController', function ($scope, $http) {

    $scope.authors = [];
    $scope.loading = true;

    $http({
        method: 'GET',
        url: '/api/authors'
    }).then(function (resp) {
        $scope.authors = resp.data.authors;
        $scope.loading = false;
    }, function (resp) {
        Materialize.toast(resp.data.message || 'Failed to load authors', 4000);
        $scope.loading = false;
    });
});
