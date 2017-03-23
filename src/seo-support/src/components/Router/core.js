import React from "react";
import ReactDOM from "react-dom";
import className from "../../lib/className";
import style from "./index.css";
import $History from "../../lib/history";
import $Hash from "../../lib/hash";
import Router from "./index";

function timestamp(){
	return +new Date() + "";
}
const TIMESTAMP_HASH_KEY = "timestamp";

// 解析url
function parseUrl(url, util){
	url = url.split("?");

	var params = (function(queryString){
		var params = {};
		if(queryString){
			queryString.split("&").forEach(item => {
				item = item.split("=");
				params[item[0]] = item[1];
			});
		}
		return params;
	})(url[1]);

	url = url[0];

	return {
		// header: routes[util.resolve(url).replace(/\.js$/, "")],
		component: util.require(url),
		params: params
	};
}

const ROUTER_HISTORY_STORAGE = "router-history-storage";
const OUTER_PAGE = "__outer_pages__";

function timeoutEventHandler(fn, timeout){
	var runed = false;
	var timeoutHander = setTimeout(function(){
		runed = true;
		fn();
	}, timeout);

	return function(){
		clearTimeout(timeoutHander);
		if(!runed){
			fn();
		}
	};
}

export default class RouterCore {
	constructor(options){
		// /home -> /views/home/index.js
		this.map = options.map;
		// /views/home/index.js -> /home
		this.reverseMap = options.reverseMap;
		// 提供基于当前页面路径的resolve等方法
		this.util = options.util;
		// 放置页面节点的容器节点
		this.container = options.container;
		// 根据页面url获取页面header对象
		this.getHeader = options.getHeader;
		// 捕获解析不了的协议
		this.catchScheme = options.catchScheme;

		this.isReplace = false;

		this.pageInit(options);
	}
	//获取history，渲染header,初始化、监听、处理历史路由记录
	async pageInit(options){
		/**
		* item => {
		*		url			- 页面url
		*		container	- 页面dom容器
		*		page		- 页面实例
		*		header		- 页面头
		*	}
		*/
		try{
			this.history = await Router.Cache.get(ROUTER_HISTORY_STORAGE);
		}catch(ex){
			console.log('cache '+ ROUTER_HISTORY_STORAGE +'error');
			this.history = [];
		}
		// this.history = [{
		// 	url: options.defaultPage,
		// 	isFromNative: options.isFromNative,
		// 	canBack: options.canBack,
		// 	page: null
		// }];

		var self = this;
		// 导航栏
		this.navbar = {
			target: options.navbar,
			view: function(header){
				// 为了使显示在浏览器中的url比较短，history中存储的页面的url是未经map方法展开的缩写
				if(header.url !== self.history[self.history.length - 1].url){
					return;
				}

				this.target.view(header.render(self));
				// 对于需要页面数据渲染的导航，在回退的时候，渲染时机太晚
				// 所以此处对导航栏做个缓存，在回退的时候先行渲染
				self.history[self.history.length - 1].header = header;
			}
		};

		// 初始化历史记录对象
		$History.init({
			base: options.base
		});

		$History.onUrlChange(this.loadPage.bind(this));
		// 离开页面前存储历史记录
		window.addEventListener("beforeunload", async function(){
			try{
				await Router.Cache.set(ROUTER_HISTORY_STORAGE, self.history.map(item => {
					return item === OUTER_PAGE ? item : {
						url: item.url,
						timestamp: item.timestamp
					};
				}));
			}catch(ex){
				console.log("before jump OUTER_PAGE router-history Cache Error");
			}
		}, false);

		// 处理缓存的历史记录
		var url = $History.url;
		var timestamp = $Hash.get(TIMESTAMP_HASH_KEY);
		if(this.history.length){
			let lastHistory = this.history[this.history.length - 1];
			let lastHistory3 = this.history[this.history.length - 3];
			if(url === lastHistory.url && timestamp === lastHistory.timestamp){
				// 刷新或者跳转到外部页面再返回
				this.history.pop();
				this.loadPage();
			}else if(this.history[this.history.length - 2] === OUTER_PAGE && lastHistory3 && url === lastHistory3.url && timestamp === lastHistory3.timestamp){
				// 跳转到外部页面，再跳转到内部某页面，然后返回外部页面，然后再返回
				this.history.pop();
				this.history.pop();
				this.history.pop();
				this.loadPage();
			}else{
				// 跳转到外部页面然后跳转回某个页面
				this.history.push(OUTER_PAGE);
				this.go(options.defaultPage);
			}
		}else{
			this.go(options.defaultPage);
		}

		this.go = this.go.bind(this);
		this.back = this.back.bind(this);
		this.reload = this.reload.bind(this);
		this.replace = this.replace.bind(this);
		
	}

	// 根据当前url绘制页面
	loadPage(){
		var url = $History.url;
		var timestamp = $Hash.get(TIMESTAMP_HASH_KEY);
		var historys = this.history;

		if(this.isReplace && historys[historys.length - 1] && historys[historys.length - 1].container){
			// 如果是替换页面，并且不是第一个页面
			let replacePage = historys.pop();
			let currentPage = {
				url: url,
				container: replacePage.container,
				timestamp: timestamp
			};

			historys.push(currentPage);

			// 通过url解析出跳转页面数据
			let router = parseUrl(this.map(url), this.util);

			(async () => {
				// 渲染新页面
				let component = await router.component;
				let header = this.getHeader(this.map(url), this.util);
				this.navbar.target.checkHeader(header, this, false);
				currentPage.page = ReactDOM.render(React.createElement(component, {
					navigator: this,
					_pageInfo: {
						navigator: this,
						url: url,
						referrer: replacePage.url //replacedUrl
					},
					...router.params
				}), currentPage.container);

				// requestAnimationFrame(() => {
					if(replacePage.page && replacePage.page.onForwardTo){
						replacePage.page.onForwardTo(this.reverseMap(url, this.util));
					}
				// });
			})();
		}else if(historys.length > 1 && url === historys[historys.length - 2].url && timestamp === historys[historys.length - 2].timestamp){
			// 后退
			// 当要跳转的页面是历史记录的上一个页面时，直接后退
			let prevPage = historys.pop();
			if(prevPage.container){
				// prevPage.container.style.boxShadow = "";
				className(prevPage.container).replace("ej-router-current", "ej-router-next");
			}

			let currentPage = historys[historys.length - 1];

			if(currentPage.container){
				className(currentPage.container).replace("ej-router-prev", "ej-router-current");

				if(prevPage.page && prevPage.page.onBackTo){
					prevPage.page.onBackTo(url);
				}

				if(currentPage.page && currentPage.page.onBackFrom){
					currentPage.page.onBackFrom(prevPage.url);
				}

				setTimeout(() => {
					prevPage.container.parentNode.removeChild(prevPage.container);
				}, 500);

				if(currentPage.header){
					this.navbar.target.checkHeader(currentPage.header, this, true);
				}else{
					let header = this.getHeader(this.map(url), this.util);
					this.navbar.target.checkHeader(header, this, true);
				}
			}else{
				let container = document.createElement("div");
				container.className="ej-router-layer ej-router-prev ej-router-animate";
				container.innerHTML = '<p style="margin-top:200px;text-align:center;color:#999;">loading</p>';

				this.container.insertBefore(container, prevPage.container);
				currentPage.container = container;

				if(prevPage.page && prevPage.page.onBackTo){
					prevPage.page.onBackTo(url);
				}

				// 通过url解析出跳转页面数据
				let router = parseUrl(this.map(url), this.util);

				setTimeout(()=>{
					// 动画是否结束
					let transitionEnd = false;
					// 等待动画结束后要执行的操作
					let waitingList = [];

					container.addEventListener('webkitTransitionEnd', timeoutEventHandler(() => {
						transitionEnd = true;
						waitingList.forEach(fn => fn());
						waitingList = [];

						// if(container.classList.contains("ej-router-current")){
						// 	container.style.boxShadow = "none";
						// }
					}, 500), false);

					className(container).replace("ej-router-prev", "ej-router-current");

					(async () => {
						// 渲染新页面
						let component = await router.component;
						let header = this.getHeader(this.map(url), this.util);
						this.navbar.target.checkHeader(header, this, true);

						let render = () => {
							currentPage.page = ReactDOM.render(React.createElement(component, {
								navigator: this,
								_pageInfo: {
									navigator: this,
									url: url
									//,referrer: prevPage ? prevPage.url : ""
								},
								...router.params
							}), container);

							if(currentPage.page.onBackFrom){
								currentPage.page.onBackFrom(prevPage.url);
							}
						};
							
						if(transitionEnd){
							render();
						}else{
							waitingList.push(render);
						}
					})();
				}, 20);
			}
		}else{
			// 跳转新页
			let currentPage = {
				url: url,
				timestamp: timestamp
			};
			historys.push(currentPage);

			// 创建新页面的DOM容器
			let container = document.createElement("div");
			container.className="ej-router-layer ej-router-next ej-router-animate";
			container.innerHTML = '<p style="margin-top:200px;text-align:center;color:#999;">loading</p>';

			this.container.appendChild(container);
			currentPage.container = container;

			setTimeout(()=>{
				// 动画是否结束
				let transitionEnd = false;
				// 等待动画结束后要执行的操作
				let waitingList = [];
				// 动画结束事件
				container.addEventListener('webkitTransitionEnd', timeoutEventHandler(() => {
					transitionEnd = true;
					waitingList.forEach(fn => fn());
					waitingList = [];
					// if(container.classList.contains("ej-router-current")){
					// 	container.style.boxShadow = "none";
					// }
				}, 500), false);

				// 将新创建的容器切换到当前视图
				className(container).replace("ej-router-next", "ej-router-current");
				// 将当前容器切换到上一个视图
				let prevPage = historys[historys.length - 2];
				if(prevPage && prevPage.container){
					className(prevPage.container).replace("ej-router-current", "ej-router-prev");
				}

				(async () => {
					// 通过url解析出跳转页面数据
					let router = parseUrl(this.map(url), this.util);
					// 渲染新页面
					let component = await router.component;
					let header = this.getHeader(this.map(url), this.util);
					this.navbar.target.checkHeader(header, this, false);

					// 渲染当前页面
					let render = () => {
						currentPage.page = ReactDOM.render(React.createElement(component, {
							navigator: this,
							_pageInfo: {
								navigator: this,
								url: url,
								referrer: prevPage ? prevPage.url : ""
							},
							...router.params
						}), container);

						if(prevPage && prevPage.page && prevPage.page.onForwardTo){
							prevPage.page.onForwardTo(this.reverseMap(url, this.util));
						}
					};
					
					if(transitionEnd){
						render();
					}else{
						waitingList.push(render);
					}
				})();
			}, 20);
		}

		this.isReplace = false;
	}

	// 是否第一个页面
	get isFirst(){
		return this.history.length < 2;
	}

	get canBack(){
		// 注意：这里的history不是this.history
		// 这里的history是window.history
		return !this.isFirst || history.length > 2;
	}

	go(url, params, opts){
		opts = opts || {
			isReplace: false,
			isFromNative: false
		};

		// 转换url规则
		url = this.reverseMap(this.map(url, this.util));

		// 解析协议
		var urlMatch = url.match(/^([a-z\-]+)\:(\/\/)?(.+)$/);
		if(urlMatch){
			let scheme = urlMatch[1];
			url = urlMatch[3];
			// 如果parseScheme方法无法解析该协议，则抛给catchScheme解析
			if(!this.parseScheme(scheme, url, params) && this.catchScheme){
				this.catchScheme(scheme, url, params);
			}
			return;
		}

		this.isReplace = opts.isReplace;

		let currentUrl = $History.url;

		if(this.history.length){
			let lastHistory = this.history[this.history.length - 1];
			if(lastHistory.page){
				//
				if(url === lastHistory.url){
					this.isReplace = true;
					this.loadPage();
				}else if(this.isReplace){
					$History.replace(url + "#" + TIMESTAMP_HASH_KEY + "=" + timestamp());
				}else if(this.history.length > 1 && url === this.history[this.history.length - 2].url){
					this.back();
				}else{
					$History.go(url + "#" + TIMESTAMP_HASH_KEY + "=" + timestamp());
				}
			}else{
				// history是从sessionStorage中恢复的，并且是恢复后跳转的第一个页面
				$History.replace(url + "#" + TIMESTAMP_HASH_KEY + "=" + timestamp());
				// URL一样的时候，不会触发url改变事件
				if(url === currentUrl){
					this.loadPage();
				}
			}
		}else{
			// 跳转到此SPA的第一个页面
			if(url === currentUrl && $Hash.has(TIMESTAMP_HASH_KEY)){
				// 如果直接跳转到了对应的url
				this.loadPage();
			}else{
				// 需要将URL重置到当前页
				$History.replace(url + "#" + TIMESTAMP_HASH_KEY + "=" + timestamp());
				// URL一样的时候，不会触发url改变事件
				if(url === currentUrl){
					this.loadPage();
				}
			}
		}
	}

	back(){
		this.isReplace = false;

		history.back();
	}

	reload(){
		this.replace(this.history[this.history.length - 1].url);
	}

	replace(url){
		this.go(url, null, {
			isReplace: true
		});
	}

	// 嵌在APP中的方法，暂时没有功能
	goFromNative(){}
	// 解析带有协议的url
	// 如果可以解析，则返回true，否则返回false
	parseScheme(scheme, url, params, opts){
		// 可在子类中实现新协议的解析
		return false;
	}
	// 返回到native页面
	backToNative(){
		// 可在子类中实现返回的native页的功能
	}
}