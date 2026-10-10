import { Skeleton } from "@/components/ui/skeleton"

/** Placeholder for one member card while the list loads. */
export function MemberCardSkeleton() {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-4" aria-hidden="true">
      <Skeleton className="size-16 shrink-0 rounded-full" />
      <div className="flex flex-1 flex-col gap-2 pt-1">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-5/6" />
      </div>
    </div>
  )
}

export function MemberCardGridSkeleton({ count = 6, columns = "sm:grid-cols-2 lg:grid-cols-3" }: { count?: number; columns?: string }) {
  return (
    <div className={`grid gap-4 ${columns}`} role="status" aria-label="Betöltés">
      {Array.from({ length: count }, (_, i) => (
        <MemberCardSkeleton key={i} />
      ))}
    </div>
  )
}

/** Placeholder for the detailed profile page (members-only and public alike). */
export function MemberProfileSkeleton() {
  return (
    <div className="flex flex-col gap-8" role="status" aria-label="Betöltés">
      <Skeleton className="h-4 w-40" />
      <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        <Skeleton className="size-32 shrink-0 rounded-full" />
        <div className="flex w-full max-w-md flex-col gap-3">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  )
}
