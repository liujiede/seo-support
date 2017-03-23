import React from "react";

function compare(obj1, obj2){
	if(obj1 === obj2){
		return true;
	}

	var obj1Keys = Object.keys(obj1);
	var obj2Keys = Object.keys(obj2);

	if(obj1Keys.length === obj2Keys.length && obj1Keys.every(key => {
			return obj1[key] === obj2[key];
		})){
		return true;
	}
	return false;
}

function NOOP(){}

export default class PageClass extends React.Component {
	// 视图对象
	view = {
		render: function(){
			return null;
		}
	}

	constructor(props){
		super(props);

		let pageInfo = props._pageInfo;
		if(pageInfo){
			this.page = {
				url: pageInfo.url,
				referrer: pageInfo.url,
				go: pageInfo.navigator.go,
				replace: pageInfo.navigator.replace,
				back: pageInfo.navigator.back,
				reload: pageInfo.navigator.reload,
				navbar: pageInfo.navigator.navbar
			};
		}else{
			this.page = {
				url: "",
				referrer: "",
				go: NOOP,
				replace: NOOP,
				back: NOOP,
				reload: NOOP,
				navbar: null
			};
		}
	}

	componentWillMount(){
		//this._init_start_time = +new Date();

		this._refs = {};
		if(this.view.header && this.view.header.render){
			this.view.header.render();
		}
	}

	componentDidMount(){
		// 初始化挂在的浮层
		if(this._init_layers){
			this._init_layers();
		}
		//console.log(this.constructor.name + " init time: " + (+new Date() - this._init_start_time) + "ms");
	}

	componentWillUpdate(){
		//this._update_start_time = +new Date();
	}

	componentDidUpdate(){
		//console.log(this.constructor.name + " update time: " + (+new Date() - this._update_start_time) + "ms");
	}

	componentWillUnmount(){
		// 卸载挂载的浮层
		if(this._destroy_layers){
			this._destroy_layers();
		}
		//console.log(this.constructor.name + ": willUnmount");
	}

	shouldComponentUpdate(nextProps, nextState){
		
		// if(compare(this.state, nextState)){
		// 	return false;
		// }

		return true;
	}

	// 向页面底部附加组件
	_attached_components = null
	appendComponent(component){
		if(!this._attached_components){
			this._attached_components = [];
		}
		this._attached_components.push(component);

		this.setState({
			_attached_components: this._attached_components
		});
	}

	render(){
		setTimeout(() => {
			if(this.view.header && this.view.header.render && this.view.header.check()){
				this.view.header.render();
			}
		}, 1);
		
		return this.view.render(this.state ? this.state._attached_components : null);
	}
};