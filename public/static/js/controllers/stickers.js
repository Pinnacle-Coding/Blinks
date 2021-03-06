app.controller('StickersController', function($scope, $http, $state, $stateParams, Upload) {

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

    $scope.loadSticker = function(id) {
        $scope.loading = true;
        $http({
            method: 'GET',
            url: '/api/sticker/' + id
        }).then(function(resp) {
            $scope.sticker = resp.data.sticker;
            $scope.stickerEdit = {
                pack: $scope.sticker.pack.name,
                tags: $scope.concatTags($scope.sticker)
            };
            $('#stickerPackLabel').addClass('active');
            $('#stickerTagsLabel').addClass('active');
            $scope.loading = false;
        }, function(resp) {
            Materialize.toast(resp.data.message || 'Failed to load sticker', 4000);
            $scope.loading = false;
        });
    };

    $scope.adjustPagination = function() {
        if ($scope.page_current < 3) {
            $scope.pagination = [1, 2, 3, 4, 5];
        } else {
            $scope.pagination = [$scope.page_current - 2, $scope.page_current - 1, $scope.page_current, $scope.page_current + 1, $scope.page_current + 2];
        }
    };

    $scope.loadStickers = function(init) {
        $scope.loading = true;
        var params = {
            type: 'trending',
            page: $scope.page_current,
            count: 9
        };
        if ($stateParams.tag) {
            params.tag = $stateParams.tag;
            if (init) {
                params.page = 1;
                $scope.page_current = 1;
                $scope.adjustPagination();
            }
        }
        $http({
            method: 'GET',
            url: '/api/stickers',
            params: params
        }).then(function(resp) {
            $scope.stickers = resp.data.stickers;
            $scope.loading = false;
        }, function(resp) {
            Materialize.toast(resp.data.message || 'Failed to load stickers', 4000);
            $scope.loading = false;
        });
    };

    // On load, call loading functions

    switch ($state.current.name) {
        case 'blinks.stickers':
            $scope.stickers = [];
            $scope.page_current = 1;
            $scope.pagination = [1, 2, 3, 4, 5];
            if ($stateParams.tag) {
                $scope.search = $stateParams.tag;
            }
            $scope.loadStickers(true);
            break;
        case 'blinks.sticker':
            $scope.sticker = undefined;
            $scope.loadSticker($stateParams.id);
            break;
    }

    $scope.deleteSticker = function() {
        $scope.loading = true;
        $http({
            method: 'DELETE',
            url: '/api/sticker/' + $scope.sticker._id,
            data: $scope.stickerDelete,
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            }
        }).then(function(resp) {
            Materialize.toast(resp.data.message || 'Sticker deleted successfully', 4000);
            $scope.sticker = undefined;
            $scope.stickerDelete = {};
            $scope.loading = false;
        }, function(resp) {
            Materialize.toast(resp.data.message || 'Failed to delete sticker', 4000);
            $scope.loading = false;
        });
    };

    $scope.editSticker = function() {
        $scope.uploading = true;
        $scope.upload('/api/sticker/' + $scope.sticker._id, $scope.stickerEdit, 'PUT', function(resp) {
            Materialize.toast(resp.data.message || 'Sticker updated successfully', 4000);
            $scope.sticker = resp.data.sticker;
            $scope.stickerEdit = {
                pack: $scope.sticker.pack.name,
                tags: $scope.concatTags($scope.sticker)
            };
            $('#stickerPackLabel').addClass('active');
            $('#stickerTagsLabel').addClass('active');
            $scope.uploading = false;
        }, function(resp) {
            Materialize.toast(resp.data.message || 'An error occurred when updating the sticker', 4000);
            $scope.uploading = false;
        });
    };

    $scope.goToSticker = function(sticker) {
        /*
        // Proper way
        $state.go('blinks.sticker', {
            id: sticker._id
        });
        */
        window.location.href = '/sticker/' + sticker._id;
    };

    $scope.searchStickers = function () {
        $state.go('blinks.stickers', {
            tag: $scope.search
        });
    };

    $scope.setPage = function(page) {
        $scope.page_current = page;
        $scope.adjustPagination();
        $scope.loadStickers(false);
    };

    $scope.nextPage = function() {
        $scope.page_current += 1;
        $scope.adjustPagination();
        $scope.loadStickers(false);
    };

    $scope.previousPage = function() {
        if ($scope.page_current === 1) {
            return;
        }
        $scope.page_current -= 1;
        $scope.adjustPagination();
        $scope.loadStickers(false);
    };

    $scope.concatTags = function(sticker) {
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
