import { Loader } from '~/components/ui/intent-ui/loader'

export function AppLoader() {
  return (
    <div className="flex h-full items-center justify-center">
      <Loader variant="ring" size="large" />
    </div>
  )
}
