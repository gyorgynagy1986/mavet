/** Self-contained (no server imports) so the admin editor can preview on the client. */
export function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;")
}

/**
 * Minimal `{{variable}}` renderer: substitution and HTML escaping only, no
 * conditionals or loops. Unknown variables render as empty strings.
 * `{{ key }}` with spaces also works.
 */
const TOKEN = /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g

export type TemplateVars = Record<string, string | number | Date | null | undefined>

function stringify(value: TemplateVars[string]): string {
  if (value === null || value === undefined) return ""
  if (value instanceof Date) return value.toLocaleString("hu-HU", { timeZone: "Europe/Budapest", dateStyle: "long", timeStyle: "short" })
  return String(value)
}

export function renderTemplate(template: string, vars: TemplateVars, options: { html?: boolean } = {}): string {
  const html = options.html ?? true
  return template.replace(TOKEN, (_, key: string) => {
    const value = stringify(vars[key])
    return html ? escapeHtml(value) : value
  })
}

/** Variables used by a template, for the editor's validation and preview. */
export function extractTemplateVariables(template: string): string[] {
  const seen = new Set<string>()
  for (const match of template.matchAll(TOKEN)) seen.add(match[1])
  return [...seen]
}

/** Plain-text fallback derived from the rendered HTML body. */
export function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h[1-6]|li|tr)>/gi, "\n\n")
    .replace(/<a\b[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, (_, href: string, text: string) => `${text.trim()} (${href})`)
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

/**
 * The MAVET mail frame (navy header with a gold rule, light footer). Templates
 * hold only the body, so every mail stays consistent and the editor cannot
 * break the layout.
 */
export function wrapInMailLayout(bodyHtml: string): string {
  return `<!doctype html>
<html lang="hu">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MAVET</title></head>
<body style="margin:0;padding:24px 12px;background:#F8FAFC;font-family:Arial,Helvetica,sans-serif;color:#0B2D5B">
<div style="margin:0 auto;max-width:560px;background:#ffffff;border:1px solid #DDE5F0;border-radius:12px;overflow:hidden">
  <div style="background:#0B2D5B;padding:20px 28px;border-bottom:3px solid #F2A900">
    <span style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:0.02em">MAVET</span>
    <span style="font-size:13px;color:#95B5E5;margin-left:10px">Magyar Vidékegészségügyi Társaság</span>
  </div>
  <div style="padding:28px;font-size:15px;line-height:1.55">
${bodyHtml}
  </div>
  <div style="padding:14px 28px;background:#F8FAFC;border-top:1px solid #DDE5F0;font-size:12px;line-height:1.5;color:#4F5F7A;text-align:center">
    Magyar Vidékegészségügyi Társaság · Ez automatikus üzenet; kérdés esetén a weboldal Kapcsolat oldalán ír nekünk.
  </div>
</div>
</body>
</html>`
}
