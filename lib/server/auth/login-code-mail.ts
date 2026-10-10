import { escapeHtml, type MailMessage } from "@/lib/server/mail"
import { CODE_TTL_SECONDS } from "@/lib/server/auth/verification"

/** Admin login code e-mail in the MAVET brand (navy header, gold accent). */
export function loginCodeMail(to: string, name: string, code: string): MailMessage {
  const minutes = Math.round(CODE_TTL_SECONDS / 60)
  const greeting = name ? `Kedves ${name}!` : "Kedves Adminisztrátor!"
  const text = [
    greeting,
    `Belépési kódja a MAVET adminisztrációs felületéhez: ${code}`,
    `A kód ${minutes} percig érvényes, és egyszer használható fel.`,
    "Ha nem Ön kezdeményezte a belépést, hagyja figyelmen kívül ezt a levelet; a fiókja biztonságban van.",
    "Magyar Vidékegészségügyi Társaság",
  ].join("\n\n")

  const html = `
<div style="margin:0 auto;max-width:520px;font-family:Arial,Helvetica,sans-serif;color:#0B2D5B;background:#ffffff;border:1px solid #DDE5F0;border-radius:12px;overflow:hidden">
  <div style="background:#0B2D5B;padding:20px 28px;border-bottom:3px solid #F2A900">
    <span style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:0.02em">MAVET</span>
    <span style="font-size:13px;color:#95B5E5;margin-left:10px">Adminisztráció</span>
  </div>
  <div style="padding:28px">
    <p style="margin:0 0 16px;font-size:15px;line-height:1.5">${escapeHtml(greeting)}</p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.5">Belépési kódja az adminisztrációs felülethez:</p>
    <div style="margin:0 0 20px;padding:20px;text-align:center;background:#F8FAFC;border:1px solid #DDE5F0;border-radius:10px">
      <span style="font-family:'Courier New',Courier,monospace;font-size:32px;font-weight:700;letter-spacing:0.3em;color:#0B2D5B">${escapeHtml(code)}</span>
    </div>
    <p style="margin:0 0 8px;font-size:14px;line-height:1.5">A kód <strong>${minutes} percig</strong> érvényes, és egyszer használható fel.</p>
    <p style="margin:0;font-size:13px;line-height:1.5;color:#4F5F7A">Ha nem Ön kezdeményezte a belépést, hagyja figyelmen kívül ezt a levelet; a fiókja biztonságban van.</p>
  </div>
  <div style="padding:14px 28px;background:#F8FAFC;border-top:1px solid #DDE5F0;font-size:12px;color:#4F5F7A;text-align:center">
    Magyar Vidékegészségügyi Társaság · automatikus üzenet, kérjük, ne válaszoljon rá.
  </div>
</div>`

  return { to, subject: `MAVET admin belépési kód: ${code}`, text, html }
}
