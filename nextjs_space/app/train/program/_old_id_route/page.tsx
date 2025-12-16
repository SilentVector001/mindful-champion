import { redirect } from "next/navigation"

export default function ProgramIdRedirect({ params }: { params: { id: string } }) {
  // Redirect [id] routes to [programId] for consistency
  redirect(`/train/program/${params.id}`)
}
