export default function(fn, time){
	var runHandler;

	return function(){
		if(runHandler){
			clearTimeout(runHandler);
		}

		runHandler = setTimeout(function(){
			runHandler = null;
			fn();
		}, time || 10);
	};
};