app.controller('stickersController', function ($scope, $http) {

    $scope.stickers = [];
    $scope.loading = true;

    $scope.page_current = 1;
    $scope.pagination = [1, 2, 3];

    $http({
        method: 'GET',
        url: '/api/stickers',
        params: {
            type: 'trending'
        }
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
            tag_names.push(tags[i].name);
        }
        return tag_names.join(', ');
    };
});
