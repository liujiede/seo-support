// 异步列表
export default function(list, callback){
	var count = list.length,
		results = [];
	if(list && count > 0){
		list.forEach((item, index) => {
			item(result => {
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