import React from "react";
import LayerContainer from "./container";
import ReadyRun from "../../lib/readyRun";
import Event from "../../lib/event";
import {events} from "enjoy-common-support";
import Hash from "../../lib/hash";

var index = 0;
function getHashId(){
	return "layer-" + (index ++);
}

// 弹层类，可以进行实例化操作
@events(["ready", "memory once async"], "show", "hide")
export default class LayerClass {
	constructor(component, options){
		options = options || {};

		this.waitLayer = new ReadyRun();

		// 初始化时向弹层容器注册一个弹层组件
		this.layerIndex = LayerContainer.add(this, (layer) => {
			this.layer = layer;
			this.waitLayer.ready();

			layer.onShow(() => {
				this.fireShow();
			}).onHide((...params) => {
				this.fireHide(...params);
			});
		});

		if(options.hashKey === false){
			this.noHash = true;
		}else{
			this.hashId = options.hashKey || getHashId();

			this.hashHandler = ()=>{
				if(Hash.has(this.hashId)){
					this._show(Hash.get(this.hashId));
				}else{
					this._hide(...(this.hideParams || []));
				}
			};

			Hash.onChange(this.hashHandler);

			this.onReady(()=>{
				this.hashHandler();
			});
		}

		if(component){
			this.fill(component);
		}
	}

	destroy(){
		LayerContainer.remove(this.layerIndex);
		Hash.offChange(this.hashHandler);
	}

	fill(component){
		this.waitLayer.ready(() => {
			this.layer.fill(component, () => {
				this.fireReady();
			});
		});
	}

	get component(){
		if(this.layer){
			return this.layer.refs.active;
		}

		return null;
	}

	_show(mode){
		// this.waitLayer.ready(() => {
		// 	this.layer.show(mode);
		// });
		this.onReady(() => {
			this.layer.show(mode);
		});
	}

	_hide(...params){
		// this.waitLayer.ready(() => {
		// 	this.layer.hide(...params);
		// });
		this.onReady(() => {
			this.layer.hide(...params);
		});
	}

	show(mode){
		if(this.noHash){
			this._show(mode);
		}else{
			Hash.set(this.hashId, mode || "");
		}
	}

	hide(...params){
		if(this.noHash){
			this._hide(...params);
		}else if(Hash.has(this.hashId)){
			this.hideParams = params;
			history.back();
		}
	}

	open(component, mode){
		this.waitLayer.ready(() => {
			this.layer.open(component, mode);
		});
	}

	close(...params){
		this.waitLayer.ready(() => {
			this.layer.close(...params);
		});
	}
}