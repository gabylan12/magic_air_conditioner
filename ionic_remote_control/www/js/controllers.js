angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout,$http) {

  // Form data for the login modal
  $scope.configureControl = {};

  $scope.configureControl.remoteHost = window.localStorage.getItem("remoteHost");
  $scope.configureControl.localHost = window.localStorage.getItem("localHost");

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    window.localStorage.setItem("remoteHost", $scope.configureControl.remoteHost);
    window.localStorage.setItem("localHost", $scope.configureControl.localHost);
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
		console.log('error local , trying remote');
		 $http.get('http://'+window.localStorage.getItem("remoteHost")+'/record')
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
		      console.log('error local , trying remote');
		       $http.get("http://"+window.localStorage.getItem("remoteHost")+"/command?command="+command)	
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
		      console.log('error local , trying remote');
			$http.get("http://"+window.localStorage.getItem("remoteHost")+"/command?command="+command)
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
	      $scope.temperature = data.temperature + "°C";
	      $scope.humidity = data.humidity + "%";
	    })
	    .error(function(data, status, headers,config){
	      console.log('error local , trying remote');
	      $http.get('http://'+window.localStorage.getItem("remoteHost")+'/sensors')
		    .success(function(data, status, headers,config){
		      $scope.result = data; // for UI
		      $scope.temperature = data.temperature + "°C";
		      $scope.humidity = data.humidity + "%";
		    })
		    .error(function(data, status, headers,config){
		      console.log('data error');
		    })
		    .then(function(result){
		      things = result.data;
		    });
	    })
	    .then(function(result){
	      things = result.data;
	    });
	});

});
