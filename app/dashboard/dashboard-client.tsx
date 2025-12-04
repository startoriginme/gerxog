"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Plus, LogOut, ChevronDown, User, Menu, X } from "lucide-react"
import ProjectCard from "./project-card"
import { useRouter } from "next/navigation"

interface Project {
  id: string
  name: string
  description: string
  logo_url: string
  category: string
  project_link: string
  tags: string[]
  share_link: string
  created_at: string
}

export default function DashboardClient({ userId }: { userId: string }) {
  const supabase = createClient()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logo_url: "",
    category: "",
    project_link: "",
    tags: "",
  })

  useEffect(() => {
    fetchProjects()
    getUserEmail()
  }, [])

  const getUserEmail = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setUserEmail(user?.email || "")
  }

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error("Error fetching projects:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateShareLink = () => {
    return `${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}`
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)

    try {
      const shareLink = generateShareLink()
      const { data, error } = await supabase
        .from("projects")
        .insert({
          user_id: userId,
          name: formData.name,
          description: formData.description,
          logo_url: formData.logo_url,
          category: formData.category,
          project_link: formData.project_link,
          tags: formData.tags.split(",").map((t) => t.trim()),
          share_link: shareLink,
        })
        .select()
        .single()

      if (error) throw error

      setProjects([data, ...projects])
      setFormData({
        name: "",
        description: "",
        logo_url: "",
        category: "",
        project_link: "",
        tags: "",
      })
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error creating project:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) return

    try {
      const { error } = await supabase.from("projects").delete().eq("id", projectId)

      if (error) throw error

      setProjects(projects.filter((p) => p.id !== projectId))
      if (selectedProjectId === projectId) setSelectedProjectId(null)
    } catch (error) {
      console.error("Error deleting project:", error)
    }
  }

  const handleEditProject = (project: Project) => {
    setSelectedProjectId(project.id)
    setFormData({
      name: project.name,
      description: project.description,
      logo_url: project.logo_url,
      category: project.category,
      project_link: project.project_link,
      tags: project.tags.join(", "),
    })
    setIsDialogOpen(true)
  }

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProjectId) return

    setIsCreating(true)

    try {
      const { error } = await supabase
        .from("projects")
        .update({
          name: formData.name,
          description: formData.description,
          logo_url: formData.logo_url,
          category: formData.category,
          project_link: formData.project_link,
          tags: formData.tags.split(",").map((t) => t.trim()),
        })
        .eq("id", selectedProjectId)

      if (error) throw error

      setProjects(
        projects.map((p) =>
          p.id === selectedProjectId
            ? {
                ...p,
                name: formData.name,
                description: formData.description,
                logo_url: formData.logo_url,
                category: formData.category,
                project_link: formData.project_link,
                tags: formData.tags.split(",").map((t) => t.trim()),
              }
            : p,
        ),
      )
      setFormData({
        name: "",
        description: "",
        logo_url: "",
        category: "",
        project_link: "",
        tags: "",
      })
      setSelectedProjectId(null)
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error updating project:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-lg">
              G
            </div>
            <span className="text-xl font-bold">Gerxog</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <User className="w-4 h-4" />
                  {userEmail.split("@")[0]}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-3 py-2 text-sm text-muted-foreground">{userEmail}</div>
                <DropdownMenuSeparator />
                {projects.length > 0 && (
                  <>
                    <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">Your Projects</div>
                    {projects.map((project) => (
                      <DropdownMenuItem
                        key={project.id}
                        onClick={() => {
                          router.push(`/dashboard/feedback/${project.id}`)
                        }}
                        className="cursor-pointer"
                      >
                        {project.name}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer gap-2">
                  <LogOut className="w-4 h-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 hover:bg-muted rounded-lg">
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-muted/50">
            <div className="px-4 py-3 space-y-2">
              <div className="text-sm font-semibold text-muted-foreground">Signed in as</div>
              <div className="text-sm text-foreground">{userEmail}</div>
              {projects.length > 0 && (
                <>
                  <div className="pt-3 mt-3 border-t border-border text-xs font-semibold text-muted-foreground">
                    Your Projects
                  </div>
                  <div className="space-y-2">
                    {projects.map((project) => (
                      <button
                        key={project.id}
                        onClick={() => {
                          router.push(`/dashboard/feedback/${project.id}`)
                          setIsMobileMenuOpen(false)
                        }}
                        className="w-full text-left text-sm text-primary hover:underline py-1"
                      >
                        {project.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
              <button
                onClick={handleLogout}
                className="w-full text-left text-sm text-red-600 hover:underline py-2 mt-3 border-t border-border pt-3"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Title and Create Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Your Projects</h1>
            <p className="text-muted-foreground">Create and manage your feedback collection projects</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{selectedProjectId ? "Edit Project" : "Create New Project"}</DialogTitle>
                <DialogDescription>
                  {selectedProjectId ? "Update your project details" : "Set up a new feedback collection project"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={selectedProjectId ? handleUpdateProject : handleCreateProject}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Project Name</Label>
                    <Input
                      id="name"
                      placeholder="My Awesome Project"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      placeholder="What is this project about?"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="logo_url">Logo URL</Label>
                    <Input
                      id="logo_url"
                      placeholder="https://example.com/logo.png"
                      value={formData.logo_url}
                      onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      placeholder="e.g., Product, Design, Feature"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="project_link">Project Link</Label>
                    <Input
                      id="project_link"
                      placeholder="https://myproject.com"
                      value={formData.project_link}
                      onChange={(e) => setFormData({ ...formData, project_link: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      placeholder="tag1, tag2, tag3"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isCreating || !formData.name}>
                    {isCreating
                      ? selectedProjectId
                        ? "Updating..."
                        : "Creating..."
                      : selectedProjectId
                        ? "Update Project"
                        : "Create Project"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : projects.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground mb-4">No projects yet. Create your first project to get started!</p>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create First Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onFeedbackClick={() => {
                  router.push(`/dashboard/feedback/${project.id}`)
                }}
                onEditClick={() => handleEditProject(project)}
                onDeleteClick={() => handleDeleteProject(project.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
