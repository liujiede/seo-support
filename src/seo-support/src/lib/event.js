export default function(eventNames){
	var event = {};
	var handlers = {};

	eventNames.forEach(eventName => {
		handlers[eventName] = [];

		event["on" + eventName.replace(/(^[a-z]|\-[a-z])/g, function(char){
			return char.replace("-", "").toUpperCase();
		})] = function(handler){
			handlers[eventName].push(handler);
			return this;
		};
	});

	event.fire = function(eventName){
		var argus = Array.prototype.splice.call(arguments, 1);

		handlers[eventName].forEach(handler => {
			handler.apply(null, argus);
		});
		return this;
	};

	return event;
};