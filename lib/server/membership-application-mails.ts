import type { MembershipApplication } from "@/lib/models/membership-application"
import { membershipCategories } from "@/lib/data/site"
import type { MailMessage } from "@/lib/server/mail"

/** Confirmation sent to the applicant. Wording approved by the client; keep verbatim. */
export function applicantConfirmationMail(to: string): MailMessage {
  return {
    to,
    subject: "Jelentkezés visszaigazolása – Magyar Vidékegészségügyi Társaság",
    text: [
      "Tisztelt Jelentkező!",
      "Örömmel vettük a Magyar Vidékegészségügyi Társaságba történő jelentkezését. Ön jelenleg tagjelölt státuszban van, a végleges elbírálásról a Közgyűlés dönt. Amint ez megtörtént, tájékoztatjuk, addig nincsen további teendője.",
      "Kollegiális üdvözlettel,\na MAVET Közössége",
    ].join("\n\n"),
  }
}

/** Internal notification about a new application. */
export function adminNotificationMail(
  to: string,
  application: Pick<MembershipApplication, "category" | "title" | "lastName" | "firstName" | "email"> & {
    createdAt: Date
  },
): MailMessage {
  const categoryName = membershipCategories.find((c) => c.id === application.category)?.name ?? application.category
  const fullName = [application.title, application.lastName, application.firstName].filter(Boolean).join(" ")
  const when = application.createdAt.toLocaleString("hu-HU", { timeZone: "Europe/Budapest" })
  return {
    to,
    replyTo: application.email,
    subject: `Új tagjelölt: ${fullName} (${categoryName})`,
    text: [
      "Új előzetes tagsági jelentkezés érkezett a weboldalon.",
      `Név: ${fullName}\nE-mail: ${application.email}\nKategória: ${categoryName}\nIdőpont: ${when}`,
      "A jelentkező automatikus visszaigazolást kapott arról, hogy tagjelölt státuszban van, és a Közgyűlés döntéséig nincs további teendője.",
    ].join("\n\n"),
  }
}
