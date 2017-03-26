angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout,$http) {

  // Form data for the login modal
  $scope.configureControl = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  $scope.configureControl.remoteHost = window.localStorage.getItem("remoteHost");
  $scope.configureControl.localHost = window.localStorage.getItem("localHost");

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    window.localStorage.setItem("remoteHost", $scope.configureControl.remoteHost);
    window.localStorage.setItem("localHost", $scope.configureControl.localHost);
    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };


  $scope.temperature = "N/A";
  $scope.humidity = "N/A";


})



.controller('ConfigureCommandsCtrl', function($scope ,$http) {
  $scope.configure ={};  
  $scope.configure.onOff = "ON";

  $scope.confirm = function(configure) {
  var commandName = "OFF";
  if(configure.onOff == "ON"){
   commandName = configure.onOff + configure.mode + configure.temperature + configure.functions;
  }
  console.log(commandName);
  $scope.result = "";
  $http.get('http://'+window.localStorage.getItem("localHost")+'/record')
    .success(function(data, status, headers,config){
      $scope.result = data; // for UI
      window.localStorage.setItem(commandName, data.command);
    })
    .error(function(data, status, headers,config){
      console.log('data error');
    })
    .then(function(result){
      things = result.data;
    });

    window.plugins.toast.show(configure.onOff,'short','bottom');
  };
})

.controller('ExecuteCommandsCtrl', function($scope, $http,$stateParams) {
	$scope.configure ={};  
	$scope.confirm = function(configure) {
      		var commandName = "ON" + configure.mode + configure.temperature + configure.functions;
		var command = window.localStorage.getItem(commandName);
		console.log(command);
		$http.get("http://"+window.localStorage.getItem("localHost")+"/command?command="+command)
		    .success(function(data, status, headers,config){
		      $scope.result = data; // for UI
		      console.log(data.code);
		    })
		    .error(function(data, status, headers,config){
		      console.log('data error');
		    })
		    .then(function(result){
		      things = result.data;
		    });

		    window.plugins.toast.show(configure.onOff,'short','bottom');
		  
	}

	 $scope.turnOff = function () {
	   	var command = window.localStorage.getItem("OFF");
		console.log(command);
		$http.get("http://"+window.localStorage.getItem("localHost")+"/command?command="+command)
		    .success(function(data, status, headers,config){
		      $scope.result = data; // for UI
		      console.log(data.code);
		    })
		    .error(function(data, status, headers,config){
		      console.log('data error');
		    })
		    .then(function(result){
		      things = result.data;
		    });

		    window.plugins.toast.show(configure.onOff,'short','bottom');
	  }

	$scope.$on('$ionicView.enter', function(){


	  $http.get('http://'+window.localStorage.getItem("localHost")+'/sensors')
	    .success(function(data, status, headers,config){
	      $scope.result = data; // for UI
	      $scope.temperature = data.temperature;
	      $scope.humidity = data.humidity;
	    })
	    .error(function(data, status, headers,config){
	      console.log('data error');
	    })
	    .then(function(result){
	      things = result.data;
	    });
	});

});
