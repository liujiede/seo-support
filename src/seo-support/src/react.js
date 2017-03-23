import React from "react";
import ReactDOM from "react-dom";

var ReactProxy = {};

Object.keys(React).forEach(function(key){
	ReactProxy[key] = React[key];
});

Object.keys(ReactDOM).forEach(function(key){
	if(key in ReactProxy){
		if(key !== "version"){
			console.log("Error: " + key + " has in React.");
		}
	}else{
		ReactProxy[key] = ReactDOM[key];
	}
});

module.exports = ReactProxy;