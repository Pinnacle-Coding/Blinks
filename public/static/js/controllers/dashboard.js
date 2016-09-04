app.controller('dashboardController', function($scope, $http, Upload) {

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
            Materialize.toast(resp.data.message || 'Sticker created successfully', 4000);
            var pack = $scope.sticker.pack;
            var tags = $scope.sticker.tags;
            $scope.sticker = {
                pack: pack,
                tags: tags
            };
            $scope.uploading = false;
        }, function(resp) {
            Materialize.toast(resp.data.message || 'An error occurred when creating the sticker', 4000);
            $scope.uploading = false;
        });
    };

    $scope.addPack = function() {
        $scope.uploading = true;
        $http({
            url: '/api/packs',
            data: $scope.pack,
            method: 'POST'
        }).then(function(resp) {
            Materialize.toast(resp.data.message || 'Pack created successfully', 4000);
            $scope.pack = {};
            $scope.uploading = false;
        }, function(resp) {
            Materialize.toast(resp.data.message || 'An error occurred when creating the pack', 4000);
            $scope.uploading = false;
        });
    };

    $scope.addAuthor = function() {
        $scope.uploading = true;
        $scope.upload('/api/authors', $scope.author, 'POST', function(resp) {
            Materialize.toast(resp.data.message || 'Author created successfully', 4000);
            $scope.author = {};
            $scope.uploading = false;
        }, function(resp) {
            Materialize.toast(resp.data.message || 'An error occurred when creating the author', 4000);
            $scope.uploading = false;
        });
    };
});
