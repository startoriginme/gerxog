// app/api/analyze-feedback/route.ts
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { data, analysisType } = await req.json()
    
    // Используем Gemini 2.0 Flash через Google AI
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`
    
    const prompt = `
    Analyze this feedback data and provide actionable insights:
    
    Project: ${data.projectName}
    Total Feedback: ${data.totalFeedback}
    Average Rating: ${data.averageRating}
    
    Feedback Analysis Request:
    1. Identify key themes and patterns
    2. Provide specific actionable recommendations
    3. Highlight areas for improvement
    4. Suggest quick wins
    5. Analyze sentiment trends
    
    Format the response in markdown with clear sections.
    `
    
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    })
    
    const geminiData = await response.json()
    const summary = geminiData.candidates?.[0]?.content?.parts?.[0]?.text
    
    return NextResponse.json({ 
      success: true, 
      summary: summary || "Analysis completed but no summary generated." 
    })
    
  } catch (error) {
    console.error('Gemini API error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze feedback' },
      { status: 500 }
    )
  }
}
