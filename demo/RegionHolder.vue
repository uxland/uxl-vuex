<template>
  <div ref="region-holder"></div>
</template>

<script lang="ts">
import Vue from "vue";
import { RegionHost } from "../src/region-host-mixin";
import Component from "vue-class-component";
import { region } from "../src/region-decorator";
import { IRegion } from "../src/region";
import { ViewDefinition } from "../src/view-definition";
import { regionManager } from "../src/region-manager";

const TestComponentImport = () => import("./TestComponent.vue");

@Component
export default class RegionHolder extends RegionHost(Vue) {
  @region({ name: "regionHolder", targetId: "region-holder" })
  regionHolder!: IRegion;
}

const viewFactory = (content: string): any => (
  key: string,
  view: ViewDefinition
): any => TestComponentImport().then(c => Promise.resolve(c.default));
regionManager.registerViewWithRegion("regionHolder", "view1", {
  factory: viewFactory("view1"),
  options: { msg: "view1" }
});
</script>

