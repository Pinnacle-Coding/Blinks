app.controller('dashboardController', function($scope, Upload) {

    $scope.uploading = false;

    $scope.upload = function(url, data, method, success, error) {
        Upload.upload({
            url: url,
            data: data,
            method: method
        }).then(success, error, function(evt) {

        });
    };

    $scope.addSticker = function() {
        $scope.uploading = true;
        $scope.upload('/api/stickers', $scope.sticker, 'POST', function(resp) {
            Materialize.toast(resp.message || 'Sticker created successfully', 4000);
            $scope.sticker = {};
            $scope.uploading = false;
        }, function(resp) {
            Materialize.toast(resp.message || 'An error occurred when creating the sticker', 4000);
            $scope.uploading = false;
        });
    };

    $scope.addPack = function() {
        $scope.uploading = true;
        $scope.upload('/api/packs', $scope.pack, 'POST', function(resp) {
            Materialize.toast(resp.message || 'Pack created successfully', 4000);
            $scope.pack = {};
            $scope.uploading = false;
        }, function(resp) {
            Materialize.toast(resp.message || 'An error occurred when creating the pack', 4000);
            $scope.uploading = false;
        });
    };

    $scope.addAuthor = function() {
        $scope.uploading = true;
        $scope.upload('/api/authors', $scope.author, 'POST', function(resp) {
            Materialize.toast(resp.message || 'Author created successfully', 4000);
            $scope.author = {};
            $scope.uploading = false;
        }, function(resp) {
            Materialize.toast(resp.message || 'An error occurred when creating the author', 4000);
            $scope.uploading = false;
        });
    };
});
