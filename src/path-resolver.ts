import { Action, PathResolver } from "state";
import is from "ramda/es/is";

export const resolvePath = (path: string | PathResolver, action?: Action) =>
  is(Function, path) ? (path as Function)(action) : String(path);
export default resolvePath;
