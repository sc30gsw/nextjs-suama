'use client'

import { IconPencilBox, IconSend3 } from '@intentui/icons'
import { getLocalTimeZone, parseDate, today } from '@internationalized/date'
import { type JSX, type ReactNode, useActionState, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/ui/intent-ui/button'
import { DatePicker } from '~/components/ui/intent-ui/date-picker'
import { Form } from '~/components/ui/intent-ui/form'
import { Separator } from '~/components/ui/intent-ui/separator'
import { TextField } from '~/components/ui/intent-ui/text-field'
import { createReportAction } from '~/features/reports/daily/actions/create-report-action'
import { withCallbacks } from '~/utils/with-callbacks'

type CreateDailyFormProps = {
  children: ReactNode
  troubleHeadings: JSX.Element
  troubles: JSX.Element
  appealHeadings: JSX.Element
  appeals: JSX.Element
}

export function CreateDailyForm({
  children,
  troubleHeadings,
  troubles,
  appealHeadings,
  appeals,
}: CreateDailyFormProps) {
  const now = today(getLocalTimeZone())

  const [value, setValue] = useState(parseDate(now.toString()))

  // ? format date
  // const day = value.toDate(getLocalTimeZone())

  const [_, action, isPending] = useActionState(
    withCallbacks(createReportAction, {
      onSuccess() {
        toast.success('日報を作成しました')
      },
      onError() {
        toast.error('日報の作成に失敗しました')
      },
    }),
    null,
  )

  // const [form, fields] = useSafeForm<DailyReportFormSchema>({
  //   constraint: getZodConstraint(dailyReportFormSchema),
  //   lastResult,
  //   onValidate({ formData }) {
  //     return parseWithZod(formData, { schema: dailyReportFormSchema })
  //   },
  //   defaultValue: {
  //     reportDate: value.toDate(getLocalTimeZone()),
  //     workContent: '',
  //     hours: 0,
  //     appeal: '',
  //     trouble: '',
  //   },
  // })

  return (
    <Form className="space-y-2" action={action}>
      <DatePicker
        value={value}
        onChange={(newValue) => {
          if (newValue) {
            setValue(newValue)
          }
        }}
        label="日付"
        className="max-w-3xs"
      />
      {children}
      <Separator orientation="horizontal" />
      <div className="my-4">
        <TextField label="所感" />
      </div>
      <Separator orientation="horizontal" />
      {troubleHeadings}
      {troubles}
      <Separator orientation="horizontal" />
      {appealHeadings}
      {appeals}
      <Separator orientation="horizontal" />
      <div className="flex items-center justify-end gap-x-2 my-4">
        <Button
          isDisabled={isPending}
          type="submit"
          intent="outline"
          name="action"
          value="draft"
        >
          下書き
          <IconPencilBox />
        </Button>
        <Button
          isDisabled={isPending}
          type="submit"
          name="action"
          value="published"
        >
          登録
          <IconSend3 />
        </Button>
      </div>
    </Form>
  )
}
