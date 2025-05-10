'use client'
import { getLocalTimeZone, parseDate, today } from '@internationalized/date'
import { type ReactNode, useState } from 'react'
import { DatePicker } from '~/components/ui/intent-ui/date-picker'
import { Form } from '~/components/ui/intent-ui/form'

export function CreateDailyForm({ children }: { children: ReactNode }) {
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
    </Form>
  )
}
