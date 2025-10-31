import * as z from 'zod/v4'

export const commonDeleteIdSchema = z.object({
  id: z.string({ error: 'IDを入力してください' }),
})

export type CommonDeleteIdSchema = z.infer<typeof commonDeleteIdSchema>
