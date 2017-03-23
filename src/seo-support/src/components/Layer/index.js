import LayerClass from "./class";
import Mode from "./mode";

var layer = new LayerClass();

export default {
	open: function(component, mode){
		if(layer){
			return layer.open(component, mode);
		}
	},
	close: function(...params){
		if(layer){
			layer.close(...params);
		}
	},
	LayerClass: LayerClass,
	Mode: Mode
};