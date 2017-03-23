import React from 'react';
import ReadyRun from "../lib/readyRun";
import Screen from "../tools/Screen";

var layerContainer;
var waitLayerContainer = new ReadyRun();

const margin = 20;

// 所有弹出层Layer的包裹容器，挂载在Container节点下
export class Toast extends React.Component {
	constructor() {
		super();

		this.state = {
			isShow: false,
			message: ""
		};
	}

	componentDidMount(){
		layerContainer = this;
		waitLayerContainer.ready();
	}

	show(message, duration){
		this.setState({
			isShow: true,
			message: message
		}, () => {
			let node = this.refs.node;
			let winSize = Screen.size;
			let msgSize = {
				width: node.offsetWidth,
				height: node.offsetHeight
			};

			node.style.left = ((winSize.width - msgSize.width) / 2 - margin) + "px";
			node.style.top = ((winSize.height - msgSize.height) / 2 - margin) + "px";
			node.style.transition = "opacity .05s linear";
			node.style.opacity = 1;

			setTimeout(() => {
				node.style.transition = "opacity .3s linear";
				node.style.opacity = 0;
				setTimeout(() => {
					this.setState({
						isShow: false
					});
				}, 300);
			}, duration || 1500);
		});
	}

	render(){
		if(this.state.isShow){
			return <span style={styles.message} ref="node">
					{this.state.message}
					</span>
		}else{
			return null;
		}
	}
}

var styles = {
	message: {
		position: "absolute",
		fontSize: "12px",
		lineHeight: "18px",
		color: "#fff",
		backgroundColor: "rgba(0,0,0,.8)",
		borderRadius: "5px",
		padding: "10px",
		margin: margin + "px"
	}
};

export default {
	show(message, duration){
		waitLayerContainer.ready(() => {
			layerContainer.show(message, duration);
		});
	},
	SHORT: 1500,
	LONG: 3000
};