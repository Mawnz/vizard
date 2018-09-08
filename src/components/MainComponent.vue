<template>
	<div class = "half">
		<LineChart :chartData = "chartData" xAxisText="Number" yAxisText="Value"></LineChart>
	</div>
</template>

<script>
/* Line chart */
import LineChart from '@/d3-components/line-chart';

export default {
	name: 'MainComponent',
	components: {
		LineChart,
	},
	data() {
		return {
			numOfPoints: 10,
		};
	},
	computed: {
		chartData() {
			const arr = [];
			let val = 50;
			for (let i = 1; i <= this.numOfPoints; i += 1) {
				val += (Math.random() > 0.5) ? 5 : -5;
				arr.push({ x: i, y: val });
			}
			return [{ id: 1, values: arr }];
		},
	},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang = "scss">
	div.half {
		height: 500px;
		width: 500px;
	}
</style>
