import * as z from 'zod/v4'

export const csvFileSchema = z
  .instanceof(File, {
    error: 'CSVファイルが選択されていません',
  })
  .refine((file) => file.name.toLowerCase().endsWith('.csv'), {
    error: 'CSVファイルのみアップロード可能です',
  })

export type CsvFileSchema = z.infer<typeof csvFileSchema>
