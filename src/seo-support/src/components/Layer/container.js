import React from 'react';
import Layer from "./layer";
import ReadyRun from "../../lib/readyRun";

var layerContainer;
var waitLayerContainer = new ReadyRun();

// 所有弹出层Layer的包裹容器，挂载在Container节点下
export class LayerContainer extends React.Component {
	constructor() {
		super();

		this.state = {
			layers: []
		};
	}

	componentDidMount(){
		layerContainer = this;
		waitLayerContainer.ready();
	}

	add(layer, hander){
		var index = this.state.layers.length;

		this.state.layers.push(<Layer key={index} hander={hander} layerInstance={layer} />);

		this.setState({
			layers: this.state.layers
		});

		return index;
	}

	remove(index){
		this.state.layers[index] = null;
	}

	render(){
		return <div ref="container"
					style={styles.container}>
					{
						this.state.layers.filter(layer => layer !== null)
					}
				</div>
	}
}

var styles = {
	container: {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 0,
		height: 0
	}
};

export default {
	add: function(layer, hander){
		waitLayerContainer.ready(() => {
			layerContainer.add(layer, hander);
		});
	},
	remove: function(index){
		waitLayerContainer.ready(() => {
			layerContainer.remove(index);
		});
	}
};