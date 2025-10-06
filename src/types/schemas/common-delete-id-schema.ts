import { z } from 'zod'

export const commonDeleteIdSchema = z.object({
  id: z.string({ required_error: 'IDを入力してください' }),
})

export type CommonDeleteIdSchema = z.infer<typeof commonDeleteIdSchema>