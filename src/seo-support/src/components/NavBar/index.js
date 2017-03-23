import React from "react";
import ReactDOM from "react-dom";
import style from "./index.css";

export default class NavBar extends React.Component {
	constructor(props) {
		super(props);

		// 导航栏是否已隐藏
		this.containerIsHide = true;
		// 是否是后退（主要用于区分前进后退动画）
		this.isBack = false;
		// 是否是切页面(主要用于防止当页重绘页头时的动画效果)
		this.isSwitch = false;

		this.content = null;
	}

	componentDidMount(){
		this.refs.prev.addEventListener('webkitTransitionEnd', function(){
			this.classList.remove("ej-navbar-layer-animate");
		}, false);
		this.refs.current.addEventListener('webkitTransitionEnd', function(){
			this.classList.remove("ej-navbar-layer-animate");
		}, false);
	}

	shouldComponentUpdate(){
		return false;
	}

	show(){
		if(!this.containerIsHide){
			return;
		}
		this.containerIsHide = false;

		this.refs.navbar.classList.remove("ej-navbar-hide");
	}

	hide(){
		if(this.containerIsHide){
			return;
		}
		this.containerIsHide = true;

		this.refs.navbar.classList.add("ej-navbar-hide");
	}

	view(content){
		var prev = this.refs.prev;
		var current = this.refs.current;

		if(this.isSwitch){
			if(this.content){
				ReactDOM.render(this.content, prev);
			}
			prev.style.opacity = 1;
			ReactDOM.render(content, current);
			current.style.opacity = 0;
			setTimeout(()=>{
				prev.classList.add("ej-navbar-layer-animate");
				prev.style.opacity = 0;
				current.classList.add("ej-navbar-layer-animate");
				current.style.opacity = 1;
			}, 1);
		}else{
			ReactDOM.render(content, current);
		}

		// if(this.content){
		// 	//ReactDOM.render(React.createElement(this.content), prev);
		// 	ReactDOM.render(this.content, prev);
		// 	if(this.isSwitch){
		// 		prev.style.opacity = 1;
		// 		setTimeout(()=>{
		// 			prev.classList.add("ej-navbar-layer-animate");
		// 			prev.style.opacity = 0;
		// 		}, 1);
		// 	}
		// }

		// //ReactDOM.render(React.createElement(content), current);
		// ReactDOM.render(content, current);
		// if(this.isSwitch){
		// 	current.style.opacity = 0;
		// 	setTimeout(()=>{
		// 		current.classList.add("ej-navbar-layer-animate");
		// 		current.style.opacity = 1;
		// 	}, 1);
		// }

		this.content = content;

		this.isSwitch = false;
	}
	// 导航栏分为三种情况
	// 1、不显示导航栏（header为空）
	// 2、显示静态导航栏（header不为空，header.render也不为空，通过header.render渲染出静态导航栏）
	// 3、显示动态导航栏（header不为空，header.render为空，导航栏显示节点等待程序中调用view方法来渲染）
	// util为提供给导航栏渲染时的工具包，包括导航的方法
	checkHeader(header, util, isBack){
		this.isBack = isBack;
		// 如果header不为空，则显示头部
		if(header){
			this.isSwitch = true;
			this.show();
			// 如果有填充内容，则填充头部
			if(header.render){
				this.view(header.render(util));
			}
		}else{
			this.hide();
		}
	}

	render(){
		return <div class="ej-navbar ej-navbar-hide" ref="navbar">
					<div class="ej-navbar-layer" ref="prev"></div>
					<div class="ej-navbar-layer" ref="current"></div>
				</div>
	}
}