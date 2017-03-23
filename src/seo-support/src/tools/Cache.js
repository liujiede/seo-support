import { Listener } from "enjoy-common-support";
const listener = Listener();

// 是否支持
var hasSessionStorage = false;
try {
	hasSessionStorage = ('sessionStorage' in window) && window['sessionStorage'] !== null;
} catch (ex) { }

// ctrl + F5 清空
// if(hasSessionStorage){
// 	document.addEventListener("keydown", function(e){
// 		if(e.keyCode == 116 && e.ctrlKey){
// 			sessionStorage.clear();
// 		}
// 	}, false);
// }
var cache = {};
// 存储的数据格式: type:expires@data
// 暂时不处理expires
export default Object.assign(hasSessionStorage ? {

	get(key){
		return new Promise((resolve,reject)=>{
			let value = sessionStorage.getItem(key);

			if(value !== null){
				value = value.split("@");
				if(value.length > 1 ){
					let head = value.shift().split(":");
					value = value.join("@");

					if(head[0] !== "string"){
						value = JSON.parse(value);
					}

					resolve(value);
				}else{
					this.remove(key);
					reject({ message: 'get value为非法格式'});
				}
			}else {
				reject({ message: 'can not find value'});
			}
		})
	},
	set(key, value, expires){
		return new Promise((resolve,reject)=>{
			let type;
			if(typeof value === "undefined"){
				reject({ message: 'value为非法格式'});
			}else{
				if(typeof value === "string"){
					try{
						JSON.parse(value);
						type = "json";
					}catch(ex){
						type = "string";
					}
					value = [[type, expires].join(":"), value].join("@");

					try{
						sessionStorage.setItem(key,value);
						listener.fire(key, value);
						resolve(true);
					}catch(e){
						reject(e);
					}

				}else{
					type = "json";
					try{
						value = JSON.stringify(value);
						value = [[type, expires].join(":"), value].join("@");
						
						try{
							sessionStorage.setItem(key,value);
							listener.fire(key, value);
							resolve(true);
						}catch(e){
							reject(e);
						}
					}catch(ex){
						reject({ message: 'value为非法格式'});
					}
				}
			} 
		})
	},
	remove(key){
		return new Promise((resolve,reject)=>{
			sessionStorage.removeItem(key);
			listener.fire(key);
			resolve(true);
		})
	},
	clear(){
		sessionStorage.clear();
		listener.keys.forEach(key => listener.fire(key));
	}
} : {

	get(key){
		return new Promise((resolve,reject)=>{
			if(typeof cache[key] === "undefined"){
				reject({ message: 'can not find value'});
			}else{
				resolve(cache[key]);
			}
		});
	},
	set(key, value){
		return new Promise((resolve,reject)=>{
			cache[key] = value;
			listener.fire(key, value);
			resolve(true);
		})
	},
	remove(key){
		return new Promise((resolve,reject)=>{
			delete cache[key];
			listener.fire(key);
			resolve(true);
		})
	},
	clear(){
		cache = {};
		listener.keys.forEach(key => listener.fire(key));
	}
}, {
	on(key, listener){
		listener.on(key, listener);
	},
	off(key, listener){
		listener.off(key, listener);
	}
});
