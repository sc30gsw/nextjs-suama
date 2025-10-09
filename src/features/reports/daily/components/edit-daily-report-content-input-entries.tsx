import { type FieldName, getInputProps } from '@conform-to/react'
import type { InferResponseType } from 'hono'
import type { JSX } from 'react'
import { useFormStatus } from 'react-dom'
import { filter, pipe } from 'remeda'
import { ComboBox } from '~/components/ui/intent-ui/combo-box'
import { NumberField } from '~/components/ui/intent-ui/number-field'
import { TextField } from '~/components/ui/intent-ui/text-field'
import { useEditDailyReportContentInputEntries } from '~/features/reports/daily/hooks/use-edit-daily-report-content-input-entries'
import type {
  UpdateDailyReportEntrySchema,
  UpdateDailyReportFormSchema,
} from '~/features/reports/daily/types/schemas/edit-daily-report-form-schema'
import type { client } from '~/lib/rpc'

type EditDailyReportContentInputEntriesProps = {
  id?: UpdateDailyReportEntrySchema['id']
  projects: InferResponseType<typeof client.api.projects.$get, 200>['projects']
  missions: InferResponseType<typeof client.api.missions.$get, 200>['missions']
  formId: string
  name: FieldName<UpdateDailyReportEntrySchema, UpdateDailyReportFormSchema>
  removeButton: JSX.Element
}

export function EditDailyReportContentInputEntries({
  id,
  projects,
  missions,
  formId,
  name,
  removeButton,
}: EditDailyReportContentInputEntriesProps) {
  const {
    field,
    hoursInput,
    contentInput,
    projectId,
    missionId,
    handleChangeItem,
    handleChangeValue,
  } = useEditDailyReportContentInputEntries(formId, name, projects)

  const { pending } = useFormStatus()

  return (
    <div className="mx-auto grid grid-cols-11 grid-rows-1 items-center gap-4 py-2">
      <input {...getInputProps(field.id, { type: 'hidden' })} />
      <div className="col-span-2">
        {/* // TODO useInputControl を使用して不具合が発生する場合、useControl を使用してみてください。 */}
        {/* // ? https://ja.conform.guide/integration/ui-libraries */}
        <ComboBox
          {...getInputProps(field.project, { type: 'text' })}
          label="プロジェクト"
          placeholder="プロジェクトを選択"
          onSelectionChange={(key) => {
            handleChangeItem(id ?? '', key, 'project')
          }}
          selectedKey={projectId}
          isDisabled={pending}
        >
          <ComboBox.Input />
          <ComboBox.List items={projects}>
            {(project) => <ComboBox.Option id={project.id}>{project.name}</ComboBox.Option>}
          </ComboBox.List>
        </ComboBox>
        <span id={field.project.errorId} className="text-red-500 text-sm">
          {field.project.errors}
        </span>
      </div>
      <div className="col-span-2">
        {/* // TODO useInputControl を使用して不具合が出る場合、useControl を使用してみてください。 */}
        {/* // ? https://ja.conform.guide/integration/ui-libraries */}
        <ComboBox
          {...getInputProps(field.mission, { type: 'text' })}
          label="ミッション"
          placeholder="ミッションを選択"
          onSelectionChange={(key) => {
            handleChangeItem(id ?? '', key, 'mission')
          }}
          selectedKey={missionId}
          isDisabled={pending}
        >
          <ComboBox.Input />
          <ComboBox.List
            items={
              projectId
                ? pipe(
                    missions,
                    filter((mission) => mission.projectId === projectId),
                  )
                : missions
            }
          >
            {(mission) => <ComboBox.Option id={mission.id}>{mission.name}</ComboBox.Option>}
          </ComboBox.List>
        </ComboBox>
        <span id={field.mission.errorId} className="text-red-500 text-sm">
          {field.mission.errors}
        </span>
      </div>
      <div className="col-span-2">
        <NumberField
          step={0.25}
          label="時間"
          value={Number(hoursInput.value)}
          onChange={(val) => handleChangeValue(id ?? '', val)}
          errorMessage={''}
          isDisabled={pending}
        />
        <span id={field.hours.errorId} className="text-red-500 text-sm">
          {field.hours.errors}
        </span>
      </div>
      <div className="col-span-4">
        <TextField
          {...getInputProps(field.content, { type: 'text' })}
          label="内容"
          placeholder="タスク内容を入力"
          value={contentInput.value}
          onChange={(val) => {
            handleChangeValue(id ?? '', val)
          }}
          isDisabled={pending}
          errorMessage={''}
        />
        <span id={field.content.errorId} className="text-red-500 text-sm">
          {field.content.errors}
        </span>
      </div>
      <div className="col-span-1">{removeButton}</div>
    </div>
  )
}
