import Link from "next/link"
import { LockIcon } from "lucide-react"
import { SiteContainer } from "@/components/site-container"
import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { ADMIN_HOME_PATH, MEMBER_ACCOUNT_PATH } from "@/lib/auth-paths"

/** Shown to a logged-in person who is not an active member; identical whatever was requested. */
export function DirectoryRestricted({ admin }: { admin: boolean }) {
  return (
    <SiteContainer className="max-w-3xl py-16">
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <LockIcon aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>A tagi névjegyzék aktív tagoknak érhető el</EmptyTitle>
          <EmptyDescription>
            {admin
              ? "Adminisztrátori fiókkal a névjegyzék nem nyitható meg; a tagok az adminisztrációs felület Tagok oldalán kezelhetők."
              : "A névjegyzéket és a tagi profilokat csak aktív tagsággal lehet megnyitni. Tagsága állapotát a saját fiókjában látja."}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button render={<Link href={admin ? `${ADMIN_HOME_PATH}/tagok` : MEMBER_ACCOUNT_PATH} />} nativeButton={false}>
            {admin ? "Tagok az adminban" : "Saját fiók"}
          </Button>
        </EmptyContent>
      </Empty>
    </SiteContainer>
  )
}
