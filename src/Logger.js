SnapGrid.Logger = {
	error: function(error){
		if(typeof(error) == 'string'){
			throw 'SnapGrid Error: ' + error;
		}
		else{
			error.message = 'SnapGrid Error: ' + error.message;
			throw error;
		}
	},
	warning: function(message){
		console.log('SnapGrid Warning: ' + message);
	},
	log: function(message){
		console.log('SnapGrid: ' + message);
	}
};