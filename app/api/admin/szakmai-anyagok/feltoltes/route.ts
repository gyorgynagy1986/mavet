import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { NextResponse } from "next/server"
import mongoose from "mongoose"
import { DOCUMENT_MAX_BYTES, DOCUMENT_TYPES } from "@/lib/materials"
import { getServerAuthSession, isAdmin } from "@/lib/server/auth/session"
import { materialFolder } from "@/lib/server/material-file"

/**
 * Browser-to-Blob upload for documents (up to 25 MB; a server action would be capped at 4.5 MB on
 * Vercel). The browser asks here for a one-time token, uploads straight to the store, then calls
 * `attachMaterialFile` to record the file on the material. Only admins get a token, and only for the
 * folder of an existing material.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const session = await getServerAuthSession()
  if (!session || !isAdmin(session)) return NextResponse.json({ error: "Nincs jogosultsága." }, { status: 403 })
  const body = (await request.json()) as HandleUploadBody
  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const materialId = typeof clientPayload === "string" ? clientPayload : ""
        if (!mongoose.isValidObjectId(materialId) || !pathname.startsWith(materialFolder(materialId))) throw new Error("A fájl nem ehhez az anyaghoz tartozik.")
        return { allowedContentTypes: Object.keys(DOCUMENT_TYPES), maximumSizeInBytes: DOCUMENT_MAX_BYTES, addRandomSuffix: true, tokenPayload: materialId }
      },
      // The browser records the file through a server action after the upload; nothing to do here.
      onUploadCompleted: async () => {},
    })
    return NextResponse.json(json)
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "A feltöltés nem indítható." }, { status: 400 })
  }
}
