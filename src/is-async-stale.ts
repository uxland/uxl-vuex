import { addDays, addHours, addMinutes, addSeconds, isBefore, isValid } from "date-fns/esm";
import { getDefaultState } from "./create-async-mutation";
import { AsyncState, Duration } from "state";
import isNil from "ramda/es/isNil";
import equals from "ramda/es/equals";

const defaultState = getDefaultState();
const durationAdders = {
  seconds: addSeconds,
  minutes: addMinutes,
  hours: addHours,
  days: addDays
};
export const isAsyncStateStale = <T>(state: AsyncState<T>, staleInterval?: Duration): boolean => {
  if (isNil(state) || equals(state, defaultState)) return true;
  if (state.isFetching) return false;
  if (state.didInvalidate || state.error) return true;
  if (staleInterval && state.timestamp && isValid(state.timestamp))
    return isBefore(Date.now(), durationAdders[staleInterval.unit](state.timestamp, staleInterval.amount));
  return false;
};

export default isAsyncStateStale;
