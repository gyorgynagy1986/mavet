import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { MemberProfile } from "@/components/members/member-profile"
import { BOARD_PROFILE_PATH, MEMBER_DIRECTORY_PATH, loginPathWithReturn } from "@/lib/auth-paths"
import { canUseDirectory, getProfileFor, getViewer } from "@/lib/server/directory"
import { DirectoryRestricted } from "../restricted"

export const dynamic = "force-dynamic"
/** Members-only address: never indexed, and the title never carries a name. */
export const metadata: Metadata = { title: "Tagi profil", robots: { index: false, follow: false } }

export default async function MemberProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const viewer = await getViewer()
  const found = await getProfileFor(viewer, id)

  if (!found) {
    // The same answer for a missing, a hidden and a members-only profile.
    if (viewer.kind === "guest") redirect(loginPathWithReturn(`${MEMBER_DIRECTORY_PATH}/${encodeURIComponent(id)}`))
    if (!canUseDirectory(viewer)) return <DirectoryRestricted admin={viewer.kind === "admin"} />
    notFound()
  }

  // A board member's profile lives at its readable public address; old links land there.
  if (found.profile.href.startsWith(`${BOARD_PROFILE_PATH}/`)) redirect(found.profile.href)

  // Only reachable without the directory right if the profile is public but has no slug yet.
  const member = canUseDirectory(viewer)
  return <MemberProfile profile={found.profile} backHref={member ? MEMBER_DIRECTORY_PATH : "/a-tarsasagrol"} backLabel={member ? "Vissza a névjegyzékhez" : "A Társaságról"} />
}
