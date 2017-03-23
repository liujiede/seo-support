import CommonSupport from "enjoy-common-support";
import React from "./react";
import "whatwg-fetch";
import style from "./style/reset.css";
import A from "./tag/A";
import Image from "./tag/Image";
import Input from "./tag/Input";
import Textarea from "./tag/Textarea";
import Swiper from "./components/Swiper/index";
import ScrollView from "./components/ScrollView/index";
import Container from "./components/Container";
import PageClass from "./components/PageClass";
import Component from "./components/Component";
import Router from "./components/Router/index";
import NavBar from "./components/NavBar/index";
import Layer from "./components/Layer/index";
import layers from "./components/layers";
import FadeNavBar from "./components/FadeNavBar";
import SwiperPager from "./components/SwiperPager/index";
import StaticFactory from "./components/StaticFactory";
import GuideMask from "./components/GuideMask";
import SearchInput from "./components/SearchInput/index";
import Toast from "./components/Toast";
import Screen from "./tools/Screen";
import NodeMethods from "./tools/NodeMethods";
import Geolocation from "./tools/Geolocation";
import Platform from "./tools/Platform";
import Storage from "./tools/Storage";
import Cache from "./tools/Cache";
import Cookie from "./tools/Cookie";
import History from "./lib/history";
import Hash from "./lib/hash";
import Share from "./tools/Share/index";
import Util from "./tools/Util";

// // 阻止页面默认弹性下拉
// document.ontouchmove = function(){
// 	return false;
// };

module.exports = CommonSupport.extend({
	React: React,
	Util: Util,
	A: A,
	Image: Image,
	Input: Input,
	Textarea: Textarea,
	Swiper: Swiper,
	ScrollView: ScrollView,
	Container: Container,
	PageClass: PageClass,
	Component: Component,
	Router: Router,
	NavBar: NavBar,
	Layer: Layer,
	layers: layers,
	FadeNavBar: FadeNavBar,
	SwiperPager: SwiperPager,
	StaticFactory: StaticFactory,
	GuideMask: GuideMask,
	SearchInput: SearchInput,
	Toast: Toast,
	Screen: Screen,
	NodeMethods: NodeMethods,
	Geolocation: Geolocation,
	Platform: Platform,
	Storage: Storage,
	Cache: Cache,
	Cookie: Cookie,
	History: History,
	Hash: Hash,
	Share: Share,
	InteractionManager: {
		runAfterInteractions: function(callback){
			requestAnimationFrame(callback);
		}
	},
	render: function(name, component){
		React.render(
			React.createElement(component),
			document.getElementsByTagName("div")[0]
		);
	}
});