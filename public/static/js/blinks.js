var app = angular.module('Blinks', ['ngFileUpload', 'ui.router']);

app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');

    $stateProvider.state('dashboard', {
            url: '/',
            views: {
                'content': {
                    templateUrl: 'templates/dashboard.html',
                    controller: 'DashboardController'
                }
            },
            data: {
                title: 'Blinks &middot Dashboard'
            }
        }).state('stickers', {
            url: '/stickers',
            views: {
                'content': {
                    templateUrl: 'templates/stickers.html',
                    controller: 'StickersController'
                }
            },
            data: {
                title: 'Blinks &middot Stickers'
            }
        }).state('packs', {
            url: '/packs',
            views: {
                'content': {
                    templateUrl: 'templates/packs.html',
                    controller: 'PacksController'
                }
            },
            data: {
                title: 'Blinks &middot Packs'
            }
        }).state('authors', {
            url: '/authors',
            views: {
                'content': {
                    templateUrl: 'templates/authors.html',
                    controller: 'AuthorsController'
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
