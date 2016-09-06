var app = angular.module('Blinks', ['ngFileUpload', 'ui.router']);

app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider) {
    $locationProvider.html5Mode(true);

    $urlRouterProvider.otherwise('/');

    $stateProvider.state('dashboard', {
            url: '/',
            controller: 'DashboardController',
            views: {
                'content': {
                    templateUrl: 'templates/dashboard.html'
                }
            },
            data: {
                title: 'Blinks &middot Dashboard'
            }
        }).state('stickers', {
            url: '/stickers',
            controller: 'StickersController',
            views: {
                'content': {
                    templateUrl: 'templates/stickers.html'
                }
            },
            data: {
                title: 'Blinks &middot Stickers'
            }
        }).state('packs', {
            url: '/packs',
            controller: 'PacksController',
            views: {
                'content': {
                    templateUrl: 'templates/packs.html'
                }
            },
            data: {
                title: 'Blinks &middot Packs'
            }
        }).state('authors', {
            url: '/authors',
            controller: 'AuthorsController',
            views: {
                'content': {
                    templateUrl: 'templates/authors.html'
                }
            },
            data: {
                title: 'Blinks &middot Authors'
            }
        });
}]);

app.directive('updateTitle', ['$rootScope', '$timeout',
    function($rootScope, $timeout) {
        return {
            link: function(scope, element) {

                var listener = function(event, toState) {

                    var title = 'Blinks';
                    if (toState.data && toState.data.title)
                        title = toState.data.title;

                    $timeout(function() {
                        element.text(title);
                    }, 0, false);
                };

                $rootScope.$on('$stateChangeSuccess', listener);
            }
        };
    }
]);
