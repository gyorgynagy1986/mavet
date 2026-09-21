/**
 * MAVET "V" emblem geometry and logo gradients.
 *
 * NOTE: the path data in the brand manual ("Master V embléma") does not
 * reproduce the approved emblem artwork, so these paths were redrawn from the
 * approved logo sheet. Replace them with the final vector artwork once the
 * designer delivers `mavet-symbol.svg`; nothing else needs to change.
 */
export const EMBLEM_VIEW_BOX = "110 112 764 516"

export const EMBLEM_PATHS = {
  navy: "M322 456C380 498 440 518 500 518C560 518 610 492 652 446L548 588C520 626 462 628 434 590Z",
  gold: "M865 120L700 120C675 120 658 131 645 152L480 374C462 418 425 458 385 466C362 470 340 466 322 456C380 498 440 518 500 518C560 518 610 492 652 446Z",
  blue: "M118 125L290 125C315 125 333 138 347 160L480 374C462 418 425 458 385 466C362 470 340 466 322 456C310 447 303 438 296 426Z",
  separators: [
    "M480 374C462 418 425 458 385 466C362 470 340 466 322 456",
    "M322 456C380 498 440 518 500 518C560 518 610 492 652 446",
  ],
} as const

export const EMBLEM_SEPARATOR_WIDTH = 9

/** Logo gradients, exactly as fixed in the brand manual. */
export const EMBLEM_GRADIENTS = {
  blue: { x1: "0%", y1: "0%", x2: "100%", y2: "100%", stops: [["0%", "#2A6BCB"], ["42%", "#1154A3"], ["100%", "#0B2D5B"]] },
  gold: { x1: "100%", y1: "0%", x2: "0%", y2: "100%", stops: [["0%", "#FFD15A"], ["48%", "#F2A900"], ["100%", "#D88900"]] },
  navy: { x1: "0%", y1: "0%", x2: "0%", y2: "100%", stops: [["0%", "#164D91"], ["55%", "#0B2D5B"], ["100%", "#061E41"]] },
} as const

/** Standalone SVG markup of the full-colour emblem (used for generated icons). */
export function emblemSvgMarkup(): string {
  const gradient = (id: keyof typeof EMBLEM_GRADIENTS) => {
    const g = EMBLEM_GRADIENTS[id]
    const stops = g.stops.map(([offset, color]) => `<stop offset="${offset}" stop-color="${color}"/>`).join("")
    return `<linearGradient id="${id}" x1="${g.x1}" y1="${g.y1}" x2="${g.x2}" y2="${g.y2}">${stops}</linearGradient>`
  }
  const separators = EMBLEM_PATHS.separators.map((d) => `<path d="${d}"/>`).join("")
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${EMBLEM_VIEW_BOX}">`,
    `<defs>${gradient("blue")}${gradient("gold")}${gradient("navy")}`,
    `<clipPath id="shape"><path d="${EMBLEM_PATHS.navy}"/><path d="${EMBLEM_PATHS.gold}"/><path d="${EMBLEM_PATHS.blue}"/></clipPath></defs>`,
    `<path fill="url(#navy)" d="${EMBLEM_PATHS.navy}"/>`,
    `<path fill="url(#gold)" d="${EMBLEM_PATHS.gold}"/>`,
    `<path fill="url(#blue)" d="${EMBLEM_PATHS.blue}"/>`,
    `<g fill="none" stroke="#FFFFFF" stroke-width="${EMBLEM_SEPARATOR_WIDTH}" clip-path="url(#shape)">${separators}</g>`,
    `</svg>`,
  ].join("")
}
