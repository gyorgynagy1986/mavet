import { cn } from "@/lib/utils"

export function FacebookMark({ className }: { className?: string }) {
  return (
    <span
      aria-label="Facebook"
      className={cn("inline-flex size-9 items-center justify-center rounded-full border bg-background text-foreground", className)}
      title="Facebook"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 fill-current">
        <path d="M14 8.5V6.8c0-.8.5-1 1-1h2V2.2L14.1 2C10.9 2 10 4.4 10 6.4v2.1H7v4h3V22h4v-9.5h2.7l.5-4H14Z" />
      </svg>
    </span>
  )
}
