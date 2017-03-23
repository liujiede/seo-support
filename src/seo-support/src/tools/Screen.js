var documentElement = document.documentElement;

export default {
	// 屏幕的像素密度
	pixelRatio: window.devicePixelRatio,
	// 屏幕尺寸
	get size(){
		return {
			width: documentElement.offsetWidth,
			height: documentElement.offsetHeight
		};
	}
};