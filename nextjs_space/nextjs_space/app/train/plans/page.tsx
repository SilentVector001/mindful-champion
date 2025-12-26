
import { redirect } from "next/navigation"

export default async function PlansPage() {
  // Redirect to the new training programs dashboard
  redirect("/train/programs")
}
