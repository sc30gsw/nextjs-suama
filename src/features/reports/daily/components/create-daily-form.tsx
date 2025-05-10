'use client'

import { IconPencilBox, IconSend3 } from '@intentui/icons'
import { getLocalTimeZone, parseDate, today } from '@internationalized/date'
import { type JSX, type ReactNode, useState } from 'react'
import { Button } from '~/components/ui/intent-ui/button'
import { DatePicker } from '~/components/ui/intent-ui/date-picker'
import { Form } from '~/components/ui/intent-ui/form'
import { Separator } from '~/components/ui/intent-ui/separator'
import { TextField } from '~/components/ui/intent-ui/text-field'

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
