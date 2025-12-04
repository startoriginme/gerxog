import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, name, content, rating } = body

    console.log("[v0] Received feedback:", { projectId, name, content, rating })

    if (!projectId || !name || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("feedback")
      .insert({
        project_id: projectId,
        name: name,
        content: content,
        rating: rating || 5,
        user_id: crypto.randomUUID(), // Generate a random user_id for anonymous feedback
      })
      .select()

    console.log("[v0] Feedback insert response:", { data, error })

    if (error) {
      console.error("[v0] Supabase error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    console.error("[v0] API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
