app.controller('stickersController', function ($scope, $http) {

    $scope.stickers = [];
    $scope.loading = true;

    $http({
        method: 'GET',
        url: '/api/stickers'
    }).then(function (resp) {
        $scope.stickers = resp.data.stickers;
        $scope.loading = false;
    }, function (resp) {
        Materialize.toast(resp.data.message || 'Failed to load stickers', 4000);
        $scope.loading = false;
    });
});
