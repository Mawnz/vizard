/* https://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/ */
export function toType(obj) {
	return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
}

export function something() {
	return 'something';
}

export function clamp(number, bottom, top) {
	let result = number;
	if (number < bottom) {
		result = bottom;
	}
	if (number > top) {
		result = top;
	}
	return result;
}
