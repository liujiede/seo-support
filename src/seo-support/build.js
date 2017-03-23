var fs = require("fs");
var path = require("path");
var babel = require("babel-core");
var postcss = require("postcss");
var postcssJs = require("postcss-js");
var autoprefixer = require("autoprefixer");

var sep = path.sep;

const prefixs = ["O", "Moz", "Webkit"];
function prefixTransform(path, t){
	prefixs.forEach(function(prefix){
		var newNode = t.cloneDeep(path.node);
		newNode.left.property.name = prefix + "Transform";
		path.parentPath.insertBefore(t.expressionStatement(newNode));
	});
}
function prefixTransition(path, t){
	prefixs.forEach(function(prefix){
		var newNode = t.cloneDeep(path.node);
		newNode.left.property.name = prefix + "Transition";
		if(newNode.right.type === "StringLiteral"){
			newNode.right.value = newNode.right.value.replace(/\-(o|moz|webkit)\-transform/, "transform").replace(/transform/g, "-" + prefix.toLowerCase() + "-transform");
		}
		path.parentPath.insertBefore(t.expressionStatement(newNode));
	});
}

function asyncList (list, callback){
	var count = list.length,
		results = [];
	if(list && count > 0){
		list.forEach(function(item, index) {
			item(function(result) {
				results[index] = result;
				count --;
				if(count === 0){
					callback.apply(null, results);
				}
			});
		});
	}else{
		callback();
	}
};

var ignore = [];
function readFiles (dir, ext, isDeep, callback){
	var files = [];

	dir = dir.replace(/(\/|\\)$/, "");

	fs.readdir(dir, function(err, _files){
		if(err){
			throw err;
		}

		var dirs = [],
			readStatList = [];
		_files.forEach(function(filename){
			if(ignore.indexOf(filename) !== -1){
				return;
			}

			var file = dir + sep + filename;

			readStatList.push(function(callback){
				fs.stat(file, function(err, stats){
					if(err){
						throw err;
					}

					var _ext = path.extname(filename);

					if(stats.isDirectory()){
						dirs.push(function(callback){
							readFiles(file, ext, isDeep, function(_files){
								files = files.concat(_files);
								callback();
							});
						});
						if(ext === "/"){
							files.push(file);
						}
					}else{
						if(ext){
							if(_ext === ext){
								files.push(file);
							}
						}else{
							files.push(file);
						}
					}
					callback();
				});
			});
		});

		asyncList(readStatList, function(){
			if(isDeep && dirs.length){
				asyncList(dirs, function(){
					callback(files);
				});
			}else{
				callback(files);
			}
		});
	});
};

function mkdirs(dirpath, callback) {
    if(callback){
        fs.exists(dirpath, function(exists) {
            if(exists) {
                    callback(dirpath);
            } else {
                    //尝试创建父目录，然后再创建当前目录
                    mkdirs(path.dirname(dirpath), function(){
                            fs.mkdir(dirpath, callback);
                    });
            }
        });
    }else{
        if(fs.existsSync(dirpath)){
            return true;
        }else{
            if(mkdirs(path.dirname(dirpath))){
                fs.mkdirSync(dirpath);
                return true;
            }
        }
    }
};

function write(file, content){
	mkdirs(path.dirname(file), function(){
		fs.writeFile(file, content, function(err){
			if(err){
				throw err;
			}
		});
	});
}

var cssTpl = fs.readFileSync(path.join(__dirname, "css.tpl"), {
		encoding: "utf8"
	});

readFiles(path.join(__dirname, "src"), null, true, function(files){
	var prefixer = postcssJs.sync([ autoprefixer({
			browsers: [
				"ChromeAndroid >= 30"
				,"iOS >= 6"
				,"and_uc >= 10"
				,"Samsung >= 3.3"
				,"Android >= 4.0"
				,"and_ff >= 6.0"
			]
		}) ]);
	var t = babel.types;

	files.forEach(function(file){
		var distFile = file.replace("/src/", "/dist/");

		// var _file = file.split("/src/");
		// _file.shift();
		// _file = _file.join("/src/");
		// var distFile = "/Users/lifan/work-elong/h5-eroom-enjoy/MinSu/web/h5/node_modules/enjoy-web-support/dist/" + _file;

		var ext = path.extname(file);

		if(ext === ".js"){
			babel.transformFile(file, {
				presets: ['es2015', "stage-0"],
				plugins: ["transform-react-jsx", "transform-decorators-legacy"],
			}, function(err, result){
				if(err){
					throw err;
				}

				result = babel.transformFromAst(result.ast, result.code, {
					plugins: [function () {
						return {
							visitor: {
								CallExpression: {
									enter(path){
										var node = path.node;
										if(node.callee.type === "Identifier" && node.callee.name === "require" && node.arguments[0].type === "StringLiteral"){
											node.arguments[0].value = node.arguments[0].value.replace(/\.(css)$/, "-$1");
										}else if(node.callee.type === "MemberExpression" &&
											// node.callee.object.type === "Identifier" &&
											// node.callee.object.name === "React" &&
											node.callee.property.type === "Identifier" &&
											node.callee.property.name === "createElement" &&
											node.arguments[1] &&
											node.arguments[1].type === "ObjectExpression"){
											let properties = node.arguments[1].properties;
											properties.forEach(property => {
												var key = property.key;
												switch(key.value){
													case "class":
														key.value = "className";
														break;
													case "for":
														key.value = "htmlFor";
														break;
												}
											});
										}

										if(node.callee.type === "Identifier" &&
											node.callee.name === "__style__" &&
											node.arguments[0] &&
											node.arguments[0].type === "ObjectExpression"){
											var obj = node.arguments[0];
											//path.replaceWith(obj);
											var code = babel.transformFromAst(t.file(
																				t.program(
																					[
																						t.expressionStatement(obj)
																					],
																					[]
																				),
																				[],
																				[]
																			), "", {});
											code = new Function("return " + code.code)();
											var isFlex = false;
											if(code.display === "flex"){
												isFlex = true;
												delete code.display;
											}
											code = prefixer(code);
											if(isFlex){
												// code.display = "-webkit-box";
												// code.display = "-webkit-flex";
												// code.display = "-ms-flexbox";
												code.display ="flex";
											}
											path.replaceWithSourceString(JSON.stringify(code));
										}
									}
								},
								AssignmentExpression: {
									enter(path){
										var node = path.node;
										if(node.operator === "=" &&
											node.left.type === "MemberExpression" &&
											node.left.property.type === "Identifier"){

											//var newNode = t.cloneDeep(node);

											switch(node.left.property.name){
												case "transform":
													// newNode.left.property.name = "WebkitTransform";
													// path.parentPath.insertBefore(t.expressionStatement(newNode));
													prefixTransform(path, t);
													break;
												case "transition":
													// newNode.left.property.name = "WebkitTransition";
													// if(newNode.right.type === "StringLiteral"){
													// 	newNode.right.value = newNode.right.value.replace(/\-webkit\-transform/, "transform").replace(/transform/g, "-webkit-transform");
													// }
													// path.parentPath.insertBefore(t.expressionStatement(newNode));
													prefixTransition(path, t);
													break;
											}
										}
									}
								},
							}
						};
					}]
				});

				write(distFile, result.code);
			});
		}else if(ext === ".css"){
			fs.readFile(file, {
				encoding: "utf8"
			}, function(err, result){
				if(err){
					throw err;
				}

				postcss([ autoprefixer({
					browsers: [
						"ChromeAndroid >= 30"
						,"iOS >= 6"
						,"and_uc >= 10"
						,"Samsung >= 3.3"
						,"Android >= 4.0"
						,"and_ff >= 6.0"
					]
				}) ]).process(result).then(function (result) {
					result.warnings().forEach(function (warn) {
						console.warn(warn.toString());
					});
					write(distFile.replace(/\.css$/, "-css.js"), cssTpl.replace("{content}", result.css.replace(/[\n\r\t]+/g, " ")));
				});

			});
		}else{
			fs.readFile(file, {
				encoding: "utf8"
			}, function(err, result){
				if(err){
					throw err;
				}

				write(distFile, result);
			});
		}
	});
});