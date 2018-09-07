<template>
	<svg></svg>
</template>

<script>
/* eslint-disable indent */

// Import d3
import * as d3 from 'd3';

export default {
	name: 'LineChart',
	props: {
		_key: {
			type: String,
			default: () => ('x')
		},
		_value: {
			type: String,
			default: () => ('y')
		},
	}	
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
	},
	computed: {
		width() {
			return this.$el.offsetWidth - this.margin.left - this.margin.right;
		},
		height() {
			return this.$el.offsetHeight - this.margin.top - this.margin.bottom;
		},
		x() {
			return d3.scaleTime().range([0, width]);
		},
		y() {
			return d3.scaleLinear().range([height, 0]);
		},
		z() {
			return d3.scaleOrdinal(d3.schemeCategory10);
		},
		line() {
			return d3.line()
				.curve(d3.curveBasis)
				.x( (d) => { return d[_key] })
				.y( (d) => { return d[_value] })
		}
	},
};

</script>