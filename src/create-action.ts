import isNil from "ramda/es/isNil";
import is from "ramda/es/is";
import identity from "ramda/es/identity";

export interface Action<Payload = any, Meta = any> {
  type?: any;
  payload?: Payload;
  meta?: Meta;
  error?: boolean;
  timestamp?: Date;
}

const invariant = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message);
};
export const createAction: <Payload = any, Meta = any>(
  type: string,
  payloadCreator?: (...args: any[]) => Payload,
  metaCreator?: (...args: any[]) => Meta
) => (...args: any[]) => Action<Payload, Meta> = (type, payloadCreator = identity, metaCreator) => {
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
    return action;
  };
  actionCreator.toString = () => type;
  return actionCreator;
};

export default createAction;
