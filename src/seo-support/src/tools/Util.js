import Router from "../components/Router/index";
import React from "../react";

const DOT_RE = /\/\.\//g;
const DOUBLE_DOT_RE = /\/[^/]+\/\.\.\//;
const MULTI_SLASH_RE = /([^:/])\/+\//g;

function realpath(path){
	// /a/b/./c/./d ==> /a/b/c/d
	path = path.replace(DOT_RE, "/");
	
	/**
	 *	a//b/c ==> a/b/c
	 *	a///b/////c ==> a/b/c
	 *	DOUBLE_DOT_RE matches a/b/c//../d path correctly only if replace // with / first
	 */
	path = path.replace(MULTI_SLASH_RE, "$1/");
	
	// a/b/c/../../d  ==>  a/b/../d  ==>  a/d
	while (path.match(DOUBLE_DOT_RE)) {
		path = path.replace(DOUBLE_DOT_RE, "/");
	}
	
	return path;
}

// 解析出所有可能出现的className
/*
	{
		"className1": true,
		"className2": false
	}
	=> ["className1", "className2"]
 */
function transAllClassName(classNames){
	return classNames.map(className => {
		let type = typeof className;

		if(type === "string"){
			return className;
		}else if(className instanceof Array){
			if(className.length === 4 && (className[0] instanceof Array)){
				return null;
			}else{
				return transAllClassName(className);
			}
		}else if(type === "object"){
			return Object.keys(className).join(" ");
		}else{
			return "";
		}
	}).filter(className => className).join(" ");
}

// 解析出当前有效的className
/*
	{
		"className1": true,
		"className2": false
	}
	=> ["className1"]
 */
function transClassName(classNames){
	let styles = null;

	if(!(classNames instanceof Array)){
		console.log(classNames);
	}

	var classNameList = classNames.map(className => {
		let type = typeof className;

		if(type === "string"){
			return className;
		}else if(className instanceof Array){
			if(className.length === 4 && (className[0] instanceof Array)){
				styles = className;
				return null;
			}else{
				return transClassName(className);
			}
		}else if(type === "object"){
			return Object.keys(className).filter(key => {
					return className[key];
				}).join(" ");
		}else{
			return "";
		}
	}).filter(className => className);

	if(styles){
		let stylesheets = styles[0];
		let _classNames = styles[1];
		let tagName = styles[2];
		let idName = styles[3];

		let allClassNameList = [transAllClassName(classNames)];

		if(_classNames){
			classNameList = classNameList.concat(transClassName([_classNames]));
			allClassNameList = allClassNameList.concat(transAllClassName([_classNames]));
		}

		if(tagName && classNameList.indexOf("ej-tag-" + tagName) !== -1){
			tagName = "";
		}

		classNameList = classNameList.concat(stylesheets.map(stylesheet => styleFactory(stylesheet, allClassNameList.filter(className => className).join(" "), tagName, idName).replace(/^\./, "")));
	}

	return classNameList.join(" ");
}

const selectorSep = /[\s>\:\[]/;
const selectorMatch = /[#\.]?[a-zA-Z0-9\-]+/g;
const stylesheetCache = {};

// const __FILE__ = (function(file){
// 	return file.substr(0, file.lastIndexOf("/")) + "/";
// })((document.currentScript || document.scripts[document.scripts.length - 1]).src);

function insertStyle(code, path){
	var styleNode = document.createElement("div");
	styleNode.innerHTML = `<br /><style type="text/css" data-src="${path}">${code}</style>`;
	return styleNode = document.getElementsByTagName("head")[0].appendChild(styleNode.lastChild);
}
/*
	根据根节点的classNames、rootTagName、rootIdName转换当前作用域绑定的样式表列表
	生成样式字符串插入到页面中
	1、把从根节点开始的选择器，前面组合的方式加入样式表的唯一class
	2、把非根节点开始的选择器，前面上下级选择的方式加入样式表唯一的class
	例如：
		根节点：<div class="container"></div>
		样式表：
			唯一class：.ej-css-1
			内容：
				.container{xxx}
				.container .content{xxx}
				.content{xxx}
				div{xxx}
		=>
			转换后:
				.container.ej-css-1{xxx}
				.ej-css-1 .container{xxx}
				.container.ej-css-1 .content{xxx}
				.ej-css-1 .container .content{xxx}
				.ej-css-1 .content{xxx}
				div.ej-css-1{xxx}
				.ej-css-1 div{xxx}
 */
function styleFactory(stylesheet, rootClassNames, rootTagName, rootIdName){
	var matchNames = [];
	
	if(rootClassNames){
		matchNames = matchNames.concat(rootClassNames.split(/\s+/).map(className => "." + className));
	}
	if(rootTagName){
		matchNames.push(rootTagName);
	}
	if(rootIdName){
		matchNames.push("#" + rootIdName);
	}

	const stylesheetKey = stylesheet.key;
	const rules = stylesheet.rules;
	const path = stylesheet.path;

	var cache = stylesheetCache[stylesheetKey];
	if(!cache){
		cache = stylesheetCache[stylesheetKey] = {
			stylesheet: stylesheet,
			matchs: [],
			node: null
		};
	}

	matchNames = matchNames.filter(matchName => {
		return cache.matchs.indexOf(matchName) === -1;
	});

	// 如果所有根节点的匹配都已经添加，则无需修改
	if(matchNames.length === 0){
		return stylesheetKey;
	}

	matchNames = cache.matchs = cache.matchs.concat(matchNames);

	var contents = [];

	rules.forEach(rule => {
		let selectors = [];

		rule.selectors.forEach(selector => {
			let firstSelector = selector.split(selectorSep)[0];

			if(firstSelector.match(selectorMatch).some(selector => {
				return matchNames.indexOf(selector) !== -1;
			})){
				selectors.push(selector.replace(firstSelector, firstSelector + stylesheetKey));
			}

			selectors.push(stylesheetKey + " " + selector);
		});

		// let content = rule.content.replace(/url\(['"]?(.+?)['"]?\)/g, function(all, url){
		// 	if(/^assets/.test(url)){
		// 		return `url(${__FILE__ + url})`;
		// 	}else{
		// 		return all;
		// 	}
		// });

		contents.push(`${selectors.join(",")}{${rule.content}}`);
	});

	contents = contents.join("");

	if(cache.node){
		cache.node.parentNode.removeChild(cache.node);
	}

	cache.node = insertStyle(contents, path);

	return stylesheetKey;
}

export default {
	createElement: function(tag, props, ...children){
		return React.createElement.apply(React, [tag, props].concat(children));
	},
	getHtmlIndex: function(){
		return hex(htmlIndex ++) + "-";
	},
	arrayClass: function(classNames){
		return transClassName(classNames);
	},
	realpath: realpath,
	pageUtil: function(path){
		var realpath = this.realpath;
		var dir = path.split("/");
		dir.pop();
		dir = dir.join("/");
		return {
			path: path,
			dir: dir,
			require: function(path){
				path = this.resolve(path);
				return new Promise(function (resolve, reject){
					var timeoutHander = setTimeout(function(){
						var errorMsg = "请求" + path + "超时";
						reject(new Error(errorMsg));
					}, 10000);

					require.async([path], function(){
						clearTimeout(timeoutHander);
						var mod = require(path);
						if(mod && mod.__esModule){
							mod = mod.default;
						}
						resolve(mod);
					});
				});
			},
			resolve: function(path){
				if(/^\.{1,2}\//.test(path)){
					return realpath(dir + "/" + path);
				}else{
					return path;
				}
			},
			header: function(router){
				Router.config(path, router);
			}
		};
	}
};