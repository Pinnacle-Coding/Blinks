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
            },
            data: {
                pageTitle: 'Blinks &middot Dashboard'
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
                pageTitle: 'Blinks &middot Stickers'
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
                pageTitle: 'Blinks &middot Packs'
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
                pageTitle: 'Blinks &middot Authors'
            }
        });
}]);

app.directive('updateTitle', ['$rootScope', '$timeout',
    function($rootScope, $timeout) {
        return {
            link: function(scope, element) {

                var listener = function(event, toState) {

                    var title = 'Blinks &middot Dashboard';
                    if (toState.data && toState.data.pageTitle)
                        title = toState.data.pageTitle;

                    $timeout(function() {
                        element.text(title);
                    }, 0, false);
                };

                $rootScope.$on('$stateChangeSuccess', listener);
            }
        };
    }
]);
