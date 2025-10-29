import { swaggerUI } from '@hono/swagger-ui'
import { OpenAPIHono } from '@hono/zod-openapi'
import { Scalar } from '@scalar/hono-api-reference'
import { handle } from 'hono/vercel'
import { env } from '~/env'
import { appealApi } from '~/features/report-contexts/appeals/api/route'
import { clientApi } from '~/features/report-contexts/clients/api/route'
import { missionApi } from '~/features/report-contexts/missions/api/route'
import { projectApi } from '~/features/report-contexts/projects/api/route'
import { troubleApi } from '~/features/report-contexts/troubles/api/route'
import { dailyApi } from '~/features/reports/daily/api/route'
import { weeklyApi } from '~/features/reports/weekly/api/route'
import { userApi } from '~/features/users/api/route'

export const runtime = 'edge'

const app = new OpenAPIHono().basePath('/api')

const route = app
  .route('/dailies', dailyApi)
  .route('/weeklies', weeklyApi)
  .route('/clients', clientApi)
  .route('/projects', projectApi)
  .route('/missions', missionApi)
  .route('/troubles', troubleApi)
  .route('/appeals', appealApi)
  .route('/users', userApi)

route.doc('/doc', {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'SUAMA that is Work Hours Management & Reporting System API',
    description:
      '業務時間管理・報告システムのREST API仕様です。日報・週報の管理、プロジェクト・ミッション・トラブルの記録などの機能を提供します。',
  },
  servers: [
    {
      url: env.NEXT_PUBLIC_APP_URL,
      description: 'Development server',
    },
  ],
  tags: [
    { name: 'Users', description: 'ユーザー管理' },
    { name: 'Daily Reports', description: '日報管理' },
    { name: 'Weekly Reports', description: '週報管理' },
    { name: 'Projects', description: 'プロジェクト管理' },
    { name: 'Missions', description: 'ミッション管理' },
    { name: 'Clients', description: 'クライアント管理' },
    { name: 'Troubles', description: 'トラブル管理' },
    { name: 'Appeals', description: 'アピール管理' },
  ],
})

route.get('/scalar', Scalar({ url: '/api/doc' }))
route.get('/swagger', swaggerUI({ url: '/api/doc' }))

export type AppType = typeof route

export const GET = handle(route)
export const POST = handle(route)
export const PUT = handle(route)
export const PATCH = handle(route)
export const DELETE = handle(route)
