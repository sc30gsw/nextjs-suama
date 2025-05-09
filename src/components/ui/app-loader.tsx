import { Loader } from '~/components/ui/intent-ui/loader'

export function AppLoader() {
  return (
    <div className="flex items-center justify-center h-full">
      <Loader variant="ring" size="large" />
    </div>
  )
}
