<template>
  <region-holder></region-holder>
</template>
<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";

import RegionHolder from "./RegionHolder.vue";

@Component({
  components: { RegionHolder }
})
export default class App extends Vue {}
</script>
