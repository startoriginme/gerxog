"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Copy, ExternalLink, MessageSquare, MoreVertical, Edit, Trash2 } from "lucide-react"
import { useState } from "react"

interface Project {
  id: string
  name: string
  description: string
  logo_url: string
  category: string
  project_link: string
  tags: string[]
  share_link: string
}

export default function ProjectCard({
  project,
  onFeedbackClick,
  onEditClick,
  onDeleteClick,
}: {
  project: Project
  onFeedbackClick: () => void
  onEditClick: () => void
  onDeleteClick: () => void
}) {
  const [copied, setCopied] = useState(false)

  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/feedback/${project.share_link}`

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="hover:shadow-lg transition-shadow overflow-hidden">
      {project.logo_url && (
        <div className="h-32 bg-muted overflow-hidden">
          <img src={project.logo_url || "/placeholder.svg"} alt={project.name} className="w-full h-full object-cover" />
        </div>
      )}
      <CardHeader className="pb-3 flex flex-row items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-lg line-clamp-1">{project.name}</h3>
          {project.category && <p className="text-xs text-muted-foreground">{project.category}</p>}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEditClick} className="cursor-pointer gap-2">
              <Edit className="w-4 h-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDeleteClick} className="cursor-pointer gap-2 text-red-600">
              <Trash2 className="w-4 h-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="space-y-3">
        {project.description && <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {project.tags.map((tag) => (
              <span key={tag} className="text-xs bg-muted px-2 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopyLink} className="flex-1 gap-2 bg-transparent">
            <Copy className="w-4 h-4" />
            {copied ? "Copied!" : "Copy Link"}
          </Button>
          <Button variant="outline" size="sm" onClick={onFeedbackClick} className="flex-1 gap-2 bg-transparent">
            <MessageSquare className="w-4 h-4" />
            Feedback
          </Button>
        </div>
        {project.project_link && (
          <Button variant="ghost" size="sm" asChild className="w-full gap-2">
            <a href={project.project_link} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4" />
              Visit Project
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
