import React from "react";
import Swipe from "swipe-js-iso";
import style from "./index.css";

export default class Swiper extends React.Component {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		var { autoplay, loop, onChange } = this.props;

		if(autoplay && typeof autoplay !== "number"){
			autoplay = 5000;
		}

		this.swipe = Swipe(this.refs.container, {
			auto: autoplay,
			continuous: !!loop,
			callback: onChange
		});
	}

	componentDidUpdate(){
		this.swipe.setup();
	}

	stop(){
		//this.swipe.stop();
	}

	play(){
		//this.swipe.begin();
	}

	scrollTo(index, animated){
		if(animated === false){
			this.swipe.slide(index, 0);
		}else{
			this.swipe.slide(index);
		}
	}

	render(){
		var { className, style, children } = this.props;
		var count = React.Children.count(children);

		return <div
					ref="container"
					className={className}
					style={Object.assign({
						position: "relative"
					}, style || {}, {
						overflow: "hidden"
					})}>
					<div
						className="ej-swiper-content"
						style={{
							width: count * 100 + "%",
						}}>
						{
							React.Children.map(this.props.children, (child) => {
								return <div className="ej-swiper-item">
											{child}
										</div>
							})
						}
					</div>
				</div>
	}
}