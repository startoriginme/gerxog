import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import FeedbackDashboard from "./feedback-dashboard"

export default async function FeedbackPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Verify user owns this project
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single()

  if (!project) {
    redirect("/dashboard")
  }

  return <FeedbackDashboard projectId={projectId} project={project} />
}
