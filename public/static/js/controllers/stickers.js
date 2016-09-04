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

    $scope.concatTags = function (sticker) {
        if (!sticker) {
            return '';
        }
        var tags = sticker.tags;
        var tag_names = [];
        for (var i in tags) {
            tag_names.append(tags[i]);
        }
        return tag_names.join(', ');
    };
});
