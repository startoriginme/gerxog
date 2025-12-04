"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useParams } from "next/navigation"
import { Star, Menu, X } from "lucide-react"

interface Project {
  id: string
  name: string
  description: string
  logo_url: string
  category: string
  project_link: string
  tags: string[]
}

export default function FeedbackPage() {
  const params = useParams()
  const shareLink = params.shareLink as string
  const supabase = createClient()

  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    content: "",
    rating: 5,
  })

  useEffect(() => {
    fetchProject()
  }, [])

  const fetchProject = async () => {
    try {
      const { data, error } = await supabase.from("projects").select("*").eq("share_link", shareLink).single()

      if (error) throw error
      setProject(data)
    } catch (error) {
      console.error("[v0] Error fetching project:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!project || !formData.name || !formData.content) return

    setIsSubmitting(true)
    console.log("[v0] Submitting feedback with data:", formData)

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: project.id,
          name: formData.name,
          content: formData.content,
          rating: formData.rating,
        }),
      })

      const result = await response.json()
      console.log("[v0] Feedback response:", result)

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit feedback")
      }

      setFormData({ name: "", content: "", rating: 5 })
      setIsSuccess(true)
      setTimeout(() => setIsSuccess(false), 5000)
    } catch (error) {
      console.error("[v0] Error submitting feedback:", error)
      alert("Failed to submit feedback. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading project...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Project not found. Please check the link and try again.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted text-foreground">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border md:hidden">
        <div className="flex items-center justify-between px-4 py-4">
          <h1 className="text-lg font-bold">Feedback</h1>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 hover:bg-muted rounded-lg">
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {isMobileMenuOpen && (
          <div className="px-4 pb-4 space-y-2 border-t border-border">
            <a
              href={project.project_link || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm text-primary hover:underline"
            >
              Visit Project →
            </a>
          </div>
        )}
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
        {/* Project Preview Section */}
        <div className="mb-12">
          <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-card/50 backdrop-blur-sm p-6 sm:p-8 hover:shadow-lg transition-shadow">
            <div className="flex flex-col sm:flex-row items-start gap-6 mb-6">
              {project.logo_url && (
                <img
                  src={project.logo_url || "/placeholder.svg"}
                  alt={project.name}
                  className="w-20 h-20 rounded-xl object-cover shadow-md flex-shrink-0"
                />
              )}
              <div className="flex-1">
                <h1 className="text-3xl sm:text-4xl font-bold text-balance">{project.name}</h1>
                {project.category && (
                  <span className="inline-block text-xs font-semibold bg-primary/20 text-primary px-3 py-1 rounded-full mt-2">
                    {project.category}
                  </span>
                )}
              </div>
            </div>

            {project.description && (
              <p className="text-base sm:text-lg text-muted-foreground mb-6 text-balance leading-relaxed">
                {project.description}
              </p>
            )}

            {project.tags && project.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-medium bg-secondary/20 text-secondary-foreground px-3 py-1.5 rounded-full border border-secondary/30"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {project.project_link && (
              <Button asChild size="lg" className="rounded-lg w-full sm:w-auto">
                <a href={project.project_link} target="_blank" rel="noopener noreferrer">
                  Visit Project →
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Feedback Form Section */}
        <Card className="border-2 border-border rounded-2xl shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent rounded-t-2xl pb-6">
            <CardTitle className="text-2xl">Share Your Feedback</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              We'd love to hear from you. Your feedback helps us improve.
            </p>
          </CardHeader>
          <CardContent className="pt-8">
            {isSuccess && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-100 rounded-xl text-sm font-medium border border-green-200 dark:border-green-800 flex items-center gap-2 animate-in fade-in">
                <span className="text-lg">✓</span>
                Feedback is sent!
              </div>
            )}
            <form onSubmit={handleSubmitFeedback}>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-sm font-semibold">
                    Your Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="mt-2 rounded-lg"
                  />
                </div>

                <div>
                  <Label htmlFor="rating" className="text-sm font-semibold">
                    Rating
                  </Label>
                  <div className="mt-3 flex gap-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: star })}
                        className={`p-2 rounded-lg transition-all ${
                          formData.rating >= star
                            ? "bg-yellow-400 text-white scale-110"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        <Star className="w-5 h-5 fill-current" />
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {formData.rating === 5 && "Excellent"}
                    {formData.rating === 4 && "Good"}
                    {formData.rating === 3 && "Average"}
                    {formData.rating === 2 && "Poor"}
                    {formData.rating === 1 && "Very Poor"}
                  </p>
                </div>

                <div>
                  <Label htmlFor="content" className="text-sm font-semibold">
                    Your Feedback
                  </Label>
                  <Textarea
                    id="content"
                    placeholder="Tell us what you think... What did you like? What could we improve?"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                    className="mt-2 min-h-40 rounded-lg"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full rounded-lg font-semibold"
                  disabled={isSubmitting || !formData.content || !formData.name}
                >
                  {isSubmitting ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    "Submit Feedback"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
