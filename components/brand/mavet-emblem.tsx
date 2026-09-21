import { useId } from "react"
import { EMBLEM_GRADIENTS, EMBLEM_PATHS, EMBLEM_SEPARATOR_WIDTH, EMBLEM_VIEW_BOX } from "@/lib/brand/emblem"
import { cn } from "@/lib/utils"

type MavetEmblemProps = Omit<React.ComponentProps<"svg">, "viewBox"> & {
  /** `color`: full-colour gradients; `mono`: single colour taken from `currentColor`. */
  variant?: "color" | "mono"
  /** Accessible name. Without it the emblem is decorative and hidden from assistive tech. */
  title?: string
}

/**
 * The standalone MAVET "V" emblem. Server-compatible; gradient ids are unique
 * per instance, so several emblems (even hidden ones) can share a page.
 */
export function MavetEmblem({ variant = "color", title, className, ...props }: MavetEmblemProps) {
  const id = useId()
  const ids = { blue: `${id}-blue`, gold: `${id}-gold`, navy: `${id}-navy`, clip: `${id}-clip` }
  const isMono = variant === "mono"
  const fill = (key: "blue" | "gold" | "navy") => (isMono ? "currentColor" : `url(#${ids[key]})`)

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={EMBLEM_VIEW_BOX}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
      className={cn("aspect-[764/516] h-auto", className)}
      {...props}
    >
      <defs>
        {!isMono &&
          (["blue", "gold", "navy"] as const).map((key) => {
            const gradient = EMBLEM_GRADIENTS[key]
            return (
              <linearGradient key={key} id={ids[key]} x1={gradient.x1} y1={gradient.y1} x2={gradient.x2} y2={gradient.y2}>
                {gradient.stops.map(([offset, color]) => (
                  <stop key={offset} offset={offset} stopColor={color} />
                ))}
              </linearGradient>
            )
          })}
        {isMono ? (
          /* Mono: the separator is negative space, so it is cut out of the shape. */
          <mask id={ids.clip} maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="760">
            <rect x="0" y="0" width="1000" height="760" fill="white" />
            <g fill="none" stroke="black" strokeWidth={EMBLEM_SEPARATOR_WIDTH}>
              {EMBLEM_PATHS.separators.map((d) => (
                <path key={d} d={d} />
              ))}
            </g>
          </mask>
        ) : (
          <clipPath id={ids.clip}>
            <path d={EMBLEM_PATHS.navy} />
            <path d={EMBLEM_PATHS.gold} />
            <path d={EMBLEM_PATHS.blue} />
          </clipPath>
        )}
      </defs>
      <g mask={isMono ? `url(#${ids.clip})` : undefined}>
        <path fill={fill("navy")} d={EMBLEM_PATHS.navy} />
        <path fill={fill("gold")} d={EMBLEM_PATHS.gold} />
        <path fill={fill("blue")} d={EMBLEM_PATHS.blue} />
      </g>
      {!isMono && (
        <g fill="none" stroke="#FFFFFF" strokeWidth={EMBLEM_SEPARATOR_WIDTH} clipPath={`url(#${ids.clip})`}>
          {EMBLEM_PATHS.separators.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
      )}
    </svg>
  )
}
