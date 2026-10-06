import { SiteContainer } from "@/components/site-container"
import { Skeleton } from "@/components/ui/skeleton"
import { AccountNav } from "./account-nav"

/** Shown instantly on navigation to any account page while the server renders it. */
export default function AccountLoading() {
  return (
    <SiteContainer className="flex max-w-4xl flex-col gap-6 py-12 sm:py-16">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-32" />
      </header>
      <AccountNav />
      <div className="flex flex-col gap-6" role="status" aria-label="Betöltés">
        <Skeleton className="h-20 w-full rounded-xl" />
        <div className="rounded-xl border border-border p-6">
          <Skeleton className="mb-4 h-5 w-40" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </SiteContainer>
  )
}
