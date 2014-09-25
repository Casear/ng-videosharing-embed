angular.module('videosharing-embed').directive('embedVideo', [ '$filter' , 'RegisteredPlayers', '$sce','$interval','$window', function ($filter, RegisteredPlayers, $sce,$interval,$window) {
	'use strict';
    return {
        restrict: "E",
        template: '<iframe width="{{width}}" height="{{height}}"  data-ng-src="{{trustedVideoSrc}}" allowfullscreen frameborder="0"></iframe>',
        scope: {
            height: '@',
            width: '@',

        },
        link: function ($scope, $element, $attrs) {
            var iframe = e[0].children[0]
            if (iframe.attachEvent){
                iframe.attachEvent("onload", function(){
                    $scope.i = i(function(){
                        $window.focus()
                    },500)
                });
            } else {
                iframe.onload = function(){
                    $scope.i = i(function(){
                        $window.focus()
                    },500) 
                };
            }
            $element.on('$destroy', function(){
                if($scope.i)
                {
                    $interval.cancel($scope.i)
                    $scope.i = null
                }
            });
            $scope.key = function(event){
              event.preventDefault()
              console.log('log')
            }
            $attrs.$observe('width', function(w) {
              $scope.width = w;
            });

            $attrs.$observe('height', function(h) {
              $scope.height = h;
            });

            //handle the use of both ng-href and href
            $attrs.$observe('href', function(url) {
              if(url === undefined)
                return;
              var player = null;

              if(url==='' || url == null){
                $scope.trustedVideoSrc = "";
                return;
              }

              //search for the right player in the list of registered players
              angular.forEach(RegisteredPlayers, function (value) {
                if (value.isPlayerFromURL(url)) {
                  player = value;
                }
              });
              if(player === null)
                  return; //haven't found a match for a valid registered player
              //get the videoID

              var videoID = url.match(player.playerRegExp)[2];

              //copy configuration from player
              var config = player.config;
              //get the protocol
              var protocol = url.match(player.playerRegExp)[1] || '';

              //overwrite playback options
              angular.forEach($filter('whitelist')($attrs, player.whitelist), function (value, key) {
                config.options[key] = value;
              });
              //build and trust the video URL
              var untrustedVideoSrc = protocol + '//' + config.playerID + videoID + $filter('videoOptions')(config.options);
              $scope.trustedVideoSrc = $sce.trustAsResourceUrl(untrustedVideoSrc);
            });
        }
    }
}]);
