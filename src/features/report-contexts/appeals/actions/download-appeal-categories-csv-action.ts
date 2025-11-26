'use server'

import { ERROR_STATUS } from '~/constants/error-message'
import { generateCsv } from '~/features/report-contexts/utils/csv-utils'
import { db } from '~/index'
import { getServerSession } from '~/lib/get-server-session'

export async function downloadAppealCategoriesCsvAction() {
  const session = await getServerSession()

  if (!session) {
    return {
      error: {
        message: [ERROR_STATUS.UNAUTHORIZED],
      },
    }
  }

  try {
    const allCategories = await db.query.categoryOfAppeals.findMany({
      orderBy: (categoryOfAppealsTable, { asc }) => [asc(categoryOfAppealsTable.createdAt)],
    })

    const columns = ['id', 'name'] as const satisfies readonly (keyof (typeof allCategories)[0])[]
    const csvString = generateCsv(allCategories, columns)

    return {
      success: true,
      csv: csvString,
    }
  } catch (_) {
    return {
      error: {
        message: [ERROR_STATUS.SOMETHING_WENT_WRONG],
      },
    }
  }
}
