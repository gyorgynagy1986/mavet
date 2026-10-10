import { MemberCard } from "@/components/members/member-card"
import { MemberCardGridSkeleton } from "@/components/members/member-skeletons"
import { BOARD_ANCHOR } from "@/lib/auth-paths"
import type { DirectoryProfile } from "@/lib/directory"
import { listBoardMembers } from "@/lib/server/directory"

/**
 * Board and committee members from live data (4.1): only people the admin designated and who enabled
 * their appearance themselves. With nobody to show (or no database), the page keeps its neutral text.
 */
export async function BoardSection() {
  let members: DirectoryProfile[] = []
  try {
    members = await listBoardMembers()
  } catch (error) {
    console.error("[about] board members could not be loaded:", error)
  }

  return (
    <section id={BOARD_ANCHOR} className="flex scroll-mt-24 flex-col gap-4">
      <h2 className="text-2xl font-semibold tracking-tight">Vezetőség</h2>
      <p className="leading-7 text-muted-foreground">
        A Társaság vezetőségét különböző szakterületekről érkező, a vidék egészségének fejlesztése iránt elkötelezett szakemberek alkotják.
        {members.length === 0 ? " A részletes névsor és a személyes bemutatkozások hamarosan!" : ""}
      </p>
      {members.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2">
          {members.map((member) => (
            <li key={member.id}>
              <MemberCard member={member} compact />
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}

/** The section frame with placeholder cards while the board list is being read. */
export function BoardSectionSkeleton() {
  return (
    <section id={BOARD_ANCHOR} className="flex scroll-mt-24 flex-col gap-4">
      <h2 className="text-2xl font-semibold tracking-tight">Vezetőség</h2>
      <p className="leading-7 text-muted-foreground">
        A Társaság vezetőségét különböző szakterületekről érkező, a vidék egészségének fejlesztése iránt elkötelezett szakemberek alkotják.
      </p>
      <MemberCardGridSkeleton count={4} columns="sm:grid-cols-2" />
    </section>
  )
}
