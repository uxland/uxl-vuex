<template>
  <h1>{{msg}}</h1>
</template>
<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop } from "vue-property-decorator";
import { ViewDefinition } from "../src/view-definition";

@Component
export default class TestComponent extends Vue {
  @Prop()
  msg!: string;
  view: ViewDefinition;
  mounted() {
    this.msg = this.view.options.msg;
  }
}
</script>
