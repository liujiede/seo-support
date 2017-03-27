var path = require("path");
var filesToEs5 = require("files-to-es5");

//if (__dirname.split(path.sep).splice(-2, 1)[0] === "node_modules") {
	filesToEs5({
		src: __dirname + '/src',
		output: __dirname + '/dist',
		ignore: ["node_modules/**/*", "build.js"],
		plugins: ["transform-react-jsx", "transform-decorators-legacy"]
	});
//}