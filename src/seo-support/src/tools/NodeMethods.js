import React from "react";
import ReactDOM from "react-dom";

function getPos(node){
	var x = 0, y = 0;

	while(node){
		x += node.offsetLeft;
		y += node.offsetTop;

		node = node.offsetParent;
	}

	return {
		x: x,
		y: y
	};
}

export default function NodeMethods(node){
	if(node instanceof React.Component){
		node = ReactDOM.findDOMNode(node);
	}

	return {
		measure(offsetParent, callback){
			if(offsetParent instanceof React.Component){
				offsetParent = ReactDOM.findDOMNode(offsetParent);
			}else if(offsetParent === "parent"){
				offsetParent = node.parentNode;
			}

			var pos = getPos(node);

			if(arguments.length === 2){
				let parentPos = getPos(offsetParent);
				callback(pos.x - parentPos.x, pos.y - parentPos.y, node.offsetWidth, node.offsetHeight);
			}else{
				callback = offsetParent;
				callback(pos.x, pos.y, node.offsetWidth, node.offsetHeight);
			}
		},

		get style(){
			return window.getComputedStyle(node, null);
		},

		set style(style){
			var styleText = [];
			for(var property in style){
				styleText.push(property.replace(/([A-Z])/g, "-$1") + ":" + style[property]);
			}
			node.style.cssText = styleText.join(";");
		},

		setNativeProps(props){
			//nativeNode.setNativeProps(props);
		}
	};
}