import { ImageResponse } from "next/og"
import { emblemSvgMarkup } from "@/lib/brand/emblem"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

/** Apple touch icon: the full-colour V emblem on the deep navy of the logo gradient (keeps the navy fold visible). */
export default function AppleIcon() {
  const emblem = `data:image/svg+xml;base64,${Buffer.from(emblemSvgMarkup()).toString("base64")}`
  return new ImageResponse(
    (
      <div style={{ background: "#061E41", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <img src={emblem} width={124} height={84} alt="" />
      </div>
    ),
    size,
  )
}
