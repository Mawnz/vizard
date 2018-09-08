<template>
	<LineChart :chartData = "chartData"></LineChart>
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
			for (let i = 1; i <= this.numOfPoints; i += 1) {
				arr.push({ x: i, y: Math.floor(Math.random() * 10) });
			}
			return arr;
		},
	},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang = "scss">

</style>
