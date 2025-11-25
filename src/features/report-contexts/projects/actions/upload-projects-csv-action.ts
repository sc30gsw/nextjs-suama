'use server'

import { eq } from 'drizzle-orm'
import { revalidateTag } from 'next/cache'
import Papa from 'papaparse'
import { GET_PROJECTS_CACHE_KEY } from '~/constants/cache-keys'
import { ERROR_STATUS } from '~/constants/error-message'
import { clients, projects } from '~/db/schema'
import { CSV_ERROR_MESSAGES } from '~/features/report-contexts/constants/csv-error-messages'
import { uploadProjectCsvRowSchema } from '~/features/report-contexts/projects/types/schemas/upload-project-csv-schema'
import { csvFileSchema } from '~/features/report-contexts/types/schemas/csv-file-schema'
import { sanitizeKeywords } from '~/features/report-contexts/utils/sanitaize-keywords'
import { db } from '~/index'
import { getServerSession } from '~/lib/get-server-session'

type ProjectsInsert = typeof projects.$inferInsert

const REQUIRED_COLUMNS = ['name', 'likeKeywords', 'clientId'] as const satisfies ReadonlyArray<
  keyof ProjectsInsert
>
const ALLOWED_COLUMNS = [
  'id',
  'name',
  'likeKeywords',
  'clientId',
  'isArchived',
] as const satisfies ReadonlyArray<keyof ProjectsInsert>

export async function uploadProjectsCsvAction(_: unknown, formData: FormData) {
  const session = await getServerSession()

  if (!session) {
    return {
      error: {
        message: [ERROR_STATUS.UNAUTHORIZED],
      },
    }
  }

  const file = formData.get('file')
  const fileValidation = csvFileSchema.safeParse(file)

  if (!fileValidation.success) {
    return {
      error: {
        message: fileValidation.error.issues.map((issue) => issue.message),
      },
    }
  }

  const validatedFile = fileValidation.data

  try {
    const fileText = await validatedFile.text()

    return new Promise<{ error?: Record<'message', string[]>; success?: boolean }>((resolve) => {
      Papa.parse<Record<string, string>>(fileText, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          if (results.errors.length > 0) {
            resolve({
              error: {
                message: [`${CSV_ERROR_MESSAGES.PARSE_FAILED}: ${results.errors[0].message}`],
              },
            })

            return
          }

          const rows = results.data

          if (rows.length === 0) {
            resolve({
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
              error: {
                message: [`${CSV_ERROR_MESSAGES.MISSING_COLUMNS}: ${missingColumns.join(', ')}`],
              },
            })

            return
          }

          if (invalidColumns.length > 0) {
            resolve({
              error: {
                message: [`${CSV_ERROR_MESSAGES.INVALID_COLUMNS}: ${invalidColumns.join(', ')}`],
              },
            })

            return
          }

          try {
            await db.transaction(async (tx) => {
              for (let i = 0; i < rows.length; i++) {
                const row = rows[i]
                const rowNumber = i + 2

                const validationResult = uploadProjectCsvRowSchema.safeParse(row)

                if (!validationResult.success) {
                  const errors = validationResult.error.issues.map(
                    (err) => `${err.path.join('.')}: ${err.message}`,
                  )

                  throw new Error(`行${rowNumber}: ${errors.join(', ')}`)
                }

                const validatedData = validationResult.data
                const id = validatedData.id?.trim()
                const name = validatedData.name.trim()
                const likeKeywords = validatedData.likeKeywords || ''
                const clientId = validatedData.clientId.trim()
                const isArchived = validatedData.isArchived

                const client = await tx.query.clients.findFirst({
                  where: eq(clients.id, clientId),
                })

                if (!client) {
                  throw new Error(
                    `行${rowNumber}: clientId "${clientId}" に対応するクライアントが見つかりません`,
                  )
                }

                if (id) {
                  const existingProject = await tx.query.projects.findFirst({
                    where: eq(projects.id, id),
                  })

                  if (existingProject) {
                    await tx
                      .update(projects)
                      .set({
                        name,
                        likeKeywords: sanitizeKeywords(likeKeywords),
                        clientId,
                        isArchived,
                      })
                      .where(eq(projects.id, id))
                  } else {
                    await tx.insert(projects).values({
                      id,
                      name,
                      likeKeywords: sanitizeKeywords(likeKeywords),
                      clientId,
                      isArchived,
                    })
                  }
                } else {
                  await tx.insert(projects).values({
                    name,
                    likeKeywords: sanitizeKeywords(likeKeywords),
                    clientId,
                    isArchived,
                  })
                }
              }
            })

            revalidateTag(GET_PROJECTS_CACHE_KEY)

            resolve({
              success: true,
            })
          } catch (error) {
            resolve({
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
      error: {
        message: [error instanceof Error ? error.message : ERROR_STATUS.SOMETHING_WENT_WRONG],
      },
    }
  }
}
