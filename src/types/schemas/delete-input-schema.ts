import { z } from 'zod'

export const deleteInputSchema = z.object({
  id: z.string({ required_error: 'IDを入力してください' }),
})

export type DeleteInputSchema = z.infer<typeof deleteInputSchema>