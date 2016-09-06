var app = angular.module('Blinks', ['ngFileUpload', 'ui.router']);

app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider) {
    $locationProvider.html5Mode(true);

    $urlRouterProvider.otherwise('/');

    $stateProvider.state('dashboard', {
        url: '/',
        views: {
            'content': {
                templateUrl: 'templates/dashboard.html',
                controller: 'DashboardController'
            }
        }
    }).state('authors', {
        url: '/authors',
        views: {
            'content': {
                templateUrl: 'templates/authors.html',
                controller: 'AuthorsController'
            }
        }
    }).state('packs', {
        url: '/packs',
        views: {
            'content': {
                templateUrl: 'templates/packs.html',
                controller: 'PacksController'
            }
        }
    }).state('stickers', {
        url: '/stickers',
        views: {
            'content': {
                templateUrl: 'templates/stickers.html',
                controller: 'StickersController'
            }
        }
    });
}]);

app.factory('Page', function() {
    var title = 'Home';
    return {
        title: function() {
            return title;
        },
        setTitle: function(newTitle) {
            title = newTitle;
        }
    };
});
