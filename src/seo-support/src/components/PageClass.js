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

export default class PageClass extends React.Component {
	constructor(props){
		super(props);
	}

	componentWillMount(){
		this._init_start_time = +new Date();

		this._refs = {};
		if(this.view.header && this.view.header.render){
			this.view.header.render();
		}
	}

	componentDidMount(){
		console.log(this.constructor.name + " init time: " + (+new Date() - this._init_start_time) + "ms");
	}

	componentWillUpdate(){
		this._update_start_time = +new Date();
	}

	componentDidUpdate(){
		//console.log(this.constructor.name + " update time: " + (+new Date() - this._update_start_time) + "ms");
	}

	shouldComponentUpdate(nextProps, nextState){
		
		// if(compare(this.state, nextState)){
		// 	return false;
		// }

		return true;
	}

	render(){
		setTimeout(() => {
			if(this.view.header && this.view.header.render && this.view.header.check()){
				this.view.header.render();
			}
		}, 1);
		
		return this.view.render();
	}
};