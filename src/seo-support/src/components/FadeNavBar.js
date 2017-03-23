import React from "react";

export default class FadeNavBar extends React.Component {
	constructor(props) {
		super(props);

		this.progress(props.progress);
	}

	componentWillReceiveProps(nextProps){
		this.progress(nextProps.progress);
	}

	progress(progress){
		progress = Math.max(0, Math.min(1, progress));

		if(this.refs.layer0 && this.refs.layer1){
			this.refs.layer1.style.opacity = progress;
			this.refs.layer0.style.opacity = 1 - progress;
		}
	}

	render(){
		var { children } = this.props;

		return <div
					style={styles.layer}>
					{
						React.Children.map(children, (child, index) => {
							switch(index){
								case 0:
									return <div ref="layer0"
												style={Object.assign({}, styles.layer, {
													opacity: 1
												})}>
												{child}
											</div>
									break;
								case 1:
									return <div ref="layer1"
												style={Object.assign({}, styles.layer, {
													opacity: 0
												})}>
												{child}
											</div>
									break;
							}
							return null;
						})
					}
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