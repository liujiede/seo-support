import { Listener } from "enjoy-common-support";
const listener = Listener();

function NOOP(){}

var storage
try{
	storage = window["localStorage"];
}catch(e){
	storage = {
		getItem: NOOP,
		setItem: NOOP,
		removeItem: NOOP,
		clear: NOOP
	};
}

export default {

	get(key){
		return new Promise((resolve,reject)=>{
			var value = storage.getItem(key);

			if(value === null){
				reject({ message: 'can not find value'});
			}else{

				if(typeof value === "string"){
					try{
						value = JSON.parse(value);
					}catch(ex){

					}
				}
				resolve(value);
			}
		});
	},
	set(key, value){
		//storage 参数类型为json string
		return new Promise((resolve,reject)=>{
			if(typeof value == "undefined"){
				reject({ message: 'value为非法格式'});
			}else if(typeof value == "string"){
				storage.setItem(key, value);
				listener.fire(key, value)
				resolve(true);
			}else{
				try{
					value = JSON.stringify(value);
				}catch(ex){
					reject({ message: 'value为非法格式'});
				}
				storage.setItem(key, value);
				listener.fire(key, value)
				resolve(true);
			}
		});
	},
	remove(key){
		return new Promise((resolve,reject)=>{
			storage.removeItem(key);
			listener.fire(key);
			resolve(true);
		});
	},
	clear(){
		storage.clear() && listener.keys.forEach(key => listener.fire(key));
	},
	on(key, listener){
		listener.on(key, listener);
	},
	off(key, listener){
		listener.off(key, listener);
	}
};