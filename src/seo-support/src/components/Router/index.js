import React from "react";
import $History from "../../lib/history";
import NavBar from "../NavBar/index";
import RouterCore from "./core";
import Cache from "../../tools/Cache";

var routes = {};

function getHeader(url, util){
	url = url.split("?")[0];
	return routes[util.resolve(url).replace(/\.js$/, "")];
}

function defaultMap(url, util){
	url = url.split("?");

	return util.resolve(url[0]) + (url[1] ? "?" + url[1] : "");
}

export default class Router extends React.Component {
	static NavBar = NavBar
	static Core = RouterCore
	static Cache = Cache
	constructor(props) {
		super(props);
	}

	// 由于导航栏使用过程中都是内部渲染，所以导航控件不进行二次渲染
	shouldComponentUpdate(){
		return false;
	}

	componentDidMount(){
		var util = this.props._util;
		// 路由规则
		var map = this.props.map || defaultMap;
		// 反向URL解析
		var reverseMap = this.props.reverseMap || function(url, util){ return url; };
		// 默认页
		var defaultPage = map($History.url || this.props.href, util);
		// 
		var rootParams = this.props.rootParams || {};

		new Router.Core({
			util: util,
			map: map,
			reverseMap: reverseMap,
			defaultPage: defaultPage,
			// 捕获自定义协议
			catchScheme: this.props.catchScheme,
			//
			isFromNative: rootParams.isFromNative,
			//
			canBack: rootParams.canBack,
			container: this.refs.container,
			navbar: this.refs.navbar,
			getHeader: getHeader,
			base: this.props.base
		});
	}

	// 配置页面导航信息
	// key: 页面url
	// router: 头部节点
	static config(key, router){
		routes[key] = router;
	}

	render(){
		return <div class="ej-router-layer">
					<div class="ej-router-layer" ref="container"></div>
					<Router.NavBar ref="navbar" />
				</div>
	}
}