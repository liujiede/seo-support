import React from "react";
import Platform from "../Platform";
import base64 from "../../lib/base64";
import Component from "../../components/Component";
import Layer from "../../components/Layer/index";
import style from "./index.css";

// 支持浏览器原生分享的APP
const nativeShareApps = {
	weibo: ['kSinaWeibo', 'SinaWeibo', 11],
	weixin: ['kWeixin', 'WechatFriends', 1],
	weixintimeline: ['kWeixinFriend', 'WechatTimeline', 8],
	qq: ['kQQ', 'QQ', 4],
	qzone: ['kQZone', 'Qzone', 3]
};

var params = {};

class ShareUI extends Component{
	constructor(props){
		super(props);

		this.ua = navigator.userAgent.toLowerCase();

		this.isIOS = Platform.deviceOS() === "IOS",

		this.isAndroid = Platform.deviceOS() === "Android",

		this.isUCBrowser = this.deviceDetect('UCBrowser'),

		this.isQQBrowser = this.deviceDetect('MQQBrowser'),

		this.qqBrowserVersion = this.isQQBrowser ? this.getVersion(this.ua.split('mqqbrowser/')[1]) : 0,

		this.ucBrowserVersion = this.isUCBrowser ? this.getVersion(this.ua.split('ucbrowser/')[1]) : 0

		//各平台协议连接
		this.sitesObj ={
			weixin: {
				scheme: ''
			},
			weixintimeline: {
				scheme: ''
			},
			qq: {
				scheme: 'mqqapi://share/to_fri?src_type=web&version=1&file_type=news'
			},
			qzone: {
				// api: 'http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url={{url}}&title={{title}}&pics={{pic}}&desc={{digest}}',
				scheme: this.isIOS ?
				'mqqapi://share/to_fri?file_type=news&src_type=web&version=1&generalpastboard=1&shareType=1&cflag=1&objectlocation=pasteboard&callback_type=scheme&callback_name=QQ41AF4B2A' :
				'mqqapi://share/to_qzone?src_type=app&version=1&file_type=news&req_type=1'
			}
		}

		//判断当前设备是否支持原生app分享
		this.supportNativeShare = false;
		if ((this.isIOS && this.ucBrowserVersion >= 10.2)
			|| (this.isAndroid && this.ucBrowserVersion >= 9.7)
			|| this.qqBrowserVersion >= 5.4) {
			this.supportNativeShare = true;
		}
		var canShare = [];
		if(this.supportNativeShare&&(this.isUCBrowser || this.isQQBrowser)){
			canShare = ["weixin", "weixintimeline", "qq", "qzone"];
		}else{
			canShare = ["qzone"];
		}
		this.state = {
			sharePlatform : canShare
		}
	}

	componentDidMount(){

	}

	//设备检测函数
	deviceDetect(needle){
		needle = needle.toLowerCase();
		return this.ua.indexOf(needle) !== -1;
	}
	
	//浏览器检测版本
	getVersion(nece){
		var arr = nece.split('.');
		return parseFloat(arr[0] + '.' + arr[1]);
	}

	/**
	 * 追加对象字面量对象到URL的querystring里
	 * @param  {String} url [URL字符串]
	 * @param  {Object} obj [对象字面量]
	 * @return {String}     [追加querystring后的URL字符串]
	 */
	 appendToQuerysting(url, obj) {
	 	var arr = [];
	 	for(var k in obj) {
	 		arr.push(k + '=' + obj[k]);
	 	}
	 	return url + (url.indexOf('?') !== -1 ? '&' : '?') + arr.join('&');
	 }

	/**
	 * 通过scheme唤起APP
	 * @param  {String} scheme [app打开协议]
	 */
	 openAppByScheme(scheme) {
	 	if (this.isIOS) {
	 		window.location.href = scheme;
	 	} else {
	 		var iframe = document.createElement('iframe');
	 		iframe.style.display = 'none';
	 		iframe.src = scheme;
	 		document.body.appendChild(iframe);
	 		setTimeout(function() {
	 			iframe && iframe.parentNode && iframe.parentNode.removeChild(iframe);
	 		}, 2000);
	 	}
	 }

	/**
	 * 动态加载外部脚本
	 * @param  {String}   url [脚本地址]
	 * @param  {Function} done  [脚本完毕回调函数]
	 */
	 loadScript(url, done) {
	 	var script = document.createElement('script');
	 	script.type= 'text/javascript'; 
	 	script.onreadystatechange= function () {
		  	if (this.readyState == 'complete'){
		  		done&&done();
		  		script.parentNode.removeChild(script); 
		  	} 
		}
	  	script.onload= function(){
	  		done&&done();
	  		script.parentNode.removeChild(script);
	  	} 
	 	script.src = url;
	 	document.body.appendChild(script);
	}

	/**
	 * 分享
	 * @param  {String}   site [分享平台]
	 * @param  {Obejct}   type [分享webapi类型]
	 */
	 shareTo(site, type) {
	 	var app;
	 	var shareInfo;

	  	// 在UC和QQ浏览器里，对支持的应用调用原生分享
	  	if (this.supportNativeShare) {
	  		if (this.isUCBrowser) {
	  			if (nativeShareApps[site]) {
	  				app = this.isIOS ? nativeShareApps[site][0] : nativeShareApps[site][1];
	  			}

	  			if (app !== undefined) {
	      			//params
		      		shareInfo = [params.shareDic.wxShareTitle, params.shareDic.wxShareMessage, params.shareDic.shareLink, app, '', '@UC', ''];

		        	// android
		        	if (window.ucweb) {
		        		ucweb.startRequest && ucweb.startRequest('shell.page_share', shareInfo);
		        	}

		        	// ios
		        	if (window.ucbrowser) {
		        		ucbrowser.web_share && ucbrowser.web_share.apply(null, shareInfo);
		        	}
		        	return;
		    	}
			}

			if (this.isQQBrowser) {
				if (nativeShareApps[site]) app = nativeShareApps[site][2];
				if (app !== undefined) {
					if (window.browser) {
			        	//params
			        	shareInfo = {
			        		url: params.shareDic.shareLink,
			        		title: params.shareDic.wxShareTitle,
			        		description: params.shareDic.wxShareMessage,
			        		img_url: params.shareDic.shareThumbImageUrl,
			        		img_title: params.shareDic.wxShareTitle,
			        		to_app: app,
			        		cus_txt: ''
			        	};

			        	browser.app && browser.app.share(shareInfo);
			        } else {
			        	this.loadScript('//jsapi.qq.com/get?api=app.share', () => {
			        		this.shareTo(site);
			        	});
			        }
			        return;
			    }
			}
		}
		if(!this.isUCBrowser&&!this.isQQBrowser){
			//除了qq、uc 以外全部使用webapi，目前仅支持qq空间
			location.href = location.protocol+'//sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url='+params.shareDic.shareLink+'&title='+params.shareDic.qqShareTitle+'&desc='+params.shareDic.qqShareMessage+'&summary='+params.shareDic.qqShareTitle+'&site='+document.title;
		}

	  	// 在普通浏览器里，使用URL Scheme唤起QQ客户端进行分享
	  	// 存在兼容性问题，浏览器那边
	 //  	if (site === 'qzone' || site === 'qq') {
		//   	//params

		//   	var scheme = this.appendToQuerysting(this.sitesObj[site].scheme, {
		//   		share_id: new Date().getTime(),
		//   		url: base64.encode(data.shareDic.shareLink),
		//   		title: base64.encode(data.shareDic.wxShareTitle),
		//   		description: base64.encode(data.shareDic.wxShareMessage),
		//       	previewimageUrl: base64.encode(data.shareDic.shareThumbImageUrl), //For IOS
		//       	image_url: base64.encode(data.shareDic.shareThumbImageUrl) //For Android
		//   	});
		//   	alert(scheme);
		//   	this.openAppByScheme(scheme);
		//   	return;
		// }

	}
	render(){
		var platformItem = "sharem-item "+this.state.sharePlatform[3];

		return <div class="sharem-pop sharem-pop-show">
		<div class="sharem-pop-sites">
				<div class="sharem-pop-sites">
					<div class="sharem-group">{
					this.state.sharePlatform.map((item,index) =>{
						var className = "sharem-item " +item;
						 return (index < 3 ?
							 <div class={ className } onClick={()=>{
							 	this.shareTo(item)
							 }}>
								<span class="sharem-item-icon"></span>
							</div>
						: '' )
					})
					}</div>
					<div class="sharem-group">
						<div class={ platformItem } onClick={()=>{this.shareTo(this.state.sharePlatform[3])}}>
							<span class="sharem-item-icon"></span>
						</div>
						<div class="sharem-item">
							<span class="sharem-item-icon"></span>
						</div>
						<div class="sharem-item">
							<span class="sharem-item-icon"></span>
						</div>
					</div>
				</div>
		</div>
	</div>
	}
}

var layer;
var LayerAPI = Layer;

function Share(param){
	if(!layer){
		ShareInit();
	}
	params = param;
	var isUC = navigator.userAgent.indexOf("UCBrowser") !== -1;
	var isQQ = navigator.userAgent.indexOf("MQQBrowser") !== -1;
	
	layer.onReady(function () {
		if (isUC || isQQ) {
			layer.show();
		} else {
			layer.onReady(function () {
				layer.component.shareTo('qzone', 'webapi');
			});
		}
	})
	
	return layer;

}

function ShareInit(){
	if(layer){
		return;
	}

	layer = new LayerAPI.LayerClass(ShareUI, {
		hashKey: "share"
	});
};

export default Share;