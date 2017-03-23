var styleNode = document.createElement("div");
styleNode.innerHTML = '<br /><style type="text/css">{content}</style>';
module.exports = document.getElementsByTagName("head")[0].appendChild(styleNode.lastChild);
styleNode = null;