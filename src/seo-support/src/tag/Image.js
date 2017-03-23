import React from "react";

// const __FILE__ = (function(file){
// 	return file.substr(0, file.lastIndexOf("/")) + "/";
// })((document.currentScript || document.scripts[document.scripts.length - 1]).src);

export default class Image extends React.Component {
	shouldComponentUpdate(nextProps, nextState){
		return nextProps.src !== this.props.src;
	}
	render() {
		var {src, style, resizeMode, _util, ...props} = this.props;

		resizeMode = resizeMode || "cover";

		var bgstyle = {};

		switch(resizeMode){
			case "cover":
				bgstyle = {
					backgroundSize: "cover",
					backgroundPosition: "50% 50%"
				};
				break;
			case "contain":
				bgstyle = {
					backgroundSize: "contain",
					backgroundPosition: "50% 50%"
				};
				break;
			case "stretch":
				bgstyle = {
					backgroundSize: "100% 100%"
				};
				break;
		}

		if(_util && /^\.{1,2}\//.test(src)){
			//src = __FILE__ + "assets" + _util.resolve(src);
			//src = await _util.require(src);
			let _src = src;
			src = null;
			(async ()=>{
				src = await _util.require(_src);
				if(this.refs.img){
					this.refs.img.style.backgroundImage = "url(" + src + ")";
				}
				viewImage();
			})();
		}

		style = Object.assign({}, style || {}, src ? {
					backgroundImage: "url(" + src + ")"
				} : {}, bgstyle);

		let viewImage = ()=>{
			if(!src){
				return;
			}

			let image = new window.Image();
			let clear = function(){
				image.onload = image.onabort = image.onerror = null;
				image = null;
			};
			image.onload = ()=>{
				this.refs.img.style.opacity = 1;
				clear();
			};
			image.onabort = image.onerror = clear;
			image.src = src;
		};

		if(typeof style.opacity === "undefined"){
			style.opacity = 0;
			style.transition = (style.transition ? style.transition + "," : "") + "opacity .5s linear";
			viewImage();
		}

		return <span ref="img"
					style={style}
					{...props}>
				</span>
	}
}