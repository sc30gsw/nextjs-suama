'use server'

import type { SubmissionResult } from '@conform-to/react'

export async function createReportAction(_: unknown, formData: FormData) {
  const actionType = formData.get('action')

  if (!actionType) {
    return {} as const satisfies SubmissionResult
    // return submission.reply({
    //   fieldErrors: {
    //     message: ['エラーが発生しました'],
    //   },
    // })
  }

  const status = actionType === 'draft' ? 'draft' : 'published'
  console.log('🚀 ~ createReportAction ~ formData:', status)
  return {} as const satisfies SubmissionResult
}
