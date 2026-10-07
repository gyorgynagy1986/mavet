import { Skeleton } from "@/components/ui/skeleton"

export default function AdminPostsLoading() {
  return (
    <div className="space-y-6" role="status" aria-label="Betöltés">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-9 w-56" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  )
}
