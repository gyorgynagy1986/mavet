import type { MembershipStatus } from "@/lib/models/user"

export const MEMBERSHIP_STATUS_LABEL: Record<MembershipStatus, string> = {
  aktivalasra_var: "Aktiválásra vár",
  fizetesre_var: "Első tagdíjra vár",
  aktiv: "Aktív",
  lejart: "Lejárt",
  megszunt: "Megszűnt",
}

export const MEMBER_LIST_TABS: { key: MembershipStatus | "mind"; label: string }[] = [
  { key: "aktiv", label: "Aktív" },
  { key: "fizetesre_var", label: "Tagdíjra vár" },
  { key: "aktivalasra_var", label: "Aktiválásra vár" },
  { key: "lejart", label: "Lejárt" },
  { key: "megszunt", label: "Megszűnt" },
  { key: "mind", label: "Mind" },
]

export function membershipBadgeVariant(status: MembershipStatus): "default" | "secondary" | "destructive" | "outline" {
  if (status === "aktiv") return "default"
  if (status === "fizetesre_var" || status === "aktivalasra_var") return "secondary"
  if (status === "megszunt" || status === "lejart") return "destructive"
  return "outline"
}
