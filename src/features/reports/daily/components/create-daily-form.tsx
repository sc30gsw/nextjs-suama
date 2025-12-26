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
import type { Session } from 'better-auth'
import { type ComponentProps, use, useRef } from 'react'
import type { DateValue } from 'react-aria-components'
import { buttonStyles } from '~/components/ui/intent-ui/button'
import { Checkbox } from '~/components/ui/intent-ui/checkbox'
import { Form } from '~/components/ui/intent-ui/form'
import { Heading } from '~/components/ui/intent-ui/heading'
import { Keyboard } from '~/components/ui/intent-ui/keyboard'
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
import { CreateDailyReportContentInputEntries } from '~/features/reports/daily/components/create-daily-report-content-input-entries'
import { TroubleInputEntries } from '~/features/reports/daily/components/trouble-input-entries'
import { useCreateDailyForm } from '~/features/reports/daily/hooks/use-create-daily-report-form'
import { useDisabledDates } from '~/features/reports/daily/hooks/use-disabled-dates'
import { inputCountSearchParamsParsers } from '~/features/reports/daily/types/search-params/input-count-search-params-cache'
import { cn } from '~/utils/classes'

type CreateDailyFormProps = {
  userId: Session['userId']
  promises: Promise<
    [
      Awaited<ReturnType<typeof getProjects>>,
      Awaited<ReturnType<typeof getMissions>>,
      Awaited<ReturnType<typeof getAppealCategories>>,
      Awaited<ReturnType<typeof getTroubleCategories>>,
    ]
  >
}

export function CreateDailyForm({ userId, promises }: CreateDailyFormProps) {
  const [projectsResponse, missionsResponse, appealCategoriesResponse, troubleCategoriesResponse] =
    use(promises)

  const { isDateUnavailable, handleFocusChange, isLoading } = useDisabledDates({ userId })

  if (
    !projectsResponse ||
    !missionsResponse ||
    !appealCategoriesResponse ||
    !troubleCategoriesResponse
  ) {
    return null
  }

  const draftButtonRef = useRef<HTMLButtonElement>(null)
  const publishButtonRef = useRef<HTMLButtonElement>(null)

  const handleKeyDown: ComponentProps<'div'>['onKeyDown'] = (e) => {
    const target = e.target as HTMLElement

    if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT' || target.isContentEditable) {
      if (e.key === 'Enter' && target.tagName !== 'TEXTAREA' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()

        return
      }

      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'Enter') {
        e.preventDefault()
        draftButtonRef.current?.click()

        return
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        publishButtonRef.current?.click()
      }
    }
  }

  const {
    action,
    isPending,
    form,
    fields,
    reportDate,
    remoteInput,
    impressionInput,
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
    handleChangeAppealContent,
    handleChangeAppealCategory,
    handleChangeTroubleContent,
    handleChangeTroubleCategory,
    handleChangeRemote,
    handleChangeImpression,
    getError,
  } = useCreateDailyForm(inputCountSearchParamsParsers, {
    unResolvedTroubles: troubleCategoriesResponse.unResolvedTroubles,
    userId,
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
        <div onKeyDown={handleKeyDown} role="form" tabIndex={-1}>
          <Form className="space-y-2" action={action} {...getFormProps(form)}>
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
              isDateUnavailable={isDateUnavailable}
              onFocusChange={(date) => {
                if (date && typeof date !== 'boolean' && 'year' in date && 'month' in date) {
                  handleFocusChange((date as DateValue).year, (date as DateValue).month)
                }
              }}
              isLoading={isLoading}
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
              <CreateDailyReportContentInputEntries
                key={dailyReport.key}
                id={dailyReport.value?.id}
                formId={form.id}
                name={dailyReport.name}
                projects={projectsResponse.projects}
                missions={missionsResponse.missions}
                initialDailyInputCountSearchParamsParsers={inputCountSearchParamsParsers}
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
              <Checkbox
                {...getInputProps(fields.remote, { type: 'checkbox' })}
                isDisabled={isPending}
                size="lg"
                className="mt-2 cursor-pointer"
                isSelected={remoteInput.value === 'on'}
                onChange={handleChangeRemote}
              >
                <span className="ml-2">リモート勤務</span>
              </Checkbox>
              <TotalHours totalHours={totalHours} />
              <TextField
                {...getInputProps(fields.impression, { type: 'text' })}
                label="所感"
                isDisabled={isPending}
                value={impressionInput.value ?? ''}
                onChange={handleChangeImpression}
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
                  onChangeContent={isExisting ? undefined : handleChangeTroubleContent}
                  onChangeCategory={isExisting ? undefined : handleChangeTroubleCategory}
                />
              )
            })}

            {troubleEntries.length > 0 && (
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
            )}

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
                onChangeContent={handleChangeAppealContent}
                onChangeCategory={handleChangeAppealCategory}
              />
            ))}

            {appealEntries.length > 0 && (
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
            )}

            <Separator orientation="horizontal" />
            <div className="my-4 flex items-center justify-end gap-x-2">
              <Tooltip delay={0}>
                <Tooltip.Trigger
                  ref={draftButtonRef}
                  isDisabled={isPending}
                  type="submit"
                  className={cn(buttonStyles({ intent: 'outline' }))}
                  name="action"
                  value="draft"
                >
                  {isPending ? '下書き中...' : '下書き'}
                  {isPending ? <Loader /> : <IconPencilBox />}
                </Tooltip.Trigger>
                <Tooltip.Content>
                  <div className="flex items-center gap-2">
                    <Keyboard
                      keys={['Command(⌘)', '+', 'Shift(Shift)', '+', 'Enter(↵)']}
                      classNames={{ base: 'inline-flex' }}
                    />
                    <p className="text-muted-fg">/</p>
                    <Keyboard
                      keys={['Ctrl(⌃)', '+', 'Shift(⇧)', '+', 'Enter(↵)']}
                      classNames={{ base: 'inline-flex' }}
                    />
                  </div>
                </Tooltip.Content>
              </Tooltip>
              <Tooltip delay={0}>
                <Tooltip.Trigger
                  ref={publishButtonRef}
                  isDisabled={isPending}
                  className={cn(buttonStyles({ intent: 'primary' }))}
                  type="submit"
                  name="action"
                  value="published"
                >
                  {isPending ? '登録中...' : '登録'}
                  {isPending ? <Loader /> : <IconSend3 />}
                </Tooltip.Trigger>
                <Tooltip.Content>
                  <div className="flex items-center gap-2">
                    <Keyboard
                      keys={['Command(⌘)', '+', 'Enter(↵)']}
                      classNames={{ base: 'inline-flex' }}
                    />
                    <p className="text-muted-fg">/</p>
                    <Keyboard
                      keys={['Ctrl(⌃)', '+', 'Enter(↵)']}
                      classNames={{ base: 'inline-flex' }}
                    />
                  </div>
                </Tooltip.Content>
              </Tooltip>
            </div>
          </Form>
        </div>
      </FormProvider>
    </>
  )
}
