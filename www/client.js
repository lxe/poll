var app = angular.module('poll', [
  'ngAnimate',
  'chieffancypants.loadingBar'
]);

app.controller('AppCtrl', ['$scope', '$http',
  function AppCtrl($scope, $http) {
    $scope.poll = { choices : [ '' ] };
    $scope.selectedChoice = NaN;
    $scope.voted = /voted=1/.test(document.cookie);

    if (location.pathname === '/') {
      setTimeout(function () { $('#poll-question').focus(); }, 1);
      $scope.createNew = true;
      $scope.createPoll = function () {
        $http.post('/polls', $scope.poll).then(function (result) {
          location.href = '/' + result.data.url;
        });
      }
    } else {
      $http.get('/polls/' + location.pathname.replace(/\//g, '')).then(function (result) {
        $scope.poll = result.data;
        document.title = $scope.poll.question;
      });

      $scope.castVote = function () {
        $http.post('/polls/' + $scope.poll.url + '/vote/' + $scope.selectedChoice, { })
        .success(function (result) {
          console.log(result);
          $scope.voted = true;
        }).error(function (err) {
          console.log(err);
        });
      }
    }
  }
]);
