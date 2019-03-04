declare module "state" {
  export interface AsyncState<TState = any> {
    isFetching: boolean;
    error?: boolean;
    errorDescription?: string;
    exceptions?: any;
    state?: TState;
    didInvalidate?: boolean;
    timestamp?: Date;
    elapsed?: number;
  }
  export type ActionFunctionAny<R> = (...args: any[]) => R;
  export interface Action<Payload = any, Meta = any> {
    type?: any;
    payload?: Payload;
    meta?: Meta;
    error?: boolean;
    timestamp?: Date;
  }
  export interface AsyncActions {
    started: string;
    failed: string;
    succeeded: string;
    ended: string;
    invalidated: string;
  }
  export interface BasicOptions<T = any> {
    defValue?: T;
    path?: string | PathResolver;
  }

  export interface Options<T = any> extends BasicOptions<T> {
    timestampAccessor?: (action: Action) => Date;
    payloadAccessor?: (action: Action) => T;
    pathResolver?: string | PathResolver;
  }
  export interface Duration {
    amount: number;
    unit: DurationUnitType;
  }
  export type DurationUnitType = "seconds" | "minutes" | "hours" | "days";
  export type PathResolver = (action: Action) => string;
}
