import dbConnect from "@/lib/db-connect"
import { AWARDS_INTRO_KEY, DEFAULT_AWARDS_INTRO, visibleAwards, type AwardView } from "@/lib/awards"
import { AwardModel, type AwardDocument } from "@/lib/models/award"
import { SiteTextModel } from "@/lib/models/site-text"

export async function listAwardDocuments(): Promise<AwardDocument[]> {
  await dbConnect()
  return AwardModel.find().sort({ order: 1, name: 1 }).lean<AwardDocument[]>()
}

export async function getAwardsIntro(): Promise<string> {
  await dbConnect()
  const doc = await SiteTextModel.findOne({ key: AWARDS_INTRO_KEY }).lean<{ text: string } | null>()
  return doc ? doc.text : DEFAULT_AWARDS_INTRO
}

/** The public page's data (4.4): intro and the visible awards with their non-empty years. */
export async function getAwardsPage(): Promise<{ intro: string; awards: AwardView[] }> {
  const [docs, intro] = await Promise.all([listAwardDocuments(), getAwardsIntro()])
  return {
    intro,
    awards: visibleAwards(docs.map((d) => ({ id: d._id.toString(), name: d.name, description: d.description ?? "", hidden: d.hidden, entries: (d.entries ?? []).map((e) => ({ year: e.year, names: [...(e.names ?? [])] })) }))),
  }
}
