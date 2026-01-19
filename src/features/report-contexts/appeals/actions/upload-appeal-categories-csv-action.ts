'use server'

import type { SubmissionResult } from '@conform-to/react'
import { eq } from 'drizzle-orm'
import { updateTag } from 'next/cache'
import Papa from 'papaparse'
import { GET_APPEAL_CATEGORIES_CACHE_KEY } from '~/constants/cache-keys'
import { ERROR_STATUS } from '~/constants/error-message'
import { categoryOfAppeals } from '~/db/schema'
import { uploadAppealCategoryCsvRowSchema } from '~/features/report-contexts/appeals/types/schemas/upload-appeal-category-csv-schema'
import { CSV_ERROR_MESSAGES } from '~/features/report-contexts/constants/csv-error-messages'
import { csvFileSchema } from '~/features/report-contexts/types/schemas/csv-file-schema'
import { getDb } from '~/index'
import { getServerSession } from '~/lib/get-server-session'

type CategoryOfAppealsInsert = typeof categoryOfAppeals.$inferInsert

const REQUIRED_COLUMNS = ['name'] as const satisfies ReadonlyArray<keyof CategoryOfAppealsInsert>
const ALLOWED_COLUMNS = ['id', 'name'] as const satisfies ReadonlyArray<
  keyof CategoryOfAppealsInsert
>

export async function uploadAppealCategoriesCsvAction(
  _: unknown,
  formData: FormData,
): Promise<SubmissionResult<string[]>> {
  const session = await getServerSession()

  if (!session) {
    return {
      status: 'error',
      error: {
        message: [ERROR_STATUS.UNAUTHORIZED],
      },
    }
  }

  const file = formData.get('file')
  const fileValidation = csvFileSchema.safeParse(file)

  if (!fileValidation.success) {
    return {
      status: 'error',
      error: {
        message: fileValidation.error.issues.map((issue) => issue.message),
      },
    }
  }

  const validatedFile = fileValidation.data

  try {
    const fileText = await validatedFile.text()

    return new Promise<SubmissionResult<string[]>>((resolve) => {
      Papa.parse<Record<string, string>>(fileText, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          if (results.errors.length > 0) {
            resolve({
              status: 'error',
              error: {
                message: [CSV_ERROR_MESSAGES.PARSE_FAILED],
              },
            })

            return
          }

          const rows = results.data

          if (rows.length === 0) {
            resolve({
              status: 'error',
              error: {
                message: [CSV_ERROR_MESSAGES.NO_DATA],
              },
            })

            return
          }

          const firstRow = rows[0]
          const csvColumns = Object.keys(firstRow)
          const missingColumns = REQUIRED_COLUMNS.filter((col) => !csvColumns.includes(col))
          const invalidColumns = csvColumns.filter(
            (col) => !ALLOWED_COLUMNS.includes(col as (typeof ALLOWED_COLUMNS)[number]),
          )

          if (missingColumns.length > 0) {
            resolve({
              status: 'error',
              error: {
                message: [`${CSV_ERROR_MESSAGES.MISSING_COLUMNS}: ${missingColumns.join(', ')}`],
              },
            })

            return
          }

          if (invalidColumns.length > 0) {
            resolve({
              status: 'error',
              error: {
                message: [`${CSV_ERROR_MESSAGES.INVALID_COLUMNS}: ${invalidColumns.join(', ')}`],
              },
            })

            return
          }

          try {
            const db = getDb()
            await db.transaction(async (tx) => {
              for (let i = 0; i < rows.length; i++) {
                const row = rows[i]
                const rowNumber = i + 2

                const validationResult = uploadAppealCategoryCsvRowSchema.safeParse(row)

                if (!validationResult.success) {
                  const errors = validationResult.error.issues.map(
                    (err) => `${err.path.join('.')}: ${err.message}`,
                  )
                  throw new Error(`行${rowNumber}: ${errors.join(', ')}`)
                }

                const validatedData = validationResult.data
                const id = validatedData.id?.trim()
                const name = validatedData.name.trim()

                if (id) {
                  const existingCategory = await tx.query.categoryOfAppeals.findFirst({
                    where: eq(categoryOfAppeals.id, id),
                  })

                  if (existingCategory) {
                    await tx
                      .update(categoryOfAppeals)
                      .set({
                        name,
                      })
                      .where(eq(categoryOfAppeals.id, id))
                  } else {
                    await tx.insert(categoryOfAppeals).values({
                      id,
                      name,
                    })
                  }
                } else {
                  await tx.insert(categoryOfAppeals).values({
                    name,
                  })
                }
              }
            })

            updateTag(GET_APPEAL_CATEGORIES_CACHE_KEY)

            resolve({
              status: 'success',
            })
          } catch (error) {
            resolve({
              status: 'error',
              error: {
                message: [
                  error instanceof Error ? error.message : CSV_ERROR_MESSAGES.REGISTRATION_FAILED,
                ],
              },
            })
          }
        },
      })
    })
  } catch (error) {
    return {
      status: 'error',
      error: {
        message: [error instanceof Error ? error.message : ERROR_STATUS.SOMETHING_WENT_WRONG],
      },
    }
  }
}
