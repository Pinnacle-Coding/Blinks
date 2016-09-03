app.controller('dashboardController', function ($scope, $http, Upload) {

    $scope.uploading = false;
    
    $scope.addSticker = function () {
        $scope.uploading = true;
        Upload.upload({
            url: '/api/stickers',
            data: $scope.sticker,
            method: 'POST'
        }).then(function (resp) {
            Materialize.toast(resp.message || 'Sticker created successfully', 4000);
            $scope.sticker = {};
            $scope.uploading = false;
        }, function (resp) {
            Materialize.toast(resp.message || 'An error occurred when creating the sticker', 4000);
            $scope.uploading = false;
        }, function (evt) {

        });
    };

});
