import React from "react";
import style from "./index.css";

export default class ScrollView extends React.Component {
	static propTypes = {
		// 加载更多的阀值
		endPointThreshold: React.PropTypes.number
	}

	static defaultProps = {
		endPointThreshold: 60
	}

	constructor(props) {
		super(props);

		this.events = this.transEvent(props);
	}

	loading = false

	transEvent(props){
		var events = {};

		// 加载更多
		if(props.onEndPoint){
			let onScroll = props.onScroll;
			let onEndPoint = props.onEndPoint;
			let horizontal = props.horizontal;
			//delete props.onEndPoint;
			//delete props.endPointThreshold;
			events.onScroll = (e) => {
				if(!this.loading){
					let result;

					if(horizontal){
						if(e.scrollLeft > this.offsetSize){
							result = onEndPoint();
						}
					}else{
						if(e.scrollTop > this.offsetSize){
							result = onEndPoint();
						}
					}

					if(result){
						if(result instanceof Promise){
							this.loading = true;
							(async () => {
								this.loading = await result;
							})();
						}else{
							this.loading = result;
						}
					}
				}

				onScroll && onScroll(e);
			};
		}

		// 下拉刷新
		if(props.onRefresh){
			let onScroll = events.onScroll || props.onScroll;
			let horizontal = props.horizontal;
			let refreshing = false;
			let lastOffset = 0;

			events.onScroll = (e) => {
				if(!refreshing){
					let offset;
					if(horizontal){
						offset = e.scrollLeft;
					}else{
						offset = e.scrollTop;
					}

					if(offset < -100){
						if(offset > lastOffset){
							refreshing = true;
							let result = props.onRefresh();
							if(result instanceof Promise){
								(async () => {
									await result;
									refreshing = false;
								})();
							}else{
								setTimeout(() => {
									refreshing = false;
								}, 500);
							}
						}
						lastOffset = offset;
					}
				}

				onScroll && onScroll(e);
			};
		}

		if(events.onScroll || props.onScroll){
			let onScroll = events.onScroll || props.onScroll;
			events.onScroll = (e) => {
				let container = this.refs.container;
				onScroll({
					get scrollLeft(){
						return container.scrollLeft;
					},

					get scrollTop(){
						return container.scrollTop;
					}
				});
			};
		}

		return events;
	}

	offsetSize = 0

	componentDidMount(){
		// if(this.props.onEndPoint && window.MutationObserver){
		// 	let horizontal = this.props.horizontal;
		// 	let endPointThreshold = this.props.endPointThreshold;
		// 	let container = this.refs.container;

		// 	this.observer = new MutationObserver(() => {
		// 		if(horizontal){
		// 			this.offsetSize = container.scrollWidth - container.offsetWidth - endPointThreshold;
		// 		}else{
		// 			this.offsetSize = container.scrollHeight - container.offsetHeight - endPointThreshold;
		// 		}

		// 		this.loading = false;
		// 	});

		// 	this.observer.observe(container, {
		// 		childList: true,
		// 		attributes: true,
		// 		characterData: true,
		// 		subtree: true
		// 	});
		// }
	}

	componentWillUnmount(){
		if(this.observer){
			this.observer.disconnect();
		}
	}

	componentDidUpdate(){
		if(this.props.onEndPoint){
			let endPointThreshold = this.props.endPointThreshold;
			let container = this.refs.container;

			if(this.props.horizontal){
				this.offsetSize = container.scrollWidth - container.offsetWidth - endPointThreshold;
			}else{
				this.offsetSize = container.scrollHeight - container.offsetHeight - endPointThreshold;
			}

			this.loading = false;
		}
	}
	
	scrollTo(x, y, animated){
		let container = this.refs.container;

		if(animated !== false){
			// 动画滚动
			let baseX = container.scrollLeft;
			let offsetX = x - baseX;
			let baseY = container.scrollTop;
			let offsetY = y - baseY;
			let step = 25;

			let xList = [];
			let yList = [];
			Array.from(new Array(25)).forEach((item, index) => {
				xList[index] = baseX + offsetX * (1 - Math.pow(2, -10 * index / step));
				yList[index] = baseY + offsetY * (1 - Math.pow(2, -10 * index / step));
			});

			(function run(){
				container.scrollLeft = xList.shift();
				container.scrollTop = yList.shift();

				if(xList.length){
					setTimeout(run, 20);
				}else{
					setTimeout(() => {
						container.scrollLeft = x;
						container.scrollTop = y;
					}, 20);
				}
			})();
		}else{
			container.scrollLeft = x;
			container.scrollTop = y;
		}
	}

	render(){
		var {children, className, style, contentContainerStyle, horizontal, onEndPoint, onScroll, endPointThreshold, ...props} = this.props;

		className = className ? [className] : [];
		className.push("ej-scroll-view");
		if(horizontal){
			className.push("ej-scroll-view-h");
		}

		return <div
					ref="container"
					className={className.join(" ")}
					style={style}
					{...props}
					{...this.events}>
					<div
						className={horizontal ? "ej-scroll-view-content ej-scroll-view-h-content" : "ej-scroll-view-content"}
						style={contentContainerStyle}>
						{children}
					</div>
				</div>
	}
}