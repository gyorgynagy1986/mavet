import Link from "next/link"
import { MemberAvatar } from "@/components/members/member-avatar"
import type { DirectoryProfile } from "@/lib/directory"

/**
 * List card for the directory and the board section. `compact` is the public board card of 4.1:
 * name, office, the allowed portrait and the link to the profile, nothing else.
 */
export function MemberCard({ member, compact = false }: { member: DirectoryProfile; compact?: boolean }) {
  return (
    <Link
      href={member.href}
      className="group flex items-start gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-mavet-navy/40 hover:bg-mavet-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <MemberAvatar photoUrl={member.photoUrl} initials={member.initials} name={member.name} className="size-16 text-lg" />
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="font-semibold text-mavet-navy group-hover:underline">{member.name}</span>
        {member.office ? <span className="text-sm font-medium text-mavet-navy/80">{member.office}</span> : null}
        {!compact && member.specialty ? <span className="text-sm text-muted-foreground">{member.specialty}</span> : null}
        {!compact && member.workplace ? <span className="text-sm text-muted-foreground">{member.workplace}</span> : null}
      </div>
    </Link>
  )
}
