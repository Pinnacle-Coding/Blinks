var app = angular.module('Blinks', ['ngFileUpload', 'ui.router', 'ui.router.title']);

app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider) {
    $locationProvider.html5Mode(true);

    $urlRouterProvider.otherwise('/');

    $stateProvider.state('blinks', {
        views: {
            'body': {
                templateUrl: 'templates/main.html'
            }
        }
    }).state('blinks.dashboard', {
        url: '/',
        views: {
            'content': {
                templateUrl: 'templates/dashboard.html',
                controller: 'DashboardController'
            }
        },
        resolve: {
            $title: function () {
                return 'Dashboard';
            }
        }
    }).state('blinks.authors', {
        url: '/authors',
        views: {
            'content': {
                templateUrl: 'templates/authors.html',
                controller: 'AuthorsController'
            }
        },
        resolve: {
            $title: function () {
                return 'Authors';
            }
        }
    }).state('blinks.packs', {
        url: '/packs',
        views: {
            'content': {
                templateUrl: 'templates/packs.html',
                controller: 'PacksController'
            }
        },
        resolve: {
            $title: function () {
                return 'Packs';
            }
        }
    }).state('blinks.stickers', {
        url: '/stickers',
        views: {
            'content': {
                templateUrl: 'templates/stickers.html',
                controller: 'StickersController'
            }
        },
        resolve: {
            $title: function () {
                return 'Stickers';
            }
        }
    }).state('blinks.sticker', {
        url: '/sticker/:id',
        views: {
            'content': {
                templateUrl: 'templates/sticker.html',
                controller: 'StickersController'
            }
        },
        resolve: {
            $title: ['$stateParams', function ($stateParams) {
                return 'Sticker ('+$stateParams.id+')';
            }]
        }
    });
}]);
