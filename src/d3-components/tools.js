/* https://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/ */
export function toType(obj) {
	return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
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

const formatSecond = timeFormat(":%S"),
	formatMinute = timeFormat("%I:%M %p"),
	formatHour = timeFormat("%I %p"),
	formatDay = timeFormat("%a %d"),
	formatWeek = timeFormat("%b %d"),
	formatMonth = timeFormat("%B"),
	formatYear = timeFormat("%Y");

import { timeSecond, timeMinute, timeHour, timeDay, timeWeek, timeMonth, timeYear, timeFormat } from 'd3';

export function multiFormat(date) {
	return formatDay(date) + ', ' + formatMinute(date);
}
