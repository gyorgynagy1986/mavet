import Link from "next/link"
import { ArrowLeftIcon, BriefcaseBusinessIcon, StethoscopeIcon } from "lucide-react"
import { MemberAvatar } from "@/components/members/member-avatar"
import { SiteContainer } from "@/components/site-container"
import { Badge } from "@/components/ui/badge"
import type { DirectoryProfile } from "@/lib/directory"

/** Detailed profile: the same view for the members-only and the public (board) address. */
export function MemberProfile({ profile, backHref, backLabel }: { profile: DirectoryProfile; backHref: string; backLabel: string }) {
  const hasDetails = Boolean(profile.bio || profile.interests.length > 0 || profile.workgroups.length > 0)

  return (
    <SiteContainer className="flex max-w-3xl flex-col gap-8 py-10 sm:py-14">
      <Link href={backHref} className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-mavet-navy underline-offset-4 hover:underline">
        <ArrowLeftIcon className="size-4" aria-hidden="true" />
        {backLabel}
      </Link>

      <header className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        <MemberAvatar photoUrl={profile.photoUrl} initials={profile.initials} name={profile.name} className="size-32 text-3xl" />
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight text-balance">{profile.name}</h1>
          {profile.office ? <p className="text-lg font-medium text-mavet-navy/80">{profile.office}</p> : null}
          {profile.specialty ? (
            <p className="flex items-center gap-2 text-muted-foreground">
              <StethoscopeIcon className="size-4 shrink-0" aria-hidden="true" />
              <span><span className="sr-only">Szakterület: </span>{profile.specialty}</span>
            </p>
          ) : null}
          {profile.workplace ? (
            <p className="flex items-center gap-2 text-muted-foreground">
              <BriefcaseBusinessIcon className="size-4 shrink-0" aria-hidden="true" />
              <span><span className="sr-only">Munkahely: </span>{profile.workplace}</span>
            </p>
          ) : null}
        </div>
      </header>

      {profile.bio ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold">Bemutatkozás</h2>
          <p className="leading-7 whitespace-pre-line text-muted-foreground">{profile.bio}</p>
        </section>
      ) : null}

      {profile.interests.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold">Érdeklődési területek</h2>
          <ul className="flex flex-wrap gap-2">
            {profile.interests.map((interest) => (
              <li key={interest}>
                <Badge variant="secondary" className="h-auto px-3 py-1 text-sm whitespace-normal">{interest}</Badge>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {profile.workgroups.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold">Munkacsoportok</h2>
          <ul className="flex flex-wrap gap-2">
            {profile.workgroups.map((group) => (
              <li key={group}>
                <Badge variant="outline" className="h-auto px-3 py-1 text-sm whitespace-normal">{group}</Badge>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {!hasDetails ? <p className="text-muted-foreground">A tag további adatot nem tett láthatóvá.</p> : null}
    </SiteContainer>
  )
}
