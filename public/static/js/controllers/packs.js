app.controller('packsController', function ($scope, $http) {

    $scope.packs = [];
    $scope.loading = true;

    $http({
        method: 'GET',
        url: '/api/packs'
    }).then(function (resp) {
        $scope.packs = resp.data.packs;
        $scope.loading = false;
    }, function (resp) {
        Materialize.toast(resp.data.message || 'Failed to load packs', 4000);
        $scope.loading = false;
    });
});
