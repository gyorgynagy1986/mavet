import type { ContactMessage } from "@/lib/models/contact-message"
import type { MailMessage } from "@/lib/server/mail"

/**
 * Internal notification about a new contact message. `replyTo` is the sender,
 * so the MAVET contact can answer directly from the mail client.
 */
export function contactNotificationMail(
  to: string,
  contact: Pick<ContactMessage, "name" | "email" | "message"> & { createdAt: Date },
): MailMessage {
  const when = contact.createdAt.toLocaleString("hu-HU", { timeZone: "Europe/Budapest" })
  return {
    to,
    replyTo: contact.email,
    subject: `Új kapcsolatfelvételi üzenet: ${contact.name}`,
    text: [
      "Új üzenet érkezett a weboldal kapcsolatfelvételi űrlapján.",
      `Név: ${contact.name}\nE-mail: ${contact.email}\nIdőpont: ${when}`,
      `Üzenet:\n${contact.message}`,
      "A feladónak ez a levél „Válasz” gombbal közvetlenül megválaszolható.",
    ].join("\n\n"),
  }
}
