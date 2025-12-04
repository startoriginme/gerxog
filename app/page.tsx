"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Zap, Share2, BarChart3 } from "lucide-react"

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        setIsLoggedIn(true)
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const handleGetStarted = () => {
    if (isLoggedIn) {
      router.push("/dashboard")
    } else {
      router.push("/auth/sign-up")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-lg">
              G
            </div>
            <span className="text-xl font-bold">Gerxog</span>
          </div>
          <nav className="flex gap-4 items-center">
            <Link href="#features" className="text-sm hover:text-primary transition">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm hover:text-primary transition">
              How It Works
            </Link>
            {isLoggedIn ? (
              <>
                <Button asChild variant="outline" size="sm">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="outline" size="sm">
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/auth/sign-up">Sign Up</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-balance mb-6 leading-tight">
            All Your Feedback in One Dashboard
          </h1>
          <p className="text-xl text-muted-foreground text-balance mb-8 max-w-2xl mx-auto">
            Collect, organize, and analyze feedback from your users. Share unique links for each project and get
            AI-powered summaries.
          </p>
          <Button onClick={handleGetStarted} size="lg" className="px-8">
            {isLoggedIn ? "Go to Dashboard" : "Get Started Free"}
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-card py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12 text-balance">Why Gerxog?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-lg bg-background border border-border">
              <Zap className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Quick Setup</h3>
              <p className="text-sm text-muted-foreground">Create projects and share links in seconds.</p>
            </div>
            <div className="p-6 rounded-lg bg-background border border-border">
              <Share2 className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Easy Sharing</h3>
              <p className="text-sm text-muted-foreground">Share unique links with your audience effortlessly.</p>
            </div>
            <div className="p-6 rounded-lg bg-background border border-border">
              <BarChart3 className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">AI Summaries</h3>
              <p className="text-sm text-muted-foreground">Get instant AI-powered summaries of your feedback.</p>
            </div>
            <div className="p-6 rounded-lg bg-background border border-border">
              <CheckCircle2 className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Organized</h3>
              <p className="text-sm text-muted-foreground">Keep all feedback organized in one place.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12 text-balance">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  1
                </div>
              </div>
              <h3 className="font-semibold text-lg mb-2">Create a Project</h3>
              <p className="text-sm text-muted-foreground">Set up your project with name, description, and tags.</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  2
                </div>
              </div>
              <h3 className="font-semibold text-lg mb-2">Share the Link</h3>
              <p className="text-sm text-muted-foreground">Get a unique link and share it with your audience.</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  3
                </div>
              </div>
              <h3 className="font-semibold text-lg mb-2">Collect & Analyze</h3>
              <p className="text-sm text-muted-foreground">Collect feedback and get AI summaries instantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-card py-20 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6 text-balance">Ready to get started?</h2>
          <p className="text-lg text-muted-foreground mb-8 text-balance">
            Start collecting feedback today with Gerxog.
          </p>
          <Button onClick={handleGetStarted} size="lg" className="px-8">
            {isLoggedIn ? "Go to Dashboard" : "Sign Up Now"}
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Gerxog. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
