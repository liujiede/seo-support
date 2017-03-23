import React from "react";
import scrollIntoView from "./scroll-into-view";
import Screen from "../tools/Screen";

export default class Textarea extends React.Component {
	constructor(props) {
		super(props);
	}

	componentWillMount() {
		// 将自己传出去，让别的节点可以获取自己
		this.props._ref && this.props._ref(this);
	}

	// shouldComponentUpdate(nextProps, nextState){
	// 	return false;
	// }

	focus(){
		this.refs.textarea.focus();
	}

	blur(){
		this.refs.textarea.blur();
	}

	render(){
		var {children, value, onChange, onFocus, onBlur, ...props} = this.props;

		props.onChange = (e)=>{
			this.value = e.target.value;
			onChange && onChange(e);
		};

		var screenHeight = Screen.size.height;

		props.onFocus = (e)=>{
			this.scrollIntoViewHandler = ()=>{
				if(this.scrollToStart){
					clearTimeout(this.scrollToStart);
					this.scrollToStart = null;
				}

				if(this.refs.textarea){
					this.scrollIntoView = scrollIntoView(this.refs.textarea);
				}
			};

			this.scrollIntoViewHandler();

			if(Screen.size.height === screenHeight && document.body.scrollTop === 0){
				this.scrollToStart = setTimeout(()=>{
					if(this.refs.textarea && Screen.size.height === screenHeight && document.body.scrollTop === 0){
						this.scrollIntoView = scrollIntoView(this.refs.textarea, true);
					}
				}, 500);
			}

			window.addEventListener("resize", this.scrollIntoViewHandler, false);

			onFocus && onFocus(e);
		};

		props.onBlur = (e)=>{
			window.removeEventListener("resize", this.scrollIntoViewHandler, false);
			if(this.scrollToStart){
				clearTimeout(this.scrollToStart);
				this.scrollToStart = null;
			}
			if(this.scrollIntoView){
				this.scrollIntoView.clear();
				this.scrollIntoView = null;
			}

			onBlur && onBlur(e);
		};

		// if(props.maxLength){
		// 	props.onKeyDown = (e)=>{
		// 		if(this.value.length >= props.maxLength && ([8, 9, 13, 16, 17, 18, 27, 37, 38, 39, 40].indexOf(e.keyCode) === -1)){
		// 			return false;
		// 		}
		// 	};
		// }

		return <textarea ref="textarea" value={children} {...props}></textarea>
	}
}