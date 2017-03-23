import { events } from "enjoy-common-support";

const supportHistoryAPI = !!history.pushState;

var sep = ">>>";
var inited = false;

export default events("url-change", "hash-change")({
	base: "",
	init(config){
		if(inited){
			console.warn("history组件只能被初始化一次");
			return;
		}
		inited = true;

		if(config.base){
			this.base = config.base;
		}
		if(config.sep){
			sep = config.sep;
		}

		if(supportHistoryAPI && this.base){
			let lastUrl = this.url;

			window.addEventListener("popstate", ()=>{
				if(this.url !== lastUrl){
					this.fireUrlChange(this.url);
				}
			}, false);

			this.onUrlChange((url)=>{
				lastUrl = url;
			});

			window.addEventListener("hashchange", ()=>{
				this.fireHashChange(this.originalHash);
			}, false);
		}else{
			let lastHash = this.originalHash.split(sep);
			window.addEventListener("hashchange", ()=>{
				var hash = this.originalHash.split(sep);
				if(hash[0] !== lastHash[0]){
					this.fireUrlChange(hash[0]);
				}
				if(hash[1] !== lastHash[1]){
					this.fireHashChange(hash[1]);
				}
				lastHash = hash;
			}, false);
		}
	},
	destroy(){},
	get url(){
		if(supportHistoryAPI && this.base){
			return location.href.split("#")[0].replace(this.base, "");
		}else{
			return this.originalHash.split(sep)[0];
		}
	},
	get hash(){
		if(supportHistoryAPI && this.base){
			return this.originalHash;
		}else{
			return this.originalHash.split(sep)[1] || "";
		}
	},
	get originalHash(){
		var hash = location.hash.replace(/^#/, "");
		if(supportHistoryAPI && this.base){
			return hash;
		}else{
			if(hash.indexOf(sep) === -1){
				let decodeHash = decodeURIComponent(hash);
				if(decodeHash.indexOf(sep) === -1){
					return hash;
				}else{
					return decodeHash;
				}
			}else{
				return hash;
			}
		}
	},
	go(url){
		if(!inited){
			console.warn("history组件还没有被初始化");
			return;
		}

		if(supportHistoryAPI && this.base){
			let onlyUrl = url.split("#")[0];
			let urlHasChange = onlyUrl !== this.url;
			history.pushState({
				url: onlyUrl
			}, null, this.base + url);
			if(urlHasChange){
				this.fireUrlChange(onlyUrl);
			}
		}else{
			location.hash = url.replace("#", sep);
		}
	},
	replace(url){
		if(!inited){
			console.warn("history组件还没有被初始化");
			return;
		}

		if(supportHistoryAPI && this.base){
			let onlyUrl = url.split("#")[0];
			let urlHasChange = onlyUrl !== this.url;
			history.replaceState({
				url: onlyUrl
			}, null, this.base + url);
			if(urlHasChange){
				this.fireUrlChange(onlyUrl);
			}
		}else{
			location.replace(location.href.split("#")[0] + "#" + url.replace("#", sep));
		}
	},
	goHash(info){
		if(!inited){
			console.warn("history组件还没有被初始化");
			return;
		}

		if(supportHistoryAPI && this.base){
			location.hash = info;
		}else{
			let hash = this.originalHash.split(sep);
			hash[1] = info;
			location.hash = hash.join(sep);
		}
	},
	replaceHash(info){
		if(!inited){
			console.warn("history组件还没有被初始化");
			return;
		}

		if(supportHistoryAPI && this.base){
			location.replace(location.href.split("#")[0] + "#" + info);
		}else{
			let hash = this.originalHash.split(sep);
			hash[1] = info;
			location.replace(location.href.split("#")[0] + "#" + hash.join(sep));
		}
	}
});