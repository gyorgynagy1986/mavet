import { MemberProfileSkeleton } from "@/components/members/member-skeletons"
import { SiteContainer } from "@/components/site-container"

export default function MemberProfileLoading() {
  return (
    <SiteContainer className="max-w-3xl py-10 sm:py-14">
      <MemberProfileSkeleton />
    </SiteContainer>
  )
}
