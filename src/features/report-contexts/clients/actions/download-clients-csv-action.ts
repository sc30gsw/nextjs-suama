'use server'

import { ERROR_STATUS } from '~/constants/error-message'
import { generateCsv } from '~/features/report-contexts/utils/csv-utils'
import { db } from '~/index'
import { getServerSession } from '~/lib/get-server-session'

export async function downloadClientsCsvAction() {
  const session = await getServerSession()

  if (!session) {
    return {
      error: {
        message: [ERROR_STATUS.UNAUTHORIZED],
      },
    }
  }

  try {
    const allClients = await db.query.clients.findMany({
      orderBy: (clientsTable, { asc }) => [asc(clientsTable.createdAt)],
    })

    const columns = [
      'id',
      'name',
      'likeKeywords',
    ] as const satisfies readonly (keyof (typeof allClients)[0])[]
    const csvString = generateCsv(allClients, columns)

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
