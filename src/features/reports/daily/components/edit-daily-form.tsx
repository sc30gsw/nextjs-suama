'use client'

import { FormProvider, getFormProps, getInputProps } from '@conform-to/react'
import {
  IconMinus,
  IconPencilBox,
  IconPlus,
  IconSend3,
  IconTriangleExclamation,
} from '@intentui/icons'
import { parseDate } from '@internationalized/date'
import { format } from 'date-fns'
import { type JSX, use } from 'react'
import { Button } from '~/components/ui/intent-ui/button'
import { Checkbox } from '~/components/ui/intent-ui/checkbox'
import { DatePicker } from '~/components/ui/intent-ui/date-picker'
import { Form } from '~/components/ui/intent-ui/form'
import { Loader } from '~/components/ui/intent-ui/loader'
import { Separator } from '~/components/ui/intent-ui/separator'
import { TextField } from '~/components/ui/intent-ui/text-field'
import type { getMissions } from '~/features/report-contexts/missions/server/fetcher'
import type { getProjects } from '~/features/report-contexts/projects/server/fetcher'
import { TotalHours } from '~/features/reports/components/total-hours'
import { EditDailyReportContentInputEntries } from '~/features/reports/daily/components/edit-daily-report-content-input-entries'
import { useEditDailyForm } from '~/features/reports/daily/hooks/use-edit-daily-report-form'
import type { getDailyReportById } from '~/features/reports/daily/server/fetcher'
import { DATE_FORMAT } from '~/utils/date-utils'

type EditDailyFormProps = {
  reportData: Awaited<ReturnType<typeof getDailyReportById>>
  promises: Promise<
    [Awaited<ReturnType<typeof getProjects>>, Awaited<ReturnType<typeof getMissions>>]
  >
  troubleHeadings: JSX.Element
  troubles: JSX.Element
  appealHeadings: JSX.Element
  appeals: JSX.Element
}

export function EditDailyForm({
  reportData,
  promises,
  troubleHeadings,
  troubles,
  appealHeadings,
  appeals,
}: EditDailyFormProps) {
  const [projectsResponse, missionsResponse] = use(promises)

  const {
    action,
    isPending,
    form,
    fields,
    reportDate,
    remote,
    dailyReports,
    totalHours,
    handleAdd,
    handleRemove,
    getError,
  } = useEditDailyForm(reportData)

  return (
    <>
      <div className="space-y-2">
        {fields.reportEntries.errors && (
          <div className="flex items-center gap-x-2 rounded-md bg-danger/15 p-3 text-danger text-sm">
            <IconTriangleExclamation className="size-4" />
            <p>{fields.reportEntries.errors}</p>
          </div>
        )}
        {getError() && (
          <div className="flex items-center gap-x-2 rounded-md bg-danger/15 p-3 text-danger text-sm">
            <IconTriangleExclamation className="size-4" />
            <p>{getError()}</p>
          </div>
        )}
      </div>
      <FormProvider context={form.context}>
        <Form className="space-y-2" action={action} {...getFormProps(form)}>
          <input {...getInputProps(fields.reportId, { type: 'hidden' })} />
          {/* // ? useInputControlでは値が反映されない不具合のため、useControlを使用 */}
          {/* // ? https://ja.conform.guide/integration/ui-libraries */}
          <DatePicker
            isDisabled={isPending}
            value={parseDate(reportDate.value ?? format(new Date(), DATE_FORMAT))}
            onChange={(newValue) => {
              if (newValue) {
                reportDate.change(newValue.toString())
              }
            }}
            label="日付"
            className="max-w-3xs"
          />
          <input
            ref={reportDate.register}
            name={fields.reportDate.name}
            type="hidden"
            disabled={isPending}
          />

          <Button
            size="sq-sm"
            onPress={handleAdd}
            className="mt-4 rounded-full"
            isDisabled={isPending}
          >
            <IconPlus />
          </Button>

          {dailyReports.map((dailyReport) => (
            <EditDailyReportContentInputEntries
              key={dailyReport.key}
              id={dailyReport.value?.id}
              formId={form.id}
              name={dailyReport.name}
              projects={projectsResponse.projects}
              missions={missionsResponse.missions}
              removeButton={
                <Button
                  size="sq-sm"
                  intent="danger"
                  onPress={() => {
                    handleRemove(dailyReport.getFieldset().id.value ?? '')
                  }}
                  isDisabled={isPending}
                  className="mt-6 rounded-full"
                >
                  <IconMinus />
                </Button>
              }
            />
          ))}

          <Separator orientation="horizontal" />
          <div className="my-4 space-y-2">
            {/* // ? useInputControlでは値が反映されない不具合のため、useControlを使用 */}
            {/* // ? https://ja.conform.guide/integration/ui-libraries */}
            <Checkbox
              name={fields.remote.name}
              isSelected={remote.value === 'on'}
              onChange={(checked) => remote.change(checked ? 'on' : '')}
              onFocus={remote.focus}
              onBlur={remote.blur}
              isDisabled={isPending}
              size="lg"
              className="mt-2 cursor-pointer"
            >
              <span className="ml-2">リモート勤務</span>
            </Checkbox>
            <TotalHours totalHours={totalHours} />
            <TextField
              {...getInputProps(fields.impression, { type: 'text' })}
              label="所感"
              isDisabled={isPending}
            />
          </div>
          <Separator orientation="horizontal" />
          {troubleHeadings}
          {troubles}
          <Separator orientation="horizontal" />
          {appealHeadings}
          {appeals}
          <Separator orientation="horizontal" />
          <div className="my-4 flex items-center justify-end gap-x-2">
            <Button
              isDisabled={isPending}
              type="submit"
              intent="outline"
              name="action"
              value="draft"
            >
              {isPending ? '更新中...' : '下書き保存'}
              {isPending ? <Loader /> : <IconPencilBox />}
            </Button>
            <Button isDisabled={isPending} type="submit" name="action" value="published">
              {isPending ? '更新中...' : '公開'}
              {isPending ? <Loader /> : <IconSend3 />}
            </Button>
          </div>
        </Form>
      </FormProvider>
    </>
  )
}
