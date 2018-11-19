<template>
	<div class = "half">
		<LineChart :chartData = "chartData" xAxisText="Number" yAxisText="Value"></LineChart>
		<button @click="update">Update</button>
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
			numOfPoints: 50,
			numOfLines: 3,
			chartData: []
		};
	},
	mounted() {
		this.update();
	},
	methods: {
		update() {
			this.chartData = [];
			for(let i = 1; i <= this.numOfLines; i += 1) {
				let val = Math.round(Math.random() + 50);
				let arr = [];
				for (let j = 1; j <= this.numOfPoints; j += 1) {
					val += (Math.random() > 0.5) ? 5 : -5;
					arr.push({ x: j, y: val });
				}
				this.chartData.push({id: i, label: 'Line_' + i, values: arr})
			}
		}
	},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang = "scss">
	div.half {
		height: 600px;
		width: 1200px;
	}
</style>
