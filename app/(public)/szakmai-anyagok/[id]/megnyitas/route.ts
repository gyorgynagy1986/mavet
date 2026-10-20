import { NextResponse } from "next/server"
import { loginPathWithReturn } from "@/lib/auth-paths"
import { getViewer } from "@/lib/server/directory"
import { canOpenMembersOnly, findPublishedMaterial } from "@/lib/server/materials"

export const dynamic = "force-dynamic"

/**
 * Opens a document (6.4): the access check happens here, on the actual opening, not only on the list
 * (6.3). A members-only file sends a visitor to the sign-in page and an inactive member back to the
 * list with a notice. Hidden or missing materials are not found.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const material = await findPublishedMaterial(id)
  if (!material || material.kind !== "dokumentum") return new NextResponse("Nem található.", { status: 404 })
  if (material.access === "tagi") {
    const viewer = await getViewer()
    if (viewer.kind === "guest") return NextResponse.redirect(new URL(loginPathWithReturn(`/szakmai-anyagok/${id}/megnyitas`), _request.url))
    if (!canOpenMembersOnly(viewer)) return NextResponse.redirect(new URL("/szakmai-anyagok?hozzaferes=tagi", _request.url))
  }
  const target = material.documentSource === "link" ? material.externalUrl : material.file?.url
  if (!target) return new NextResponse("Nem található.", { status: 404 })
  return NextResponse.redirect(target, { status: 302, headers: { "Cache-Control": "no-store" } })
}
