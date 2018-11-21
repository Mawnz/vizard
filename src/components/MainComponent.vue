<template>
	<div class = "half">
		<LineChart 
			:chartData = "chartData"
			xAxisText="Number"
			yAxisText="Value"
			:options="options"
			v-on:horizontalPosition="hPos"></LineChart>
		<button @click="update">Update</button>
		<div>{{focused}}</div>
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
			numOfPoints: 500,
			numOfLines: 3,
			chartData: [],
			options: {
				hideYAxis: true
			},
			focused: '',
		};
	},
	mounted() {
		this.update();
	},
	methods: {
		hPos(i) {
			this.focused = this.chartData[0].values[i];
		},
		update() {
			this.chartData = [];
			for(let i = 1; i <= this.numOfLines; i += 1) {
				let val = Math.round(Math.random() + 50);
				let arr = [];
				for (let j = 1; j <= this.numOfPoints; j += 1) {
					val += (Math.random() > 0.5) ? 3 : -3;
					const date = new Date();
					const newDate = new Date(date.getTime() + (j * 1000000));
					arr.push({ x: newDate, y: val });
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
		height: 50vh;
		width: 80vw;
	}
</style>
