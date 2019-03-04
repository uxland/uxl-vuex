// Vue libraries
import Vue from "vue";
import Vuex from "vuex";
import App from "./App.vue";
import { Action } from "../src/create-action";
import { createAsyncAction } from "../src/create-async-action";
import createAsyncMutation, { registerAsyncMutation } from "../src/create-async-mutation";
import createStore from "../src/create-store";

Vue.use(Vuex);

const setMessage = (state: any, message: string) => (state.msg = message);

const setUsers = (state: any, action: Action) =>
  Vue.set(state, "users", createAsyncMutation("FETCH_USERS", null)(state.users, action));

let mutations = {
  ["SET_MESSAGE"]: setMessage
};

registerAsyncMutation(mutations, "FETCH_USERS", setUsers);

const store = createStore({
  state: {
    msg: "Test"
  },
  getters: {
    message: state => state.msg,
    users: state => state.users
  },
  mutations: mutations
});

export default store;

/* eslint-disable no-new */
new Vue({
  store: store,
  template: "<App/>",
  components: { App }
}).$mount("#app");
