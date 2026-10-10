import { redirect } from "next/navigation"
import { ABOUT_PATH, BOARD_ANCHOR } from "@/lib/auth-paths"

/** The board has no page of its own: it is a section of "A Társaságról". */
export default function BoardIndexPage() {
  redirect(`${ABOUT_PATH}#${BOARD_ANCHOR}`)
}
