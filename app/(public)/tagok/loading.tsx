import { MemberCardGridSkeleton } from "@/components/members/member-skeletons"
import { PageHeader } from "@/components/page-header"
import { SiteContainer } from "@/components/site-container"
import { Skeleton } from "@/components/ui/skeleton"

export default function DirectoryLoading() {
  return (
    <>
      <PageHeader title="Tagi névjegyzék" description="A Társaság aktív tagjai, akik engedélyezték a megjelenésüket. A névjegyzéket csak bejelentkezett, aktív tagok látják." />
      <SiteContainer className="flex flex-col gap-6 py-10 sm:py-14">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-28" />
        </div>
        <Skeleton className="h-4 w-48" />
        <MemberCardGridSkeleton />
      </SiteContainer>
    </>
  )
}
