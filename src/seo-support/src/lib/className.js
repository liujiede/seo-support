var spliter = /\s+/;

export default function className(dom){
	var classList = dom.classList;
	return {
		add(classNames){
			classNames && classNames.split(spliter).forEach(className => {
				classList.add(className);
			});
		},

		remove(classNames){
			classNames && classNames.split(spliter).forEach(className => {
				classList.remove(className);
			});
		},

		replace(className1, className2){
			this.remove(className1);
			this.add(className2);
		}
	};
}