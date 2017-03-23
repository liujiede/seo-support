import React from "react";
import { LayerContainer } from "./Layer/container";
import { GuideMask } from "./GuideMask";
import { Toast } from "./Toast";
import ReadyRun from "../lib/readyRun";

var container;
var waitContainer = new ReadyRun();

var styles = {
	container: {
		position: "absolute",
		left: 0,
		right: 0,
		top: 0,
		bottom: 0,
		overflow: "hidden"
	}
};

export default class Container extends React.Component {
	constructor() {
		super();

		this.state = {
			_attached_components: null
		};
	}

	componentWillMount(){
		container = this;
		waitContainer.ready();
	}

	// 向页面底部附加组件
	_attached_components = null
	appendComponent(component, zIndex){
		zIndex = zIndex || 0;
		if(!this._attached_components){
			this._attached_components = [];
		}

		this._attached_components.push({
			component: component,
			zIndex: zIndex
		});

		this._attached_components.sort((c1, c2) => {
			return c1.zIndex - c2.zIndex;
		});

		this.setState({
			_attached_components: this._attached_components.map((component) => {
				return component.component;
			})
		});
	}

	static appendComponent(component, zIndex){
		waitContainer.ready(() => {
			container.appendComponent(component, zIndex);
		});
	}

	render(){
		return <div style={ styles.container }>
					{ this.props.children }
					<LayerContainer />
					<GuideMask />
					<Toast />
					{ this.state._attached_components }
				</div>
	}
}