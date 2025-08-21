import { IconChevronLgDown } from '@intentui/icons'
import { Loader } from '~/components/ui/intent-ui/loader'
import { ShowMore } from '~/components/ui/intent-ui/show-more'

type LoadMoreButtonProps = {
  context: {
    loadMore: () => void
    loading: boolean
    canLoadMore: boolean
  }
}

export function LoadMoreButton({
  context: { loadMore, loading, canLoadMore },
}: LoadMoreButtonProps) {
  return (
    <div className="py-6">
      <ShowMore onPress={loadMore} isDisabled={!canLoadMore}>
        {loading ? '読み込み中...' : 'もっと見る'}
        {loading ? <Loader /> : <IconChevronLgDown className="size-4" />}
      </ShowMore>
    </div>
  )
}
