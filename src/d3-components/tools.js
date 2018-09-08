/* https://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/ */
export default {
	name: 'toType',
	toType(obj) {
		return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
	},
};
