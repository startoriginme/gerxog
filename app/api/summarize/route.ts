import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { feedbackText, projectId } = await request.json()

    console.log("[v0] Summarizing feedback for project:", projectId)
    console.log("[v0] API Key exists:", !!process.env.GEMINI_API_KEY)

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Please summarize the following feedback concisely, highlighting the main themes, positive points, and areas for improvement:\n\n${feedbackText}`,
                },
              ],
            },
          ],
          generationConfig: {
            maxOutputTokens: 500,
          },
        }),
      },
    )

    const responseData = await response.json()

    console.log("[v0] Gemini API Response status:", response.status)
    console.log("[v0] Gemini API Response data:", responseData)

    if (!response.ok) {
      throw new Error(`Gemini API error: ${responseData.error?.message || "Unknown error"}`)
    }

    const summary = responseData.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to generate summary"

    return NextResponse.json({ summary })
  } catch (error) {
    console.error("[v0] Error in summarize API:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to summarize feedback" },
      { status: 500 },
    )
  }
}
