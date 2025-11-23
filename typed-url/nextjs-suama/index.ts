import { buildUrl } from './builder';
import type { NextjsSuamaRouteInput } from './builder';

const buildHref = (args: NextjsSuamaRouteInput) => buildUrl(args).href;
const buildPathname = (args: NextjsSuamaRouteInput) => buildUrl(args).pathname;

export const nextjs_suamaUrl = {
  build: buildUrl,
  href: buildHref,
  pathname: buildPathname,
};

export type { NextjsSuamaRoute, NextjsSuamaRouteInput, NextjsSuamaRouteSearchParamsMap } from './builder';
