'use server'

import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { dailyReports } from '~/db/schema'
import { db } from '~/index'
import { getServerSession } from '~/lib/get-server-session'

export async function publishDraftAction(reportId: string) {
  const session = await getServerSession()

  if (!session) {
    throw new Error('Unauthorized')
  }

  try {
    // 既存のレポートを確認（自分のものか確認）
    const existingReport = await db.query.dailyReports.findFirst({
      where: and(eq(dailyReports.id, reportId), eq(dailyReports.userId, session.user.id)),
    })

    if (!existingReport) {
      throw new Error('レポートが見つからないか、編集権限がありません')
    }

    if (existingReport.release) {
      throw new Error('このレポートは既に公開済みです')
    }

    // 下書きを公開状態に更新
    await db
      .update(dailyReports)
      .set({
        release: true,
        updatedAt: new Date(),
      })
      .where(eq(dailyReports.id, reportId))

    // 関連ページのキャッシュを無効化
    revalidatePath('/daily/mine')
    revalidatePath('/daily/today')

    return { success: true }
  } catch (error) {
    console.error('Publish draft error:', error)
    throw error
  }
}