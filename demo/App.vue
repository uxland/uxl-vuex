<template>
  <div>
    <button @click="changeMessage">CHANGE MESSAGE</button>
    <div>Message: {{msg}}</div>

    <button @click="fetchUsers">FETCH USERS</button>
    <pre>{{users}}</pre>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import store from "./main";
import Component from "vue-class-component";
import { Getter } from "vuex-class";
import { createAsyncAction } from "../src/create-async-action";
import { AsyncState } from "../src/is-async-stale";

const setMessage = (msg: string) => msg && store.commit("SET_MESSAGE", msg);
const fetchUsersList = () =>
  createAsyncAction(
    store,
    "FETCH_USERS",
    null,
    async (...args: any[]) =>
      await new Promise((resolve, reject) =>
        setTimeout(() => resolve([]), 5000)
      ),
    () => {}
  );

@Component
export default class App extends Vue {
  @Getter("message")
  msg!: string;

  @Getter("users")
  users!: AsyncState<any>;

  changeMessage() {
    setMessage("Hi!");
  }

  fetchUsers() {
    fetchUsersList();
  }
}
</script>
