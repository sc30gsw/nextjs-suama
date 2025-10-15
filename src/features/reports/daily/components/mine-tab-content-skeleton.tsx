import { Card } from '~/components/ui/intent-ui/card'
import { Skeleton } from '~/components/ui/intent-ui/skeleton'

export function MineTabContentSkeleton() {
  return (
    <>
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-32" />
      </div>

      <div className="flex items-end justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-7 w-48" />
      </div>

      <Card className="max-w-full border-t-0 pt-0 ">
        <Card.Content>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-x-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ))}
            </div>
          </div>
        </Card.Content>

        <Card.Footer>
          <Skeleton className="h-10 w-full" />
        </Card.Footer>
      </Card>
    </>
  )
}
