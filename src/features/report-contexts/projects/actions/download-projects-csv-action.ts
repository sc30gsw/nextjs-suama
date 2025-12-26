'use server'

import { ERROR_STATUS } from '~/constants/error-message'
import { generateCsv } from '~/features/report-contexts/utils/csv-utils'
import { getDb } from '~/index'
import { getServerSession } from '~/lib/get-server-session'

export async function downloadProjectsCsvAction() {
  const session = await getServerSession()

  if (!session) {
    return {
      error: {
        message: [ERROR_STATUS.UNAUTHORIZED],
      },
    }
  }

  try {
    const db = getDb()
    const allProjects = await db.query.projects.findMany({
      orderBy: (projectsTable, { asc }) => [asc(projectsTable.createdAt)],
    })

    const columns = [
      'id',
      'name',
      'likeKeywords',
      'clientId',
      'isArchived',
    ] as const satisfies readonly (keyof (typeof allProjects)[0])[]

    const csvString = generateCsv(allProjects, columns)

    return {
      success: true,
      csv: csvString,
    }
  } catch {
    return {
      error: {
        message: [ERROR_STATUS.SOMETHING_WENT_WRONG],
      },
    }
  }
}
