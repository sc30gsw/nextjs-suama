import { Heading } from '~/components/ui/intent-ui/heading'

export function TotalHours({ totalHours }: Record<'totalHours', number>) {
  return (
    <div className="my-4 flex items-center gap-x-2">
      <span className="text-sm">合計時間:</span>
      <Heading className="text-lg text-muted-fg">{totalHours}時間</Heading>
    </div>
  )
}
