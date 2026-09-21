import { SiteContainer } from "@/components/site-container"

export function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <header className="py-8 sm:py-10">
      <SiteContainer className="flex flex-col gap-3 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:duration-500">
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</h1>
        <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">{description}</p>
      </SiteContainer>
    </header>
  )
}
