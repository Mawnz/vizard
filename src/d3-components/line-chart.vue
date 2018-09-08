<template>
	<div>
		<svg></svg>
	</div>
</template>

<script>
/* eslint-disable indent */

/* Import D3 and an improved typeof function */
import * as d3 from 'd3';
import { toType } from './tools';

export default {
	name: 'LineChart',
	props: {
		chartData: Array,
		xAxis: {
			type: String,
			default: () => ('x'),
		},
		yAxis: {
			type: String,
			default: () => ('y'),
		},
		xAxisText: String,
		yAxisText: String,
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
		this.update(this.chartData);
	},
	computed: {
		/* Determines datatype for x axis */
		xAxisType() {
			return toType(this.chartData[0].values[0][this.xAxis]);
		},
		width() {
			return this.$el.offsetWidth - this.margin.left - this.margin.right;
		},
		height() {
			return this.$el.offsetHeight - this.margin.top - this.margin.bottom;
		},
		x() {
			const scales = {
				date: d3.scaleTime().range([0, this.width]),
				number: d3.scaleLinear().range([0, this.width]),
			};
			return scales[this.xAxisType];
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
				.x(d => d[this.xAxis])
				.y(d => d[this.yAxis]);
		},
	},
	watch: {
		chartData(newData) {
			this.update(newData);
		},
	},
	methods: {
		// eslint-disable-next-line
		update(newData) {
			/* Set up domains */
			this.x.domain(d3.extent(newData[0].values, d => d[this.xAxis]));
			this.y.domain([
				d3.min(newData, d => d3.min(d.values, v => v[this.yAxis])),
				d3.max(newData, d => d3.max(d.values, v => v[this.yAxis])),
			]);
			this.z.domain(newData.map(d => d.id));
			/* Add axes */
			this.g.append('svg:g')
					.attr('class', 'axis axis--x')
					.attr('transform', `translate(0, ${this.height})`)
					.call(d3.axisBottom(this.x));
			this.g.append('svg:g')
					.attr('class', 'axis axis--y')
					.call(d3.axisLeft(this.y))
				.append('svg:text')
					.attr('transform', 'rotate(-90)')
					.attr('y', 6)
					.attr('dy', '0.71em')
					.attr('fill', '#000')
					.text(this.yAxisText);
			/* Adding the lines */
			const dLine = this.g.selectAll('.dataline')
				.data(newData)
				.enter().append('svg:g')
					.attr('class', 'dataline');

			dLine.append('svg:path')
				.attr('class', 'line')
				.attr('d', d => this.line(d.values))
				.style('stroke', d => this.z(d.id));
			dLine.append('svg:text')
				.datum(d => ({ id: d.id, value: d.values[d.values.length - 1] }))
				.attr('transform', d => `translate(${this.x(d.value[this.xAxis])}, ${this.y(d.value[this.yAxis])})`)
				.attr('x', 3)
				.attr('dy', '0.35em')
				.style('font', '10px sans-serif')
				.text(d => d.id);
		},
	},
};

</script>

<style scoped>
	.axis--x path {
		display: none;
	}

	.line {
		fill: none;
		stroke: steelblue;
		stroke-width: 1.5px;
	}
</style>
