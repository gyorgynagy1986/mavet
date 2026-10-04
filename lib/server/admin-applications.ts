import type { MembershipApplicationStatus } from "@/lib/models/membership-application"

export const APPLICATION_STATUS_LABEL: Record<MembershipApplicationStatus, string> = {
  elozetes: "Előzetes (cím nem ellenőrzött)",
  megerositett: "Folyamatban (adatlap hiányos)",
  bekuldott: "Elbírálásra vár",
  elfogadva: "Elfogadva",
  elutasitva: "Elutasítva",
  visszavont: "Lezárva",
}

export const APPLICATION_STATUS_SHORT: Record<MembershipApplicationStatus, string> = {
  elozetes: "Előzetes",
  megerositett: "Folyamatban",
  bekuldott: "Elbírálásra vár",
  elfogadva: "Elfogadva",
  elutasitva: "Elutasítva",
  visszavont: "Lezárva",
}

/** Tabs on the list page, in display order. */
export const APPLICATION_LIST_TABS: { key: MembershipApplicationStatus | "mind"; label: string }[] = [
  { key: "bekuldott", label: "Elbírálásra vár" },
  { key: "megerositett", label: "Folyamatban" },
  { key: "elozetes", label: "Előzetes" },
  { key: "elfogadva", label: "Elfogadva" },
  { key: "elutasitva", label: "Elutasítva" },
  { key: "visszavont", label: "Lezárva" },
  { key: "mind", label: "Mind" },
]

export function statusBadgeVariant(status: MembershipApplicationStatus): "default" | "secondary" | "destructive" | "outline" {
  if (status === "bekuldott") return "default"
  if (status === "elfogadva") return "secondary"
  if (status === "elutasitva") return "destructive"
  return "outline"
}
