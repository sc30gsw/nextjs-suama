import { IconTrashEmpty } from '@intentui/icons'
import type { InferResponseType } from 'hono'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/ui/intent-ui/button'
import { Loader } from '~/components/ui/intent-ui/loader'
import { deleteProjectAction } from '~/features/report-contexts/projects/actions/delete-project-action'
import { Confirm } from '~/hooks/use-confirm'
import type { client } from '~/lib/rpc'

type ProjectDeleteButtonProps = Pick<
  InferResponseType<typeof client.api.projects.$get, 200>['projects'][number],
  'id'
>

export function ProjectDeleteButton({ id }: ProjectDeleteButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = async () => {
    const ok = await Confirm.call({
      title: 'プロジェクトを削除しますか?',
      message:
        'この操作は取り消せません。プロジェクトを削除すると、関連するミッションも削除されます。',
    })

    if (!ok) {
      return
    }

    startTransition(async () => {
      try {
        const result = await deleteProjectAction(id)

        if (result.status === 'error') {
          toast.error('プロジェクトの削除に失敗しました')
          return
        }

        toast.success('プロジェクトの削除に成功しました')
      } catch (_) {
        toast.error('プロジェクトの削除に失敗しました')
      }
    })
  }

  return (
    <Button intent="danger" size="small" isDisabled={isPending} onPress={handleDelete}>
      削除
      {isPending ? <Loader /> : <IconTrashEmpty />}
    </Button>
  )
}
