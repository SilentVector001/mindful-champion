
import { redirect } from "next/navigation"

/**
 * Redirect legacy /coached-shot-strategy route to the Coach Kai training page
 */
export default function CoachShotStrategyRedirect() {
  redirect("/train/coach")
}
