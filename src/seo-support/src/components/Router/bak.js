
		/**
		 * item => {
		 *		url			- 页面url
		 *		container	- 页面dom容器
		 *		page		- 页面实例
		 *		header		- 页面头
		 *	}
		 */
		var historys = Cache.get(ROUTER_HISTORY_STORAGE) || [];
		// var historyLength = Cache.get(HISTORY_LENGTH_STORAGE) || history.length;
		// var historys = [];
		// var historyIndex = history.length;
		var self = this;

		var isReplace = false;

		var loadPage = () => {
			var url = $History.url;
			var timestamp = $Hash.get(TIMESTAMP_HASH_KEY);

			if(isReplace && historys[historys.length - 1] && historys[historys.length - 1].container){
				let replacePage = historys.pop();
				let currentPage = {
					url: url,
					container: replacePage.container,
					timestamp: timestamp
				};

				historys.push(currentPage);

				// 通过url解析出跳转页面数据
				let router = parseUrl(map(url), util);

				setTimeout(async () => {
					// 渲染新页面
					let component = await router.component;
					// let header = router.header;
					let header = getHeader(map(url), util);
					this.refs.navbar.checkHeader(header, navUtil, false);
					currentPage.page = ReactDOM.render(React.createElement(component, {
						navigator: navUtil,
						_pageInfo: {
							navigator: navUtil,
							url: url,
							referrer: replacePage.url //replacedUrl
						},
						...router.params
					}), currentPage.container);

					requestAnimationFrame(() => {
						if(replacePage.page && replacePage.page.onForwardTo){
							replacePage.page.onForwardTo(reverseMap(url, util));
						}
					});
				}, 1);
			}else if(historys.length > 1 && url === historys[historys.length - 2].url && timestamp === historys[historys.length - 2].timestamp){
				// 后退
				let prevPage = historys.pop();
				if(prevPage.container){
					prevPage.container.style.boxShadow = "";
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
						this.refs.navbar.checkHeader(currentPage.header, navUtil, true);
					}else{
						let header = getHeader(map(url), util);
						this.refs.navbar.checkHeader(header, navUtil, true);
					}
				}else{
					let container = document.createElement("div");
					container.className="ej-router-layer ej-router-prev ej-router-animate";
					container.innerHTML = '<p style="margin-top:200px;text-align:center;color:#999;">loading</p>';
					container.addEventListener('webkitTransitionEnd', function(){
						if(this.classList.contains("ej-router-current")){
							this.style.boxShadow = "none";
						}
					}, false);

					this.refs.container.insertBefore(container, prevPage.container);
					currentPage.container = container;

					if(prevPage.page && prevPage.page.onBackTo){
						prevPage.page.onBackTo(url);
					}

					// 通过url解析出跳转页面数据
					let router = parseUrl(map(url), util);
					// this.refs.navbar.checkHeader(router.header, navUtil, true);

					setTimeout(()=>{
						className(container).replace("ej-router-prev", "ej-router-current");

						setTimeout(async () => {
							// 渲染新页面
							let component = await router.component;
							let header = getHeader(map(url), util);
							this.refs.navbar.checkHeader(header, navUtil, true);
							currentPage.page = ReactDOM.render(React.createElement(component, {
								navigator: navUtil,
								_pageInfo: {
									navigator: navUtil,
									url: url
									//,referrer: prevPage ? prevPage.url : ""
								},
								...router.params
							}), container);

							if(currentPage.page.onBackFrom){
								currentPage.page.onBackFrom(prevPage.url);
							}
						}, 1);
					}, 10);
				}
			}else{
				// 跳转新页
				let currentPage;

				if(historys.length && url === historys[historys.length - 1].url){
					currentPage = historys[historys.length - 1];
				}else{
					currentPage = {
						url: url
					};
					historys.push(currentPage);
				}
				currentPage.timestamp = timestamp;

				let container = document.createElement("div");
				container.className="ej-router-layer ej-router-next ej-router-animate";
				container.innerHTML = '<p style="margin-top:200px;text-align:center;color:#999;">loading</p>';
				container.addEventListener('webkitTransitionEnd', function(){
					if(this.classList.contains("ej-router-current")){
						this.style.boxShadow = "none";
					}
				}, false);

				this.refs.container.appendChild(container);
				currentPage.container = container;

				let prevPage = historys[historys.length - 2];
				if(prevPage && prevPage.container){
					className(prevPage.container).replace("ej-router-current", "ej-router-prev");
				}

				setTimeout(()=>{
					className(container).replace("ej-router-next", "ej-router-current");

					setTimeout(async () => {
						// 通过url解析出跳转页面数据
						let router = parseUrl(map(url), util);
						// 渲染新页面
						let component = await router.component;
						//let header = router.header;
						let header = getHeader(map(url), util);
						this.refs.navbar.checkHeader(header, navUtil, false);
						currentPage.page = ReactDOM.render(React.createElement(component, {
							navigator: navUtil,
							_pageInfo: {
								navigator: navUtil,
								url: url,
								referrer: prevPage ? prevPage.url : ""
							},
							...router.params
						}), container);

						requestAnimationFrame(() => {
							if(prevPage && prevPage.page && prevPage.page.onForwardTo){
								prevPage.page.onForwardTo(reverseMap(url, util));
							}
						});
					}, 1);
				}, 10);
			}

			isReplace = false;
		};

		$History.onUrlChange(loadPage);
		// 离开页面前存储历史记录
		window.addEventListener("beforeunload", function(){
			Cache.set(ROUTER_HISTORY_STORAGE, historys.map(item => {
				return {
					url: item.url,
					timestamp: item.timestamp
				};
			}));
			// Cache.set(HISTORY_LENGTH_STORAGE, history.length);
		}, false);

		var navUtil = this._navigator = {
			// 是否第一个页面
			get isFirst(){
				return historys.length < 2;
			},

			get canBack(){
				return !this.isFirst || history.length > 2;
			},

			go: function(url, params, opts){
				opts = opts || {
					isReplace: false,
					isFromNative: false
				};

				isReplace = opts.isReplace;

				if(/^(http|https)\:\/\//.test(url)){
					if(opts.isReplace){
						location.replace(url);
					}else{
						location.href = url;
					}
				}else{
					url = reverseMap(map(url, util));
					let currentUrl = $History.url;

					if(historys.length){
						let lastHistory = historys[historys.length - 1];
						if(lastHistory.container){
							//
							if(url === lastHistory.url){
								isReplace = true;
								loadPage();
							}else if(isReplace){
								$History.replace(url + "#" + TIMESTAMP_HASH_KEY + "=" + timestamp());
							}else if(historys.length > 1 && url === historys[historys.length - 2].url){
								this.back();
							}else{
								$History.go(url + "#" + TIMESTAMP_HASH_KEY + "=" + timestamp());
							}
						}else{
							// history是从sessionStorage中恢复的，并且是恢复后跳转的第一个页面
							if(url === currentUrl){
								if(url === lastHistory.url && $Hash.get(TIMESTAMP_HASH_KEY) === lastHistory.timestamp){
									loadPage();
								}else{
									$History.replace(url + "#" + TIMESTAMP_HASH_KEY + "=" + timestamp());
									loadPage();
								}
							}else{
								$History.replace(url + "#" + TIMESTAMP_HASH_KEY + "=" + timestamp());
							}
						}
					}else{
						// 跳转到此SPA的第一个页面
						if(url === currentUrl && $Hash.has(TIMESTAMP_HASH_KEY)){
							// 如果直接跳转到了对应的url
							loadPage();
						}else{
							// 需要将URL重置到当前页
							$History.replace(url + "#" + TIMESTAMP_HASH_KEY + "=" + timestamp());
							// URL一样的时候，不会触发url改变事件
							if(url === currentUrl){
								loadPage();
							}
						}
					}
				}
			},

			back: function(){
				isReplace = false;

				history.back();
			},

			reload: function(){
				this.replace(historys[historys.length - 1].url);
			},

			replace: function(url){
				this.go(url, null, {
					isReplace: true
				});
			},

			// 嵌在APP中的方法，暂时没有功能
			goFromNative: function(){},

			// 导航栏
			navbar: {
				view: function(header){
					if(header.url !== historys[historys.length - 1].url){
						return;
					}

					self.refs.navbar.view(header.render(navUtil));
					// 对于需要页面数据渲染的导航，在回退的时候，渲染时机太晚
					// 所以此处对导航栏做个缓存，在回退的时候先行渲染
					historys[historys.length - 1].header = header;
				}
			}
		};

		navUtil.go(defaultPage);