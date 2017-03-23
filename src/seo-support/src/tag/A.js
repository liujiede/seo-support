import React from "react";

export default class A extends React.Component {
	constructor(props) {
		super(props);
	}

	componentWillMount() {
		// 将自己传出去，让别的节点可以获取自己
		this.props._ref && this.props._ref(this);
	}

	render(){
		var {href, onClick, children, _util, _navigator, target, ...props} = this.props;

		return <a onClick={(e)=>{
						if((onClick || function(){})(e) !== false && _navigator){
							if(target === "_replace"){
								_navigator.replace(_util.resolve(href));
							}else{
								_navigator.go(_util.resolve(href));
							}
						}
					}}
					{...props}>
					{children}
				</a>
	}
}