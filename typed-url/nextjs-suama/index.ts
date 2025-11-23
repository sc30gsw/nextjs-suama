import type { NextjsSuamaRouteInput } from './builder'
import { buildUrl } from './builder'

const buildHref = (args: NextjsSuamaRouteInput) => buildUrl(args).href
const buildPathname = (args: NextjsSuamaRouteInput) => buildUrl(args).pathname

export const nextjs_suamaUrl = {
  build: buildUrl,
  href: buildHref,
  pathname: buildPathname,
} as const satisfies Record<string, typeof buildUrl | typeof buildHref | typeof buildPathname>

export type {
  NextjsSuamaRoute,
  NextjsSuamaRouteInput,
  NextjsSuamaRouteSearchParamsMap,
} from './builder'
