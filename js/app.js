angular.module('myApp', ['ui.router', 'angular-send-feedback'])

.config(['$stateProvider', '$urlRouterProvider', '$locationProvider',
        function($stateProvider, $urlRouterProvider, $locationProvider) {


            $urlRouterProvider.otherwise("/");

            $stateProvider
                .state('main', {
                    url: "/",
                    templateUrl: 'partials/main.html',
                    controller: 'mainController'
                });
        }
    ])
    .controller('mainController', function($scope) {

        $scope.mainMessage = "Main Controller Loaded";

        $scope.options = {
            html2canvasURL: 'bower_components/html2canvas/build/html2canvas.js',
            ajaxURL: 'http://test.url.com/feedback'
        };



    });
