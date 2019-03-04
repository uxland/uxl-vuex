import { createAsyncActions } from "./create-async-actions";
import { Action } from "state";
import is from "ramda/es/is";
import isNil from "ramda/es/isNil";
import isEmpty from "ramda/es/isEmpty";
import identity from "ramda/es/identity";
import drop from "ramda/es/drop";
import { Store } from "vuex";

const invariant = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message);
};

const createAction: <S, Payload = any, Meta = any>(
  store: Store<S>,
  type: string,
  payloadCreator?: (...args: any[]) => Payload,
  metaCreator?: (...args: any[]) => Meta
) => (...args: any[]) => Action<Payload, Meta> = (store, type, payloadCreator = identity, metaCreator) => {
  invariant(
    is(Function, payloadCreator) || isNil(payloadCreator),
    "Expected payloadCreator to be a function, undefined or null"
  );
  const hasMeta = is(Function, metaCreator);

  const finalPayloadCreator: (...args: any[]) => any =
    isNil(payloadCreator) || payloadCreator === identity
      ? identity
      : (head, ...args) => (head instanceof Error ? head : payloadCreator(head, ...args));
  const actionCreator = (...args: any[]) => {
    const action = <Action>{ type };
    const payload = finalPayloadCreator(...args);
    if (!isNil(payload)) action.payload = payload;
    if (hasMeta) action.meta = metaCreator(...args);
    if (action.payload instanceof Error) action.error = true;
    store.commit(type, action);
    return action;
  };
  actionCreator.toString = () => type;
  return actionCreator;
};

const createAsyncActionCreator = <S>(
  store: Store<S>,
  type: string,
  moduleId: string,
  fn: Function,
  metaCreator?: (...args: any[]) => any
) => {
  let actions = createAsyncActions(`${!isEmpty(moduleId) ? moduleId.concat(`/${type}`) : type}`);

  const finalMetaCreator = (mc: any) => (isNil(mc) ? undefined : (...args: any[]) => mc(...drop(1, args)));
  const actionCreators = {
    [actions.started]: createAction(store, actions.started, undefined, finalMetaCreator(metaCreator)),
    [actions.succeeded]: createAction(store, actions.succeeded, undefined, finalMetaCreator(metaCreator)),
    [actions.failed]: createAction(store, actions.failed, undefined, finalMetaCreator(metaCreator)),
    [actions.ended]: createAction(store, actions.ended, undefined, finalMetaCreator(metaCreator))
  };

  const factory: any = (...args: any[]) => {
    let startedAt = new Date().getTime();
    let result: any = null;
    actionCreators[actions.started](null, ...args);
    const succeeded = (data: any) => {
      actionCreators[actions.succeeded](data, ...args);
      let endedAt = new Date().getTime();
      actionCreators[actions.ended](endedAt - startedAt, ...args);
      return data;
    };
    const failed = (err: Error) => {
      let endedAt = new Date().getTime();
      actionCreators[actions.failed](err, ...args);
      actionCreators[actions.ended](endedAt - startedAt, ...args);
      throw err;
    };
    try {
      result = fn(...args);
    } catch (error) {
      failed(error);
    }
    // in case of async (promise), use success and fail callbacks.
    if (result && result.then) {
      return result.then(succeeded, failed);
    }
    return succeeded(result);
  };

  return factory;
};

export const createAsyncAction = <S>(
  store: Store<S>,
  type: string,
  moduleId: string,
  fn: Function,
  metaCreator: (...args: any[]) => any,
  ...args: any[]
) => createAsyncActionCreator(store, type, moduleId, fn, metaCreator)(args[0]);

export default createAsyncAction;
