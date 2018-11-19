<template>
	<div class="line-chart__wrapper">
		<svg class="line-chart__main"></svg>
		<svg class="line-chart__preview-window"></svg>
	</div>
</template>

<script>
/*
 * Author: Måns Åberg
 *
 * Written: 2018-10
 *
 * License: MIT
 *
 */

/* eslint-disable indent */

/* Import D3 and an improved typeof function */
import * as d3 from 'd3';
import { toType, clamp } from './tools';

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
			duration: 500,
			svg: null,
			preview: {
				svg: null,
				g: null,
				container: null,
				dragged: null,
				margin: { top: 10, right: 10, bottom: 15, left: 30 }
			},
			g: null,
			lines: null,
			margin: { top: 20, right: 200, bottom: 30, left: 50 },
			ratio: 6,
			width: 0,
			height: 0,
			parseTime: d3.timeParse('%Y%m%d'),
			xAxisG: null,
			yAxisG: null,
			legend: null,
			legendHeight: 50,
			hidden: [],
			verticalLine: null,
			vGroup: null,
			rescaledX: null,
			rescaledY: null,
			horizontalAlignment: 0,
		};
	},
	mounted() {
		d3.select(this.$el).on("keydown", function () {
    		this.zooming = d3.event.ctrlKey;
		});
		/* Save height and width */
		this.width = this.$el.offsetWidth; this.height = this.$el.offsetHeight;
		/* Attach listener on window to handle resizing component */
		window.addEventListener('resize', this.onResize);
		/* Save svg as variable on instance for later */
		this.svg = d3.select('.line-chart__main');
		this.preview.svg = d3.select('.line-chart__preview-window');
		/* Initialize svg elements that are constant */
		this.init();
		/* Call update function to populate the chart with data */
		this.update(this.chartData, []);
	},
	computed: {
		/*
		 * Property that calculates the format of the x axis based on the first element in our data
		 */
		xAxisType() {
			if(!this.chartData || this.chartData.length === 0) return null
			return toType(this.chartData[0].values[0][this.xAxis]);
		},
		/*
		 * Property that calculates the padding for the content in our svg
		 */
		padded() {
			const width = this.width - this.margin.left - this.margin.right;
			const height = this.height - this.margin.top - this.margin.bottom;
			return { w: width, h: height };
		},
		previewDimensions() {
			return { w: this.width / this.ratio, h: this.height / this.ratio };
		},
		previewX() {
			const scales = {
				date: d3.scaleTime().range([0, this.previewDimensions.w]),
				number: d3.scaleLinear().range([0, this.previewDimensions.w]),
			};
			return scales[this.xAxisType];
		},
		previewY() {
			return d3.scaleLinear().range([this.previewDimensions.h, 0]);
		},
		/*
		 * Returns the correct scale for our data based on computed datatype
		 */
		x() {
			const scales = {
				date: d3.scaleTime().range([0, this.padded.w]),
				number: d3.scaleLinear().range([0, this.padded.w]),
			};
			return scales[this.xAxisType];
		},
		/*
		 * Returns a linear scale for our y axis with range set to the height of our svg content
		 */
		y() {
			return d3.scaleLinear().range([this.padded.h, 0]);
		},
		/*
		 * Returns a color scale with ten (10) colors
		 */
		z() {
			return d3.scaleOrdinal(d3.schemeCategory10);
		},
		/*
		 * Returns a d3.line with our x- and y axes
		 */
		line() {
			return d3.line()
				.x(d => this.x(d[this.xAxis]))
				.y(d => this.y(d[this.yAxis]));
		},
		/*
		 * Returns a d3.line rescaled for when we are zoomed
		 */
		scaledLine() {
			return d3.line()
				.x(d => this.rescaledX(d[this.xAxis]))
				.y(d => this.rescaledY(d[this.yAxis]));
		},
		previewLine() {
			return d3.line()
				.x(d => this.previewX(d[this.xAxis]))
				.y(d => this.previewY(d[this.yAxis]));
		},
		/* 
		 * Used for zooming the chart
		 */
		zoom() {
			return d3.zoom()
				.scaleExtent([1, 10])
				.translateExtent([[0, 0], [this.width, this.height]])
				.filter(function() {
					return d3.event.ctrlKey && (d3.event.type === 'wheel' || d3.event.type === 'mousedown');
				})
				.on('zoom', this.zoomed)
				.on('end', () => {
					/* We use a timeout since there is a delay after zooming */
					setTimeout(() => {
						this.setLine(true);
					}, 100)
				});
		}
	},
	/*
	 * Watchers
	 */
	watch: {
		/*
		 * Whenever new data is present in the component we update the chart
		 */
		chartData(newData, oldData) {
			this.update(newData, oldData);
		},
	},
	/*
	 * Component methods
	 */
	methods: {
		/*
		 * Whenever the window is resized we assign new values to our height and width
		 */
		onResize() {
			this.width = this.$el.offsetWidth; this.height = this.$el.offsetHeight;
			this.update(this.chartData, []);
		},
		/*
		 * Initializes constant elements in the svg
		 */
		init() {
			/* Set the size of our svg */
			this.svg
				.attr('height', this.height)
				.attr('width', this.width)
				.call(this.dragEvents)
				.call(this.zoom);

			/* Preview */
			this.preview.svg
				.attr('height', this.previewDimensions.h + this.preview.margin.left + this.preview.margin.right)
				.attr('width', this.previewDimensions.w + this.preview.margin.top + this.preview.margin.top);

			this.preview.g = this.preview.svg
				.append('svg:g')
				.attr('transform', `translate(${this.preview.margin.left}, ${this.preview.margin.top})`);

			this.preview.container = this.preview.g.append('svg:g');
			
			/* Append group to hold our graphical elements and align inside svg using margins */
			this.g = this.svg.append('svg:g')
				.attr('height', this.padded.h)
				.attr('width', this.padded.w)
				.attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

			this.lines = this.g.append('svg:g')
				.attr('class', 'line-chart__lines')
				.attr('clip-path', 'url(#clip)')
				.attr('height', this.padded.h)
				.attr('width', this.padded.w);

			/* Axis */
			this.xAxisG = this.g.append('svg:g')
				.attr('class', 'axis axis--x');
			this.yAxisG = this.g.append('svg:g')
				.attr('class', 'axis axis--y');

			this.yAxisG.append('svg:text')
				.attr('transform', 'rotate(-90)')
				.attr('y', 6)
				.attr('dy', '0.71em')
				.attr('fill', '#000')
				.text(this.yAxisText);

			/* Legend */
			this.legend = this.g.append('svg:g')
				.attr('class', 'line-chart__legend-container');

			/* Vertical line */
			this.verticalLine = this.g.append('svg:g')
				.attr('class', 'line-chart__verticalLine-container')
				.attr('transform', `translate(${this.padded.w / 4}, 0)`);

			this.verticalLine.append('svg:line')
				.attr('class', 'verticalLine-container--line')
				.attr('x1', 0)
				.attr('y1', 0)
				.attr('x2', 0)
				.attr('y2', this.padded.h)
				.style('stroke-width', '2px')
				.style('stroke', '#D3D3D3');

			/* Used to clip elements outside of zoomed area */
			this.svg.append('defs').append('svg:clipPath')
				.attr('id', 'clip')
				.append('rect')
				.attr('width', this.padded.w)
				.attr('height', this.padded.h);
		},
		/*
		 * Update function that renders the chart using the data provided
		 * Will transition from the old dataset if it is of the same dimensions
		 * as the data coming in (newData). Or do a clean sweep if the dimensions are
		 * not the same.
		 */
		update(newData, oldData) {
			if(!newData || newData.length === 0) return this.redraw([])
			this.$data.data = newData;
			/* Set up domains */
			const extentX = d3.extent(newData[0].values, d => d[this.xAxis]);
			const extentY = [
				d3.min(newData, d => d3.min(d.values, v => v[this.yAxis])),
				d3.max(newData, d => d3.max(d.values, v => v[this.yAxis])),
			];
			this.x.domain(extentX);
			this.y.domain(extentY);

			this.previewX.domain(extentX);
			this.previewY.domain(extentY);

			this.z.domain(newData.map(d => d.id));
			/* Update axes */
			this.xAxisG.call(d3.axisBottom(this.x))
				.attr('transform', `translate(0, ${this.padded.h})`);
			this.yAxisG.call(d3.axisLeft(this.y));
			/* Update legend and preview window axis */
			this.legend.selectAll('legend--rect')
				.data(newData).enter()
				.call(this.makeLegend);

			this.preview.svg
				.data(newData).enter()
				.call(this.makePreviewWindow);
			// const legend_offset = (this.padded.w / 2) - (this.legend.node().getBoundingClientRect().width / 2);
			const legend_offset = {
				x: this.padded.w + this.preview.margin.left,
				y: this.previewDimensions.h
			};
			/* Position legend */
			this.legend
				.attr('transform', `translate(${legend_offset.x}, ${legend_offset.y})`);
			/* Draw everything */
			this.redraw(newData);

			/* Circles for focus on line */
			this.verticalLine.selectAll('.verticalLine-container--circle').remove();
			const circles = this.verticalLine.selectAll('.verticalLine-container--circle')
				.data(newData).enter()
				.append('svg:circle');
			circles
				.attr('class', 'verticalLine-container--circle')
				.attr('id', d => `${d.label}_${d.id}`)
				.attr('r', 8)
				.attr('stroke', d => this.z(d.id));

			this.circles();
		},
		makeLegend(d) {
			/* Graphics */
			d3.selectAll('.legend-rect').remove()
			/* Group element */
			const rects = d.append('svg:g')
				.attr('class', 'legend-rect')
				.attr('id', d => `legend-rect-${d.label}_${d.id}`)
				.attr('transform', d => `translate(0, ${(d.id - 1) * 50})`)
				.style('cursor', 'pointer');

			/* Rectangles */
			rects.append('svg:rect')
				.attr('class', 'legend-rect--outer')
				.attr('height', '25px')
				.attr('width', '25px')
				.attr('fill', 'white')
				.attr('stroke', d => this.z(d.id))
				.attr('stroke-width', '2px');
			
			rects.append('svg:rect')
				.attr('class', 'legend-rect--inner')
				.attr('height', '25px')
				.attr('width', '25px')
				.attr('transform-origin', d => `12.5px 12.5px`)
				.attr('fill', d => this.z(d.id));

			/* Text */
			rects.append('svg:text')
				.attr('dy', '1em')
				.attr('dx', '30px')
				.text(d => d.label);

			/* Events */
			rects.on('click', this.toggleLineVisibility);
		},
		makePreviewWindow() {


			this.preview.g.append('svg:g')
				.attr('class', 'preview-axis axix--x')
				.attr('transform', `translate(0, ${ this.previewDimensions.h })`);

			this.preview.g.append('svg:g')
				.attr('class', 'preview-axis axix--y')
				.attr('transform', `translate(0, 0)`);

			this.preview.container.append('svg:rect')
				.attr('x', 0)
				.attr('y', 0)
				.attr('width', this.previewDimensions.w)
				.attr('height', this.previewDimensions.h)
				.attr('fill', '#dedede');

			/* Draggable rectangle */
			this.preview.dragged = this.preview.container
				.append('svg:rect')
				.data([{x: 0, y: 0}])
				.attr('x', 0)
				.attr('y', 0)
				.attr('width', this.previewDimensions.w)
				.attr('height', this.previewDimensions.h)
				.attr('fill', 'rgba(250, 235, 215, 0.78)')
				.style('cursor', 'move')
				.call(d3.drag().on('drag', this.dragged));
		},
		makeVerticalLine(d) {
		},
		isEqual(n, o) {
			/* First case, we get different nubmer of lines */
			if (n.length !== o.length)	return false;
			/* Second case, same amout of lines, but different amount of points */
			else if (n.length === o.length && n[0].values.length !== o[0].values.length) return false;
			/* Otherwise true */
			return true;
		},
		/*
		 * Redraws all the lines
		 */
		redraw(newData) {
			/* Remove all the lines */
			this.lines.selectAll('.dataline').remove().exit();
			if(!newData || newData.length === 0) return
			/* Adding the new lines */
			const dLine = this.lines.selectAll('.dataline')
				.data(newData)
				.enter().append('svg:g')
					.attr('class', 'dataline');

			dLine.append('svg:path')
				.attr('class', 'line')
				.attr('id', d => `${d.label}_${d.id}`)
				.attr('d', d => this.line(d.values))
				.style('stroke', d => this.z(d.id))
				.style('stroke-width', '2px')
				.style('transition', 'all 0.1s ease')
				.style('fill', 'none')
				.call(this.events);
			/*
			dLine.append('svg:circle')
				.attr('x', 0)
				.attr('y', 0)
				.attr('r', '5px')
				.attr('fill', d => this.z(d.id));
			*/
			dLine.append('svg:text')
				.datum(d => ({ id: d.id, value: d.values[d.values.length - 1] }))
				.attr('transform', d => `translate(${this.x(d.value[this.xAxis])}, ${this.y(d.value[this.yAxis])})`)
				.attr('x', 3)
				.attr('dy', '0.35em')
				.style('font', '10px sans-serif')
				.text(d => d.id);
		},
		setLine(zoom) {
			if(!zoom) {
				let x = d3.event.clientX - this.margin.left - this.svg.node().getBoundingClientRect().left;
			
				if(x > this.padded.w) x = this.padded.w;
				if(x < 0) x = 0;

				this.verticalLine
					.attr('transform', `translate(${x}, 0)`);
			}

			this.verticalLine
				.call(this.circles);
		},
		circles() {
			const vm = this;
			let xPos = parseInt(this.verticalLine.attr('transform').replace(/^\D+/g, '').split(',')[0]);
			let yPos = [];
			d3.selectAll('.line').each( function() {
				let start = 0;
				let end = this.getTotalLength();
				let pos;
				while(true) {
					let target = (start + end) / 2;				
					pos = this.getPointAtLength(target);
					if((target === end || target === start) && pos !== xPos) {
						break;
					}
					if(pos.x > xPos) end = target;
					else if(pos.x < xPos) start = target
					else break;
				}

				yPos.push(pos.y);
			});

			this.verticalLine.selectAll('.verticalLine-container--circle')
				.attr('transform', d => `translate(0, ${yPos[d.id - 1]})`);
		},
		toggleLineVisibility: function(d){
			const i = this.hidden.indexOf(d.id);
			let visible = i < 0 ? true : false;

			if(visible) this.hidden.push(d.id);
			else this.hidden.splice(i, 1);

			/* Invert visible to apply changes graphically */
			visible = !visible;

			d3.select(`#legend-rect-${d.label}_${d.id}`)
				.select('.legend-rect--inner')
					.transition()
					.duration(50)
					.attr('transform', `scale(${visible ? 1 : 0})`)

			d3.selectAll(`#${d.label}_${d.id}`)
				.style('opacity', (visible ? 1 : 0));
		},
		/* Events */
		dragged(d) {
			const w = this.preview.dragged.attr('width');
			const h = this.preview.dragged.attr('height');
			const x = clamp(d3.event.x, 0, this.previewDimensions.w - w);
			const y = clamp(d3.event.y, 0, this.previewDimensions.h - h);
			d3.select(this.preview.dragged.node())
				.attr('x', d.x = x)
				.attr('y', d.y = y);
		
			this.svg.call(this.zoom.transform, d3.zoomIdentity
				.scale(this.transform ? this.transform.k : 1)
				.translate(-x * this.ratio, -y * this.ratio)
			);
		},
		dragEvents(d) {
			d
				.on('mousedown', this.startDrag)
				.on('mouseup', this.stopDrag)
				.on('mousemove', this.mouseMove);
		},
		mouseMove() {
			if(this.dragging) {
				this.setLine();
			}
		},
		startDrag() {
			if(!d3.event.ctrlKey) {
				const CL  = d3.event.srcElement.classList;
				if(CL.contains('legend-rect--inner') || CL.contains('legend-rect--outer')) {
					d3.event.preventDefault();
				} else {
					this.dragging = true;
					this.setLine();

				}				
			}
		},
		stopDrag() {
			this.dragging = false;
		},
		events(d) {
			d
				.on('mouseover', this.mouseover)
				.on('mouseout', this.mouseout);
		},
		mouseover() {
			d3.select(d3.event.target)
				.style('cursor', 'pointer')
				.style('stroke-width', '5px');
		},
		mouseout() {
			d3.select(d3.event.target)
				.style('cursor', 'default')
				.style('stroke-width', '2px');
		},
		zoomed() {
			this.transform = d3.event.transform;
			/* Set current transformation value */
			/* Right- and bottom edge */
			const re = (Math.abs(this.transform.x) / this.transform.k) + 
				(this.padded.w / this.transform.k);
			const be = (Math.abs(this.transform.y) / this.transform.k) + 
				(this.padded.h / this.transform.k);
		
			if(re > this.padded.w) {
				this.transform.x = -( (this.padded.w * this.transform.k) - this.padded.w);
			}

			if(be > this.padded.h) {
				this.transform.y = -( (this.padded.h * this.transform.k) - this.padded.h);
			}

			this.rescaledX = this.transform.rescaleX(this.x);
			this.rescaledY = this.transform.rescaleY(this.y);
		
			this.xAxisG.call(d3.axisBottom(this.rescaledX));
			this.yAxisG.call(d3.axisLeft(this.rescaledY));

			this.lines.selectAll('.line')
				.attr('d', d => this.scaledLine(d.values));

			/* Set preview window pos */
			const xPreviewPos = this.previewX.range().map(this.transform.invertX, this.transform)[0];
			const yPreviewPos = this.previewY.range().map(this.transform.invertY, this.transform)[1];

			this.preview.dragged
				.data([{ x: xPreviewPos / this.ratio, y: yPreviewPos / this.ratio }])
				.attr('x', d => d.x)
				.attr('y', d => d.y)
				.attr('width', this.previewDimensions.w / this.transform.k)
				.attr('height', this.previewDimensions.h / this.transform.k);
		}
	},
};

</script>

<style lang = "scss">
	.line-chart__wrapper {
		height: 100%;
		width: 100%;
		user-select: none;
		position: relative;

		.axis--x path {
		}

		.dataLine {
			.line {
				cursor: pointer;
				transition: all 0.3s ease;
			}
		}

		.line-chart__legend-container {
			border: solid 1px;

			.legend--rect {

			}
		}

		.line-chart__verticalLine-container {
			.verticalLine-container--circle {
				fill: none;
				stroke-width: 2px;
			}
		}
		.line-chart__preview-window {
			position: absolute;
			top: 0;
			right: 0;
		}
	}

</style>