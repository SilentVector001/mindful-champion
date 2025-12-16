import { redirect } from "next/navigation"

export default function VideoIdRedirect({ params }: { params: { id: string } }) {
  // Redirect [id] routes to [videoId] for consistency
  redirect(`/train/video/${params.id}`)
}
