import { contact } from "@/lib/data/site"
import { cn } from "@/lib/utils"

/** Facebook ikon, amely új lapon nyitja a Társaság Facebook-oldalát. */
export function FacebookMark({ className }: { className?: string }) {
  return (
    <a
      aria-label="MAVET Facebook-oldal (új lapon nyílik)"
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-full border bg-background text-foreground transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        className,
      )}
      href={contact.facebook}
      rel="noopener noreferrer"
      target="_blank"
      title="Facebook"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 fill-current">
        <path d="M14 8.5V6.8c0-.8.5-1 1-1h2V2.2L14.1 2C10.9 2 10 4.4 10 6.4v2.1H7v4h3V22h4v-9.5h2.7l.5-4H14Z" />
      </svg>
    </a>
  )
}
