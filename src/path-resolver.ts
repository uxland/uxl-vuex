import is from "ramda/es/is";
import { Action } from "./create-action";

export type PathResolver = (action: Action) => string;

export const resolvePath = (path: string | PathResolver, action?: Action) =>
  is(Function, path) ? (path as Function)(action) : String(path);
export default resolvePath;
