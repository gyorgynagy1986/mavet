import dbConnect from "@/lib/db-connect"
import { DEFAULT_PARTNERS_INTRO, PARTNERS_INTRO_KEY, type PartnerView } from "@/lib/partners"
import { PartnerModel, type PartnerDocument } from "@/lib/models/partner"
import { SiteTextModel } from "@/lib/models/site-text"

const ORDER = { order: 1, name: 1 } as const

export function toPartnerView(p: PartnerDocument): PartnerView {
  return { id: p._id.toString(), name: p.name, logoUrl: p.logo?.url ?? null, websiteUrl: p.websiteUrl?.trim() || null, featured: p.featured === true }
}

export async function listAllPartners(): Promise<PartnerDocument[]> {
  await dbConnect()
  return PartnerModel.find().sort(ORDER).lean<PartnerDocument[]>()
}

export async function listPublishedPartners(): Promise<PartnerView[]> {
  await dbConnect()
  const docs = await PartnerModel.find({ published: true }).sort(ORDER).lean<PartnerDocument[]>()
  return docs.map(toPartnerView)
}

/** Home page strip (3.1): the featured, published partners in admin order. */
export async function listFeaturedPartners(): Promise<PartnerView[]> {
  await dbConnect()
  const docs = await PartnerModel.find({ published: true, featured: true }).sort(ORDER).lean<PartnerDocument[]>()
  return docs.map(toPartnerView)
}

export async function getPartnersIntro(): Promise<string> {
  await dbConnect()
  const doc = await SiteTextModel.findOne({ key: PARTNERS_INTRO_KEY }).lean<{ text: string } | null>()
  return doc ? doc.text : DEFAULT_PARTNERS_INTRO
}
