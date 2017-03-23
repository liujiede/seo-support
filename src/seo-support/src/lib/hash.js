import { events } from "enjoy-common-support";
import $History from "./history";

function fromQueryString(queryString){
	var json = {};
	queryString && queryString.split("&").forEach(item => {
		item = item.split("=");
		json[item[0]] = item[1] || "";
	});
	return json;
}

function toQueryString(json){
	var queryString = [];
	for(let key in json){
		let value = json[key];
		if(value !== "" && value !== null && typeof value !== "undefined"){
			queryString.push([key, value].join("="));
		}else{
			queryString.push(key);
		}
	}
	return queryString.join("&");
}

var Hash = events("change")({
	get(name){
		var hash = fromQueryString($History.hash);
		return hash[name];
	},
	set(name, value){
		var hash = fromQueryString($History.hash);
		hash[name] = value;
		$History.goHash(toQueryString(hash));
	},
	has(name){
		var hash = fromQueryString($History.hash);
		return typeof hash[name] !== "undefined";
	},
	remove(name){
		var hash = fromQueryString($History.hash);
		delete hash[name];
		$History.goHash(toQueryString(hash));
	}
});

$History.onHashChange(function(hash){
	Hash.fireChange(hash);
});

export default Hash;