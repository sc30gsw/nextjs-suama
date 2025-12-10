import * as z from 'zod/v4'

export const confirmInputSchema = (expectedInput: string) =>
  z
    .object({
      input: z.string({ error: '入力は必須です' }),
    })
    .refine((data) => data.input === expectedInput, {
      error: `"${expectedInput}" と正確に入力してください`,
    })

export type ConfirmInputSchema = z.infer<typeof confirmInputSchema>
