import { CircleHelpIcon } from "lucide-react"

export interface StatusHelpItem {
  label: string
  description: string
}

/** Collapsible legend under the admin lists: what each status tab means and what to do with it. */
export function StatusHelp({ title, intro, items }: { title: string; intro?: string; items: StatusHelpItem[] }) {
  return (
    <details className="group rounded-xl border border-border bg-card">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-5 py-3 text-sm font-semibold text-mavet-navy outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
        <CircleHelpIcon className="size-4 text-mavet-blue" aria-hidden="true" />
        {title}
        <span className="ml-auto text-xs font-normal text-muted-foreground group-open:hidden">Megnyitás</span>
        <span className="ml-auto hidden text-xs font-normal text-muted-foreground group-open:inline">Bezárás</span>
      </summary>
      <div className="border-t border-border px-5 py-4">
        {intro ? <p className="mb-3 text-sm text-muted-foreground">{intro}</p> : null}
        <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-[11rem_1fr]">
          {items.map((item) => (
            <div key={item.label} className="contents">
              <dt className="text-sm font-semibold">{item.label}</dt>
              <dd className="text-sm leading-6 text-muted-foreground">{item.description}</dd>
            </div>
          ))}
        </dl>
      </div>
    </details>
  )
}
