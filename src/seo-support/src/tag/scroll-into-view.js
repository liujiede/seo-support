import NodeMethods from "../tools/NodeMethods";

function scrollIntoView(target, isToStart, scrollView){
	if(!scrollView){
		scrollView = [];

		let tempNode = target.parentNode;
		while(tempNode && tempNode.tagName !== "BODY"){
			if(tempNode.classList.contains("ej-tag-scroll-view")){
				scrollView.push(tempNode);
			}
			tempNode = tempNode.parentNode;
		}
	}

	let clearList = [];

	if(scrollView.length){
		let container = scrollView.shift();
		let scrollLeft = container.scrollLeft;
		let scrollTop = container.scrollTop;
		let containerWidth = container.offsetWidth;
		let containerHeight = container.offsetHeight;
		NodeMethods(target).measure(container, (x, y, width, height)=>{
			if(x < scrollLeft){
				container.scrollLeft = x;
			}else if(x + width > scrollLeft + containerWidth){
				container.scrollLeft = Math.min(x, x + width - containerWidth);
			}

			if(isToStart){
				if(y + containerHeight > container.scrollHeight){
					let offsetHeight = y + containerHeight - container.scrollHeight;
					container.style.paddingBottom = offsetHeight + "px";
					clearList.push(function(){
						container.style.paddingBottom = "";
					});
				}
				container.scrollTop = y;
			}else{
				if(y < scrollTop){
					container.scrollTop = y;
				}else if(y + height > scrollTop + containerHeight){
					container.scrollTop = Math.min(y, y + height - containerHeight);
				}
			}
		});

		clearList.push(scrollIntoView(container, isToStart, scrollView).clear);
	}

	return {
		clear: function(){
			clearList.forEach(fn => fn());
		}
	};
}

export default function(target, isToStart){
	return scrollIntoView(target, isToStart);
};