import { resolvePath } from "./path-resolver";
import { createAsyncActions } from "./create-async-actions";
import { get, set } from "dot-prop-immutable";
import { AsyncState, Action, Options } from "state";
import is from "ramda/es/is";
import isEmpty from "ramda/es/isEmpty";
import values from "ramda/es/values";
import isNil from "ramda/es/isNil";

const defaultState: AsyncState = {
  error: false,
  didInvalidate: false,
  isFetching: false
};
export const getDefaultState = () => ({ ...defaultState });

type PropertySetter = (state: AsyncState, action: Action) => AsyncState;
const piper = (...pipes: PropertySetter[]) => (state: AsyncState, action: Action) =>
  pipes.reduce((previousValue, currentValue) => currentValue(previousValue, action), state);

const extractExceptions = (action: Action) =>
  action.payload ? (is(Array, action.payload) ? action.payload : [action.payload]) : null;
const extractErrorDescription = (action: Action) =>
  action.payload ? (!isNil(action.payload.message) ? action.payload.message : String(action.payload)) : "";

const setPropertyOnlyIfDefined = (state: any, prop: string, value: any) =>
  value ? { ...state, [prop]: value } : state;
const setTimestampFactory = (options: Options) => (state: AsyncState, action: Action) => {
  const timestamp = options.timestampAccessor ? options.timestampAccessor(action) : action.timestamp;
  return setPropertyOnlyIfDefined(state, "timestamp", timestamp);
};
const setPayloadFactory = <T>(options: Options<T>) => (state: AsyncState<T>, action: Action) => ({
  ...state,
  state: options.payloadAccessor ? options.payloadAccessor(action) : action.payload
});
const setIsFetching = (state: AsyncState) => ({ ...state, isFetching: true });
const setElapsed = (state: AsyncState, action: Action) => setPropertyOnlyIfDefined(state, "elapsed", action.payload);
const setErrorDescription = (state: AsyncState, action: Action): AsyncState =>
  setPropertyOnlyIfDefined(state, "errorDescription", extractErrorDescription(action));
const setErrorExceptions = (state: AsyncState, action: Action): AsyncState =>
  setPropertyOnlyIfDefined(state, "exceptions", extractExceptions(action));

const setter = (options: Options, setter: any) => {
  const getState = (state: AsyncState, action: Action) =>
    options.pathResolver ? get(state, resolvePath(options.pathResolver, action)) : state;
  const setState = (state: AsyncState, newState: AsyncState, action: Action) =>
    options.pathResolver ? set(state, resolvePath(options.pathResolver, action), newState) : newState;

  return (state: AsyncState, action: Action) => {
    const currentState = getState(state, action);
    const newState = setter(currentState, action);
    return newState !== currentState ? setState(state, newState, action) : state;
  };
};

const initialValueSetter = (setter: any, initialValue: AsyncState) => (state: AsyncState, action: Action) =>
  setter(initialValue, action);
const nop = (state: any) => state;

export const createAsyncMutation = <T>(type: string, moduleId: string, options: Options<T> = {}) => {
  const initialValue = isNil(options.defValue) ? { ...defaultState } : { ...defaultState, state: options.defValue };
  let actions = createAsyncActions(`${!isEmpty(moduleId) ? moduleId.concat(`/${type}`) : type}`);
  const setterFactory = (...pipes: PropertySetter[]) => piper(...pipes, setTimestampFactory(options));
  const setters = <any>{
    [actions.started]: setter(options, initialValueSetter(setterFactory(setIsFetching), initialValue)),
    [actions.succeeded]: setter(options, initialValueSetter(setterFactory(setPayloadFactory(options)), initialValue)),
    [actions.failed]: setter(
      options,
      initialValueSetter(
        setterFactory(state => ({ ...state, error: true }), setErrorDescription, setErrorExceptions),
        initialValue
      )
    ),
    [actions.ended]: setter(options, setterFactory(setElapsed)),
    [actions.invalidated]: setter(options, setterFactory(state => ({ ...state, didInvalidate: true })))
  };
  return (state: AsyncState<T> = options.pathResolver ? <any>{} : initialValue, action: Action<T>) =>
    (setters[action.type] || nop)(state, action);
};

export default createAsyncMutation;

export const registerAsyncMutation = (mutations: any, type: string, mutation: Function) => {
  const asyncActions = createAsyncActions(type);
  values(asyncActions).forEach(action => (mutations[action] = mutation));
};
