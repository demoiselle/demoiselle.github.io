'use strict';

var app = angular.module('app', [
    'ngSanitize',
    'ngRoute',
    'mdMarkdownIt',
    'ui.bootstrap',
    'Config'
]).config(['$httpProvider', function ($httpProvider) {

        $httpProvider.interceptors.push(['$q', '$rootScope', function ($q, $rootScope) {
                return {
                    'request': function (config) {
                        $rootScope.$broadcast('loading-started');
                        return config || $q.when(config);
                    },
                    'response': function (response) {
                        $rootScope.$broadcast('loading-complete');
                        return response || $q.when(response);
                    },
                    'responseError': function (rejection) {
                        $rootScope.$broadcast('loading-complete');
                        return $q.reject(rejection);
                    },
                    'requestError': function (rejection) {
                        $rootScope.$broadcast('loading-complete');
                        return $q.reject(rejection);
                    }
                };
            }]);

        $httpProvider.interceptors.push(['$injector', function ($injector) {
                return $injector.get('AuthInterceptor');
            }]);

    }]);

app.config(['markdownItConverterProvider', function (markdownItConverter) {
        markdownItConverter.config('commonmark', {
            breaks: true,
            html: true
        });
    }]);


app.run(['$rootScope', '$location', '$window', 'AlertService', 'AUTH_EVENTS',
    function ($rootScope, $location, $window, AlertService, AUTH_EVENTS) {

        $rootScope.$on('$routeChangeStart', function (event, next) {

        });

        $rootScope.$on(AUTH_EVENTS.mensagem, function (emit, args) {
            AlertService.notification("Mensagem", args.emit.data);
        });

        $rootScope.$on(AUTH_EVENTS.mensagem, function (emit, args) {
            AlertService.notification("Comunicado", args.emit.data);
        });

        $rootScope.$on(AUTH_EVENTS.quantidade, function (emit, args) {
            $rootScope.$apply(function () {
                $rootScope.conectados = args.emit.data;
            });
        });

        // Check if a new cache is available on page load.
        $window.addEventListener('load', function (e) {
            $window.applicationCache.addEventListener('updateready', function (e) {
                if ($window.applicationCache.status === $window.applicationCache.UPDATEREADY) {
                    // Browser downloaded a new app cache.
                    $window.location.reload();
                    alert('Uma nova versão será carregada!');
                }
            }, false);
        }, false);

    }]);

app.constant('APP_EVENTS', {
    offline: 'app-events-offline'
});

app.constant('AUTH_EVENTS', {
    comunicado: 'comunicado',
    mensagem: 'mensagem',
    quantidade: 'qtde'
});

app.constant('USER_ROLES', {
    NOT_LOGGED: 'NOT_LOGGED'
});

app.factory('AuthInterceptor', ['$rootScope', '$q', 'AUTH_EVENTS', 'APP_EVENTS',
    function ($rootScope, $q, AUTH_EVENTS, APP_EVENTS) {

        return {
            responseError: function (response) {
                $rootScope.$broadcast({
                    '-1': APP_EVENTS.offline,
                    0: APP_EVENTS.offline,
                    404: APP_EVENTS.offline,
                    503: APP_EVENTS.offline,
                    401: AUTH_EVENTS.notAuthenticated,
                    //403: AUTH_EVENTS.notAuthorized,
                    419: AUTH_EVENTS.sessionTimeout,
                    440: AUTH_EVENTS.sessionTimeout
                }[response.status], response);

                return $q.reject(response);
            }
        };

    }]);





