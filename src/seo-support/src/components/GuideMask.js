import React from "react";
import ReactDOM from "react-dom";
import ReadyRun from "../lib/readyRun";
import Screen from "../tools/Screen";
import NodeMethods from "../tools/NodeMethods";
import asyncList from "../lib/asyncList";

var layerContainer;
var waitLayerContainer = new ReadyRun();

var {width, height} = Screen.size;
// 屏幕对角线的长度
var borderWidth = Math.pow(Math.pow(width, 2) + Math.pow(height, 2), 0.5) | 0;

// 所有弹出层Layer的包裹容器，挂载在Container节点下
export class GuideMask extends React.Component {
	constructor() {
		super();

		this.state = {
			isOpen: false,
			left: 0,
			top: 0,
			width: 0,
			height: 0,
			radius: 0,
			maskAnimated: false,
			infoNode: null,
			infoLeft: 0,
			infoTop: 0,
			infoOpacity: 0,
			infoScale: 0.5,
			infoAnimated: false
		};
	}

	componentDidMount(){
		layerContainer = this;
		waitLayerContainer.ready();
	}

	points = []

	viewPoint(animated){
		animated = animated !== false;

		if(this.points.length){
			let point = this.points.shift();

			let showInfo = () => {
				if(point.info){
					if(animated){
						this.setState({
							infoNode: point.info.target,
							infoLeft: point.info.left,
							infoTop: point.info.top
						}, () => {
							this.refs.info.style.transition = styles.animateLinear;
							this.setState({
								infoAnimated: true,
								infoOpacity: 1,
								infoScale: 1
							});
						});
					}else{
						if(this.refs.info){
							this.refs.info.style.transition = "";
						}

						this.setState({
							infoAnimated: false,
							infoNode: point.info.target,
							infoOpacity: 1,
							infoScale: 1
						});
					}
				}else{
					this.setState({
						infoNode: null
					});
				}

				if(this.points.length === 0){
					this.close();
				}
			};

			if(this.refs.mask){
				this.refs.mask.style.transition = animated ? styles.animateOutExp : "";
			}

			this.setState({
				maskAnimated: animated,
				left: point.target.left,
				top: point.target.top,
				width: point.target.width + borderWidth * 2,
				height: point.target.height + borderWidth * 2,
				radius: point.radius + borderWidth
			});

			if(this.state.infoNode){
				if(this.refs.info){
					this.refs.info.style.transition = animated ? styles.animateLinear : "";
				}

				this.setState({
					infoAnimated: animated,
					infoOpacity: 0,
					infoScale: 0.5
				});
			}

			if(animated){
				setTimeout(() => {
					showInfo();
				}, 500);
			}else{
				showInfo();
			}
		}
	}

	_open(points){
		this.points = points;

		this.viewPoint(false);

		this.setState({
			isOpen: true
		}, () => {
			this.viewPoint();
		});
	}

	open(points){
		points.unshift({
			target: {
				left: 0,
				top: 0,
				width: width,
				height: height
			}
		});
		points.push({
			target: {
				left: 0,
				top: 0,
				width: width,
				height: height
			}
		});

		asyncList(points.map(point => {
			return (callback) => {
				let transOther = () => {
					// 计算padding
					let padding = point.padding;
					if(padding){
						let paddingTop = 0;
						let paddingRight = 0;
						let paddingBottom = 0;
						let paddingLeft = 0;

						switch(typeof padding){
							case "number":
								paddingTop = paddingRight = paddingBottom = paddingLeft = padding;
								break;
							case "string":
								padding = padding.split(/\s+/);
								switch(padding.length){
									case 1:
										paddingTop = paddingRight = paddingBottom = paddingLeft = +padding[0];
										break;
									case 2:
										paddingTop = paddingBottom = +padding[0];
										paddingRight = paddingLeft = +padding[1];
										break;
									case 3:
										paddingTop = +padding[0];
										paddingRight = paddingLeft = +padding[1];
										paddingBottom = +padding[2];
										break;
									case 4:
										paddingTop = +padding[0];
										paddingRight = +padding[1];
										paddingBottom = +padding[2];
										paddingLeft = +padding[3];
										break;
								}
								break;
						}

						point.target.left -= paddingLeft;
						point.target.top -= paddingTop;
						point.target.width += paddingLeft + paddingRight;
						point.target.height += paddingTop + paddingBottom;
					}

					if(!point.radius){
						point.radius = 0;
					}else if(point.radius === "half"){
						point.radius = Math.min(point.target.width, point.target.height) / 2;
					}

					if(point.info){
						if(!point.info.offset){
							point.info.offset = {
								left: 0,
								top: 0
							};
						}

						point.info.left = point.target.left + point.info.offset.left;
						point.info.top = point.target.top + point.info.offset.top;
					}

					callback();
				};

				if(point.target instanceof React.Component){
					point.target = ReactDOM.findDOMNode(point.target);
				}

				if(point.target instanceof Element){
					NodeMethods(point.target).measure((x, y, width, height) => {
						point.target = {
							left: x,
							top: y,
							width: width,
							height: height
						};

						transOther();
					});
				}else{
					transOther();
				}
			};
		}), () => {
			this._open(points);
		});
	}

	close(){
		this.setState({
			isOpen: false
		});
	}

	render(){
		if(this.state.isOpen){
			return <div style={styles.container} onClick={this.viewPoint.bind(this)}>
						<div
							ref="mask"
							style={Object.assign({}, styles.mask, this.state.maskAnimated ? styles.animateOutExp : null, {
								transform: `translateX(${this.state.left}px) translateY(${this.state.top}px)`,
								width: this.state.width,
								height: this.state.height,
								borderRadius: this.state.radius
							})}>
						</div>
						<div
							ref="info"
							style={Object.assign({}, styles.info, this.state.infoAnimated ? styles.animateLinear : null, {
								transform: `translateX(${this.state.infoLeft}px) translateY(${this.state.infoTop}px) scale(${this.state.infoScale})`,
								opacity: this.state.infoOpacity
							})}>
							{this.state.infoNode}
						</div>
					</div>
		}else{
			return null;
		}
	}
}

var styles = {
	container: {
		position: "absolute",
		left: 0,
		right: 0,
		top: 0,
		bottom: 0,
		overflow: "hidden",
		backgroundColor: "transparent"
	},
	mask: {
		position: "absolute",
		left: -borderWidth,
		top: -borderWidth,
		borderWidth: borderWidth,
		borderStyle: "solid",
		borderColor: "rgba(0,0,0,.8)"
	},
	info: {
		position: "absolute",
		left: 0,
		top: 0
	},
	animateLinear: {
		transition: "all .2s linear"
	},
	animateOutExp: {
		transition: "all .5s cubic-bezier(0.19, 1, 0.22, 1)"
	}
};

export default {
	open(points){
		waitLayerContainer.ready(() => {
			layerContainer.open(points);
		});
	},
	close(){
		waitLayerContainer.ready(() => {
			layerContainer.close();
		});
	}
};