import { Heading } from '~/components/ui/intent-ui/heading'

export function TotalHours({ totalHours }: Record<'totalHours', number>) {
  return (
    <div className="flex items-center gap-x-2 my-4">
      <span className="text-sm">合計時間:</span>
      <Heading className="text-muted-fg text-lg">{totalHours}時間</Heading>
    </div>
  )
}
