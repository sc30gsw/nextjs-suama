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
import { use } from 'react'
import { Button, buttonStyles } from '~/components/ui/intent-ui/button'
import { Checkbox } from '~/components/ui/intent-ui/checkbox'
import { Form } from '~/components/ui/intent-ui/form'
import { Heading } from '~/components/ui/intent-ui/heading'
import { Loader } from '~/components/ui/intent-ui/loader'
import { Separator } from '~/components/ui/intent-ui/separator'
import { TextField } from '~/components/ui/intent-ui/text-field'
import { Tooltip } from '~/components/ui/intent-ui/tooltip'
import { JapaneseDatePicker } from '~/components/ui/japanese-date-picker'
import { getErrorMessage } from '~/constants/error-message'
import type { getAppealCategories } from '~/features/report-contexts/appeals/server/fetcher'
import type { getMissions } from '~/features/report-contexts/missions/server/fetcher'
import type { getProjects } from '~/features/report-contexts/projects/server/fetcher'
import type { getTroubleCategories } from '~/features/report-contexts/troubles/server/fetcher'
import { TotalHours } from '~/features/reports/components/total-hours'
import { AppealInputEntries } from '~/features/reports/daily/components/appeal-input-entries'
import { EditDailyReportContentInputEntries } from '~/features/reports/daily/components/edit-daily-report-content-input-entries'
import { TroubleInputEntries } from '~/features/reports/daily/components/trouble-input-entries'
import { useEditDailyForm } from '~/features/reports/daily/hooks/use-edit-daily-report-form'
import type { getDailyReportById } from '~/features/reports/daily/server/fetcher'
import { cn } from '~/utils/classes'

type EditDailyFormProps = {
  reportData: Awaited<ReturnType<typeof getDailyReportById>>
  promises: Promise<
    [
      Awaited<ReturnType<typeof getProjects>>,
      Awaited<ReturnType<typeof getMissions>>,
      Awaited<ReturnType<typeof getAppealCategories>>,
      Awaited<ReturnType<typeof getTroubleCategories>>,
    ]
  >
}

export function EditDailyForm({ reportData, promises }: EditDailyFormProps) {
  const [projectsResponse, missionsResponse, appealCategoriesResponse, troubleCategoriesResponse] =
    use(promises)

  const {
    action,
    isPending,
    form,
    fields,
    reportDate,
    remote,
    impression,
    dailyReports,
    appealEntries,
    troubleEntries,
    totalHours,
    handleAdd,
    handleRemove,
    handleAddAppeal,
    handleRemoveAppeal,
    handleAddTrouble,
    handleRemoveTrouble,
    getError,
  } = useEditDailyForm(reportData, {
    unResolvedTroubles: troubleCategoriesResponse.unResolvedTroubles,
  })

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
            <p>
              {getErrorMessage('daily-report', getError() as Parameters<typeof getErrorMessage>[1])}
            </p>
          </div>
        )}
      </div>
      <FormProvider context={form.context}>
        <Form className="space-y-2" action={action} {...getFormProps(form)}>
          <input {...getInputProps(fields.reportId, { type: 'hidden' })} />
          {/* // ? useInputControlでは値が反映されない不具合のため、useControlを使用 */}
          {/* // ? https://ja.conform.guide/integration/ui-libraries */}
          <JapaneseDatePicker
            isDisabled={isPending}
            value={reportDate.value ? parseDate(reportDate.value) : null}
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

          <Tooltip delay={0}>
            <Tooltip.Trigger
              className={cn(buttonStyles({ size: 'sq-sm', isCircle: true }), 'mt-4')}
              onPress={handleAdd}
              isDisabled={isPending}
            >
              <IconPlus />
            </Tooltip.Trigger>
            <Tooltip.Content>職務内容を追加</Tooltip.Content>
          </Tooltip>

          {dailyReports.map((dailyReport) => (
            <EditDailyReportContentInputEntries
              key={dailyReport.key}
              id={dailyReport.value?.id}
              formId={form.id}
              name={dailyReport.name}
              projects={projectsResponse.projects}
              missions={missionsResponse.missions}
              removeButton={
                <Tooltip delay={0}>
                  <Tooltip.Trigger
                    className={cn(
                      buttonStyles({ size: 'sq-sm', intent: 'danger', isCircle: true }),
                      'mt-6',
                    )}
                    onPress={() => {
                      handleRemove(dailyReport.getFieldset().id.value ?? '')
                    }}
                    isDisabled={isPending}
                  >
                    <IconMinus />
                  </Tooltip.Trigger>
                  <Tooltip.Content>職務内容を削除</Tooltip.Content>
                </Tooltip>
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
              value={impression.value ?? ''}
              onChange={(val) => impression.change(val)}
            />
          </div>

          <Separator orientation="horizontal" />
          <div className="mt-4 flex items-center">
            <Heading level={3}>困っていること</Heading>
          </div>

          <Tooltip delay={0}>
            <Tooltip.Trigger
              className={cn(buttonStyles({ size: 'sq-sm', isCircle: true }), 'mt-4')}
              onPress={handleAddTrouble}
              isDisabled={isPending}
            >
              <IconPlus />
            </Tooltip.Trigger>
            <Tooltip.Content>困っていることを追加</Tooltip.Content>
          </Tooltip>

          {troubleEntries.map((trouble, index) => {
            const isExisting = trouble.value?.isExisting === 'on'

            return (
              <TroubleInputEntries
                key={trouble.key}
                formId={form.id}
                name={trouble.name}
                categories={troubleCategoriesResponse.troubleCategories}
                isExisting={isExisting}
                onRemove={isExisting ? undefined : () => handleRemoveTrouble(index)}
              />
            )
          })}

          <Separator orientation="horizontal" />
          <div className="mt-4 flex items-center">
            <Heading level={3}>アピールポイント</Heading>
          </div>
          <Tooltip delay={0}>
            <Tooltip.Trigger
              className={cn(buttonStyles({ size: 'sq-sm', isCircle: true }), 'mt-4')}
              onPress={handleAddAppeal}
              isDisabled={isPending}
            >
              <IconPlus />
            </Tooltip.Trigger>
            <Tooltip.Content>アピールポイントを追加</Tooltip.Content>
          </Tooltip>

          {appealEntries.map((appeal, index) => (
            <AppealInputEntries
              key={appeal.key}
              formId={form.id}
              name={appeal.name}
              categories={appealCategoriesResponse.appealCategories}
              onRemove={() => handleRemoveAppeal(index)}
            />
          ))}

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
