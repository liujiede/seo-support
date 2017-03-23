import React from "react";
import style from "./index.css";

export default class SwiperPager extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			index: 0
		};
	}

	select(index){
		this.setState({
			index: index
		});
	}

	render(){
		var {count, current, className, style, itemStyle, currentStyle} = this.props;

		className = className ? [className] : [];
		className.push("ej-swiper-pager");

		return <div
					className={className.join(" ")}
					style={style}>
					{
						new Array(count + 1).join("|").split("").map((item, index) => {
							if(index === current){
								return <div className="item current" style={Object.assign({}, itemStyle, currentStyle)}></div>
							}else{
								return <div className="item" style={itemStyle}></div>
							}
						})
					}
				</div>
	}
}