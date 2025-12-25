'use server'

import { ERROR_STATUS } from '~/constants/error-message'
import { generateCsv } from '~/features/report-contexts/utils/csv-utils'
import { db } from '~/index'
import { getServerSession } from '~/lib/get-server-session'

export async function downloadMissionsCsvAction() {
  const session = await getServerSession()

  if (!session) {
    return {
      error: {
        message: [ERROR_STATUS.UNAUTHORIZED],
      },
    }
  }

  try {
    const allMissions = await db.query.missions.findMany({
      orderBy: (missionsTable, { asc }) => [asc(missionsTable.createdAt)],
    })

    const columns = [
      'id',
      'name',
      'likeKeywords',
      'projectId',
    ] as const satisfies readonly (keyof (typeof allMissions)[0])[]
    const csvString = generateCsv(allMissions, columns)

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
