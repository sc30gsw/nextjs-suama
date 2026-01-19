import { treaty } from '@elysiajs/eden'
import { app } from '~/app/api/[[...route]]/route'
import { env } from '~/env'
import type { app as App } from '~/app/api/[[...route]]/route'

export const api =
  typeof window === 'undefined' ? treaty(app).api : treaty<typeof App>(env.NEXT_PUBLIC_APP_URL).api
