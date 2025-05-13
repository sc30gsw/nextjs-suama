import { up } from 'up-fetch'

export const upfetch = up(fetch, () => ({
  timeout: 30000,
}))

export const upfetchForDummy = up(fetch, () => ({
  baseUrl: 'https://dummyjson.com',
  timeout: 30000,
}))
