'use client'
import { IconPencilBox, IconSend3 } from '@intentui/icons'
import { getLocalTimeZone, parseDate, today } from '@internationalized/date'
import { type JSX, type ReactNode, useState } from 'react'
import { Button } from '~/components/ui/intent-ui/button'
import { DatePicker } from '~/components/ui/intent-ui/date-picker'
import { Form } from '~/components/ui/intent-ui/form'
import { Separator } from '~/components/ui/intent-ui/separator'

type CreateDailyFormProps = {
  children: ReactNode
  troubles: JSX.Element
  appeals: JSX.Element
}

export function CreateDailyForm({
  children,
  troubles,
  appeals,
}: CreateDailyFormProps) {
  const now = today(getLocalTimeZone())

  const [value, setValue] = useState(parseDate(now.toString()))

  // ? format date
  // const day = value.toDate(getLocalTimeZone())

  return (
    <Form className="space-y-2">
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
      {troubles}
      <Separator orientation="horizontal" />
      {appeals}
      <Separator orientation="horizontal" />
      <div className="flex items-center justify-end gap-x-2 my-4">
        <Button intent="outline">
          下書き
          <IconPencilBox />
        </Button>
        <Button>
          登録
          <IconSend3 />
        </Button>
      </div>
    </Form>
  )
}
