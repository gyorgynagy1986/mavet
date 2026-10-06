import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { SiteContainer } from "@/components/site-container"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import dbConnect from "@/lib/db-connect"
import { ADMIN_HOME_PATH, MEMBER_LOGIN_PATH } from "@/lib/auth-paths"
import { UserModel, type UserDocument } from "@/lib/models/user"
import { categoryName } from "@/lib/server/applications"
import { getServerAuthSession, isAdmin } from "@/lib/server/auth/session"
import { isBlobConfigured } from "@/lib/server/profile-photo"
import { AccountNav } from "../account-nav"
import { SignOutButton } from "../sign-out-button"
import { ProfileForm } from "./profile-form"
import { PhotoForm } from "./photo-form"
import { VisibilityForm } from "./visibility-form"

export const metadata: Metadata = { title: "Profil és megjelenés" }
export const dynamic = "force-dynamic"

export default async function ProfilePage() {
  const session = await getServerAuthSession()
  if (!session) redirect(MEMBER_LOGIN_PATH)
  if (isAdmin(session)) redirect(ADMIN_HOME_PATH)
  await dbConnect()
  const user = await UserModel.findById(session.user.id).lean<UserDocument | null>()
  if (!user) redirect(MEMBER_LOGIN_PATH)

  const active = user.membership?.status === "aktiv"
  const fullName = [user.title, user.lastName, user.firstName].filter(Boolean).join(" ") || user.name

  return (
    <SiteContainer className="flex max-w-4xl flex-col gap-6 py-12 sm:py-16">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Profil és megjelenés</h1>
          <p className="mt-1 text-muted-foreground">{fullName} · {categoryName(user.membership?.category)}{user.office ? ` · ${user.office}` : ""}</p>
        </div>
        <SignOutButton />
      </header>
      <AccountNav />

      {!active ? (
        <Alert>
          <AlertTitle>A megjelenés csak aktív tagságnál érvényes</AlertTitle>
          <AlertDescription>Profilját szerkesztheti és a megjelenést beállíthatja, de más tagok csak akkor látják, ha tagsága aktív.</AlertDescription>
        </Alert>
      ) : null}

      <PhotoForm photoUrl={user.photo?.url ?? null} configured={isBlobConfigured()} />

      <VisibilityForm
        initial={{
          enabled: user.visibility?.enabled ?? false,
          photo: user.visibility?.photo ?? true,
          specialty: user.visibility?.specialty ?? true,
          workplace: user.visibility?.workplace ?? true,
          bio: user.visibility?.bio ?? true,
          interests: user.visibility?.interests ?? true,
          workgroups: user.visibility?.workgroups ?? true,
        }}
        boardMember={user.boardMember ?? false}
        office={user.office ?? null}
      />

      <ProfileForm
        initial={{
          title: user.title ?? "",
          lastName: user.lastName ?? "",
          firstName: user.firstName ?? "",
          birthDate: user.birthDate ? user.birthDate.toISOString().slice(0, 10) : "",
          birthPlace: user.birthPlace ?? "",
          postalCode: user.address?.postalCode ?? "",
          city: user.address?.city ?? "",
          street: user.address?.street ?? "",
          country: user.address?.country ?? "",
          phone: user.phone ?? "",
          specialty: user.specialty ?? "",
          workplace: user.workplace ?? "",
          bio: user.bio ?? "",
          interests: (user.interests ?? []).join(", "),
          workgroups: user.workgroups ?? [],
        }}
        email={user.email}
        category={categoryName(user.membership?.category)}
        office={user.office ?? null}
      />
    </SiteContainer>
  )
}
