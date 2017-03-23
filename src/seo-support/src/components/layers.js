import LayerClass from "./Layer/class";

export default (layers) => {
	return function(TargetClass){
		if(!TargetClass.__start_list__){
			TargetClass.__start_list__ = [];
		}

		TargetClass.__start_list__.push(function(){
			this._init_layers = function(){
				Object.keys(layers).forEach(layerName => {
					this[layerName] = new LayerClass(layers[layerName]);
				});
			};

			this._destroy_layers = function(){
				Object.keys(layers).forEach(layerName => {
					this[layerName].destroy();
				});
			};
		});
	};
};