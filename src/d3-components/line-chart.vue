<template>
	<svg></svg>
</template>

<script>
/* eslint-disable indent */

/* Import D3 and an improved typeof function */
import * as d3 from 'd3';
import toType from './tools';

export default {
	name: 'LineChart',
	props: {
		chartData: Array,
		_key: {
			type: String,
			default: () => ('x'),
		},
		_value: {
			type: String,
			default: () => ('y'),
		},
	},
	data() {
		return {
			svg: null,
			g: null,
			margin: { top: 20, right: 20, bottom: 30, left: 50 },
			parseTime: d3.timeParse('%Y%m%d'),
		};
	},
	mounted() {
		this.svg = d3.select('svg');
		this.g = this.svg.append('svg:g')
				.attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);
		this.init();
	},
	computed: {
		width() {
			return this.$el.offsetWidth - this.margin.left - this.margin.right;
		},
		height() {
			return this.$el.offsetHeight - this.margin.top - this.margin.bottom;
		},
		x() {
			return d3.scaleTime().range([0, this.width]);
		},
		y() {
			return d3.scaleLinear().range([this.height, 0]);
		},
		z() {
			return d3.scaleOrdinal(d3.schemeCategory10);
		},
		line() {
			return d3.line()
				.curve(d3.curveBasis)
				.x(d => d[this.key])
				.y(d => d[this.value]);
		},
	},
	watch: {
		chartData() {
			console.log('New Data');
		},
	},
	methods: {
		init() {
			/* Determine datatype based on first occurence */
			console.log(this.chartData);
			console.log(toType);
			const type = toType(this.chartData[0][this.x]);
			console.log(type);
		},
	},
};

</script>
