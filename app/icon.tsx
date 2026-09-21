import { ImageResponse } from "next/og"
import { emblemSvgMarkup } from "@/lib/brand/emblem"

export const size = { width: 64, height: 64 }
export const contentType = "image/png"

/** Favicon: the full-colour V emblem on a white tile, per the brand manual. */
export default function Icon() {
  const emblem = `data:image/svg+xml;base64,${Buffer.from(emblemSvgMarkup()).toString("base64")}`
  return new ImageResponse(
    (
      <div style={{ background: "#FFFFFF", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 14 }}>
        <img src={emblem} width={52} height={35} alt="" />
      </div>
    ),
    size,
  )
}
