import React from "react";
import ReactDOM from "react-dom";
import LayerContainer from "./container";
import Event from "../../lib/event";
import ReadyRun from "../../lib/readyRun";
import Screen from "../../tools/Screen";
import Mode from "./mode";
import {events} from "enjoy-common-support";
import lastRun from "../../lib/last-run";

// 背景蒙版总透明度
const ACTIVE_BG_OPACITY = 0.8;

// 弹层组件
@events("show", "hide")
export default class Layer extends React.Component {
	constructor() {
		super();

		// 打开/关闭方式
		this.activeMode = Mode.downSide;
		// 活动组件的尺寸
		this.activeSize = null;

		this.state = {
			// 之前已打开的所有组件列表（不算最后一个打开的）
			components: [],
			// 活动中的组件
			activeComponent: null,
			// 是否已打开layer
			isOpen: false,
			// 是否显示内容（为了动画的流畅性，在动画过程中不进行内容渲染）
			viewContent: true
		};
	}

	componentWillMount(){
		// // 弹层组件挂载成功后，传出自己，用于在弹层类的实例中使用
		// this.props.hander && this.props.hander(this);
	}

	componentDidMount(){
		this.size();
		// 弹层组件挂载成功后，传出自己，用于在弹层类的实例中使用
		this.props.hander && this.props.hander(this);

		// this.resizeHander = lastRun(()=>{
		// 	if(this.state.isOpen){
		// 		this.onResize();
		// 	}
		// });
		this.resizeHander = ()=>{
			if(this.state.isOpen){
				this.onResize();
			}
		};
		window.addEventListener("resize", this.resizeHander);
	}

	componentDidUpdate(){
		this.size();
	}

	componentWillUnmount(){
		if(this.resizeHander){
			window.removeEventListener("resize", this.resizeHander);
		}
	}

	// 设置活动组件的尺寸
	size(){
		var activeComponent = this.refs.active;
		if(activeComponent){
			activeComponent = ReactDOM.findDOMNode(activeComponent);
			this.activeSize = {
				width: activeComponent.offsetWidth,
				height: activeComponent.offsetHeight
			};
		}
	}

	onResize(){
		var container = this.refs.container;
		var height = Screen.size.height;
		if(container){
			container.style.height = height + "px";
			container.style.top = -height + "px";
			this.size();
			this.resetCloseAnimate();
		}
	}

	// 添加一个组件到弹层
	fill(component, onSync, activeComponentDisabled){
		var event = Event(["show", "hide"]);

		var components = this.state.components;

		if(!activeComponentDisabled && this.state.activeComponent){
			components.push(this.state.activeComponent);
		}

		this.activeSize = null;

		this.setState({
			components: components,
			activeComponent: {
				component: component,
				event: event
			}
		}, onSync);

		return event;
	}

	// 展示弹层
	show(mode){
		if(mode){
			this.activeMode = +mode;
		}

		this.resetOpenAnimate();

		this.setState({
			isOpen: true
		});

		this.state.activeComponent.event.fire.apply(this.state.activeComponent.event, ["show"]);
		this.fireShow();

		setTimeout(() => {
			this.runOpenAnimate();
		}, 1);

		if(this.hideHander){
			clearTimeout(this.hideHander);
			this.hideHander = null;
		}
	}

	hideHander = null
	// 隐藏弹层
	hide(...params){
		this.resetCloseAnimate();

		var components = this.state.components;

		if(!this.state.activeComponent){
			this.setState({
				activeComponent: components.pop(),
				components: components
			});
		}

		this.state.activeComponent.event.fire.apply(this.state.activeComponent.event, ["hide"].concat(params));

		this.runCloseAnimate();

		if(components.length === 0){
			this.hideHander = setTimeout(() => {
				this.hideHander = null;
				this.setState({
					isOpen: false
				});
				this.fireHide(...params);
			}, 500);
		}
	}

	// 添加一个组件并展示出来
	open(component, mode){
		var activeComponentDisabled = false;
		if(this.closeHander){
			clearTimeout(this.closeHander);
			this.closeHander = null;
			activeComponentDisabled = true;
		}
		return this.fill(component, () => {
			this.show(mode);
		}, activeComponentDisabled);
	}

	closeHander = null
	// 隐藏弹层并删除活动组件
	close(...params){
		this.hide(...params);

		this.closeHander = setTimeout(() => {
			this.setState({
				activeComponent: null
			});
		}, 500);
	}

	animate(isOpen){
		if(isOpen){
			this.refs.layer.style.transition = "transform .5s cubic-bezier(0, 1, 0.75, 1), opacity .5s cubic-bezier(0, 1, 0.75, 1)";
			this.refs.bg.style.transition = "opacity .5s cubic-bezier(0, 1, 0.75, 1)";
		}else{
			this.refs.layer.style.transition = "";
			this.refs.bg.style.transition = "";
		}
	}

	resetOpenAnimate(){
		var windowSize = Screen.size;
		var componentSize = this.activeSize || windowSize;

		this.animate(false);
		switch(this.activeMode){
			case Mode.downSide:
				this.refs.layer.style.transform = "translateY(" + windowSize.height + "px)";
				break;
			case Mode.upSide:
				this.refs.layer.style.transform = "translateY(" + -componentSize.height + "px)";
				break;
			case Mode.leftSide:
				this.refs.layer.style.transform = "translateX(" + -componentSize.width + "px)";
				break;
			case Mode.rightSide:
				this.refs.layer.style.transform = "translateX(" + windowSize.width + "px)";
				break;
			case Mode.scaleUp:
				this.refs.layer.style.transform = "translateX(" + (windowSize.width - componentSize.width) + "px) translateY(" + (windowSize.height - componentSize.height) + "px) scale(2)";
				this.refs.layer.style.opacity = 0;
				break;
			case Mode.scaleDown:
				this.refs.layer.style.transform = "translateX(0) translateY(0) scale(0)";
				this.refs.layer.style.opacity = 0;
				break;
			case Mode.opacity:
				this.refs.layer.style.opacity = 0;
				break;
			case Mode.downSideCenter:
				this.refs.layer.style.transform = "translateY(" + windowSize.height + "px)";
				break;
		}

		this.refs.bg.style.opacity = 0;
	}

	runOpenAnimate(){
		var windowSize = Screen.size;
		var componentSize = this.activeSize || windowSize;

		this.animate(true);
		switch(this.activeMode){
			case Mode.downSide:
				this.refs.layer.style.transform = "translateY(" + (windowSize.height - componentSize.height) + "px)";
				break;
			case Mode.upSide:
				this.refs.layer.style.transform = "translateY(0)";
				break;
			case Mode.leftSide:
				this.refs.layer.style.transform = "translateX(0)";
				break;
			case Mode.rightSide:
				this.refs.layer.style.transform = "translateX(" + (windowSize.width - componentSize.width) + "px)";
				break;
			case Mode.scaleUp:
			case Mode.scaleDown:
				this.refs.layer.style.transform = "translateX(" + ((windowSize.width - componentSize.width) / 2) + "px) translateY(" + ((windowSize.height - componentSize.height) / 2) + "px) scale(1)";
				this.refs.layer.style.opacity = 1;
				break;
			case Mode.opacity:
				this.refs.layer.style.opacity = 1;
				break;
			case Mode.downSideCenter:
				this.refs.layer.style.transform = "translateY(" + (windowSize.height/2 - componentSize.height/2) + "px)";
				break;

		}

		// 如果弹出的层不能完全充满屏幕，则显示背景遮罩
		if(componentSize.width < windowSize.width || componentSize.height < windowSize.height){
			this.refs.bg.style.opacity = ACTIVE_BG_OPACITY;
		}
	}

	resetCloseAnimate(){
		var windowSize = Screen.size;
		var componentSize = this.activeSize || windowSize;

		this.animate(false);
		switch(this.activeMode){
			case Mode.downSide:
				this.refs.layer.style.transform = "translateY(" + (windowSize.height - componentSize.height) + "px)";
				break;
			case Mode.upSide:
				this.refs.layer.style.transform = "translateY(0)";
				break;
			case Mode.leftSide:
				this.refs.layer.style.transform = "translateX(0)";
				break;
			case Mode.rightSide:
				this.refs.layer.style.transform = "translateX(" + (windowSize.width - componentSize.width) + "px)";
				break;
			case Mode.scaleUp:
			case Mode.scaleDown:
				this.refs.layer.style.transform = "translateX(" + ((windowSize.width - componentSize.width) / 2) + "px) translateY(" + ((windowSize.height - componentSize.height) / 2) + "px) scale(1)";
				this.refs.layer.style.opacity = 1;
				break;
			case Mode.opacity:
				this.refs.layer.style.opacity = 1;
				break;
			case Mode.downSideCenter:
				this.refs.layer.style.transform = "translateY(" + (windowSize.height/2 - componentSize.height/2) + "px)";
				break;
		}

		// 如果弹出的层不能完全充满屏幕，则显示背景遮罩
		if(componentSize.width < windowSize.width || componentSize.height < windowSize.height){
			this.refs.bg.style.opacity = ACTIVE_BG_OPACITY;
		}
	}

	runCloseAnimate(){
		var windowSize = Screen.size;
		var componentSize = this.activeSize || windowSize;

		this.animate(true);
		switch(this.activeMode){
			case Mode.downSide:
				this.refs.layer.style.transform = "translateY(" + windowSize.height + "px)";
				break;
			case Mode.upSide:
				this.refs.layer.style.transform = "translateY(" + -componentSize.height + "px)";
				break;
			case Mode.leftSide:
				this.refs.layer.style.transform = "translateX(" + -componentSize.width + "px)";
				break;
			case Mode.rightSide:
				this.refs.layer.style.transform = "translateX(" + windowSize.width + "px)";
				break;
			case Mode.scaleUp:
				this.refs.layer.style.transform = "translateX(" + (windowSize.width - componentSize.width) + "px) translateY(" + (windowSize.height - componentSize.height) + "px) scale(2)";
				this.refs.layer.style.opacity = 0;
				break;
			case Mode.scaleDown:
				this.refs.layer.style.transform = "translateX(0) translateY(0) scale(0)";
				this.refs.layer.style.opacity = 0;
				break;
			case Mode.opacity:
				this.refs.layer.style.opacity = 0;
				break;
			case Mode.downSideCenter:
				this.refs.layer.style.transform = "translateY(" + windowSize.height + "px)";
				break;
		}

		// 如果弹出的层不能完全充满屏幕，则显示背景遮罩
		if(componentSize.width < windowSize.width || componentSize.height < windowSize.height){
			this.refs.bg.style.opacity = 0;
		}
	}

	render() {
		var backgroundLayer = this.state.components.map(component => {
			return <div style={styles.layer}>
						<component.component layer={this} />
					</div>
		});

		var ActiveComponent = this.state.activeComponent ? this.state.activeComponent.component : "div";

		var height = Screen.size.height;

		var activeBg = <div
							ref="bg"
							style={Object.assign({}, styles.layer, {
								backgroundColor: "#000",
								opacity: 0
							})}
							onClick={()=>{
								(this.props.layerInstance || this).hide();
							}}>
						</div>

		return <div
					ref="container"
					style={Object.assign({}, styles.layer, {
						height: height,
						top: -height,
						WebkitTransform: "translateX(" + (this.state.isOpen ? 0 : 10000) + "px)",
						transform: "translateX(" + (this.state.isOpen ? 0 : 10000) + "px)"
					})}>
					{ backgroundLayer }
					{ activeBg }
					<div
						ref="layer"
						style={styles.layer}>
						{
							ActiveComponent !== "div" ? <ActiveComponent ref="active" layer={this.props.layerInstance || this} /> : <ActiveComponent ref="active" />
						}
					</div>
				</div>
	}
}

var styles = {
	layer: {
		position: "absolute",
		left: 0,
		right: 0,
		top: 0,
		bottom: 0
	}
};