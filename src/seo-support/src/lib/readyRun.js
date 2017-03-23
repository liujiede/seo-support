export default class ReadyRun {
	constructor(){
		this.isReady = false;
		this.waitings = [];
	}

	ready(fn){
		if(fn){
			if(this.isReady){
				fn();
			}else{
				this.waitings.push(fn);
			}
		}else{
			this.isReady = true;
			if(this.waitings.length){
				this.waitings.forEach(fn => {
					fn();
				});
				this.waitings = [];
			}
		}
	}
}