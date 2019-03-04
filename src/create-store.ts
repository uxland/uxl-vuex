import { Store, StoreOptions } from "vuex";

const createStore = <T>(defaultStore: StoreOptions<T>) => {
  return new Store<T>(defaultStore);
};

export default createStore;
