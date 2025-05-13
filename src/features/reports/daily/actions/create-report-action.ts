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
  // biome-ignore lint/suspicious/noConsoleLog: This is a sample code
  // biome-ignore lint/suspicious/noConsole: This is a sample code
  console.log('🚀 ~ createReportAction ~ formData:', status)
  return {} as const satisfies SubmissionResult
}
