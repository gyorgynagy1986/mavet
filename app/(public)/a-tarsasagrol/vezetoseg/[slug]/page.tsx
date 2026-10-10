import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { MemberProfile } from "@/components/members/member-profile"
import { ABOUT_PATH, BOARD_ANCHOR } from "@/lib/auth-paths"
import { getBoardProfileBySlug } from "@/lib/server/directory"

// Follows the member's visibility switch immediately (9.3).
export const dynamic = "force-dynamic"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const profile = await getBoardProfileBySlug(slug)
  if (!profile) return { title: "A Társaságról", robots: { index: false, follow: false } }
  return {
    title: profile.name,
    description: [profile.office, "Magyar Vidékegészségügyi Társaság"].filter(Boolean).join(" · "),
    alternates: { canonical: profile.href },
  }
}

/** Public profile of a board or committee member: admin designation and the member's own consent together. */
export default async function BoardProfilePage({ params }: Props) {
  const { slug } = await params
  const profile = await getBoardProfileBySlug(slug)
  if (!profile) notFound()
  return <MemberProfile profile={profile} backHref={`${ABOUT_PATH}#${BOARD_ANCHOR}`} backLabel="Vissza a vezetőséghez" />
}
