<template>
  <svg></svg>
</template>

<script>
// Import d3
import * as d3 from 'd3';

export default {
  name: 'MainComponent',
  components: {
  },
  data() {
    return {
      svg: null,
      margin: { top: 20, right: 20, bottom: 30, left: 50 },
    };
  },
  mounted() {
    this.svg = d3.select('svg');
  },
  computed: {
    width() {
      return this.$el.offsetWidth;
    },
    height() {
      return this.$el.offsetHeight;
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang = "scss">

</style>
