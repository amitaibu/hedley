'use strict';

/**
 * @ngdoc service
 * @name clientApp.auth
 * @description
 * # auth
 * Service in the clientApp.
 */
angular.module('clientApp')
  .service('Auth', function ($injector, $rootScope, Utils, localStorageService, Config) {

    /**
     * An access token setter.
     *
     * @param accessToken
     */
    this.setAccessToken = function(accessToken) {
      localStorageService.set('access_token', accessToken);
    };

    /**
     * Login by calling the Drupal REST server.
     *
     * @param user
     *   Object with the properties "username" and "password".
     *
     * @returns {*}
     */
    this.login = function(user) {
      // Service 'Auth' can't depend on '$http', hence injecting it manually
      return $injector.get('$http')({
        method: 'GET',
        url: Config.backend + '/api/login-token',
        headers: {
          'Authorization': 'Basic ' + Utils.Base64.encode(user.username + ':' + user.password)
        }
      });
    };

    /**
     * Trigger a `reset password` action on the server for this email.
     *
     * @param email
     *  The email of the user.
     *
     * @returns {*}
     */
    this.resetPassword = function(email) {
      return $injector.get('$http')({
        method: 'POST',
        url: Config.backend + '/api/reset-password',
        data: {email: email}
      });
    };

    /**
     * Save new password for a user.
     *
     * @param uid
     *  User id.
     * @param password
     *  A new password to set.
     *
     * @returns {*}
     */
    this.savePassword = function(uid, password) {
      return $injector.get('$http')({
        method: 'PATCH',
        url: Config.backend + '/api/v1.1/users/' + uid,
        data: {password: password}
      });
    };

    /**
     * Checks users availability.
     *
     * @param user
     * @returns {*}
     */
    this.usersAvailability = function(user) {
      var params = 'name=' + user.name + '&mail=' + user.mail;

      return $injector.get('$http')({
        method: 'GET',
        url: Config.backend + '/api/users-availability?' + params
      });
    };

    /**
     * Sign Up new user.
     *
     * @param data
     * @returns {*}
     */
    this.signUp = function(data) {
      return $injector.get('$http')({
        method: 'POST',
        url: Config.backend + '/api/v1.1/users',
        data: data
      });
    };

    /**
     * Logout current user.
     *
     * Do whatever cleaning up is required.
     */
    this.logout = function() {
      localStorageService.remove('access_token');

      $rootScope.$broadcast('clearCache');
      // Something went wrong, change state back to login
      // Service 'Auth' can't depend on '$state', hence injecting it manually
      $injector.get('$state').go('login');

    };

    /**
     * A user is logged in.
     */
    this.isAuthenticated = function() {
      return !!localStorageService.get('access_token');
    };

    /**
     * Authentication failed, set state to login.
     */
    this.authFailed = function() {
      this.logout();
    };
  });
