"use client"

import { useEffect, useState, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Star, TrendingUp, Calendar, MessageSquare, Trash2, BarChart3, PieChart, Filter } from "lucide-react"
import { useRouter } from "next/navigation"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts'

interface Feedback {
  id: string
  content: string
  name: string
  rating: number
  created_at: string
  project_id: string
}

interface Project {
  id: string
  name: string
  description: string
}

const getRatingLabel = (rating: number): string => {
  switch (rating) {
    case 5:
      return "Excellent"
    case 4:
      return "Very Good"
    case 3:
      return "Good"
    case 2:
      return "Fair"
    case 1:
      return "Poor"
    default:
      return "Not Rated"
  }
}

const getRatingColor = (rating: number): string => {
  switch (rating) {
    case 5:
      return "text-emerald-500"
    case 4:
      return "text-blue-500"
    case 3:
      return "text-yellow-500"
    case 2:
      return "text-orange-500"
    case 1:
      return "text-red-500"
    default:
      return "text-gray-500"
  }
}

const getSentimentColor = (sentiment: number): string => {
  if (sentiment > 0.3) return "text-emerald-500"
  if (sentiment > -0.3) return "text-yellow-500"
  return "text-red-500"
}

const getSentimentLabel = (sentiment: number): string => {
  if (sentiment > 0.3) return "Positive"
  if (sentiment > -0.3) return "Neutral"
  return "Negative"
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function FeedbackDashboard({
  projectId,
  project: initialProject,
}: {
  projectId: string
  project: Project
}) {
  const supabase = createClient()
  const router = useRouter()
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [filterRating, setFilterRating] = useState<number | null>(null)

  // Calculate real-time statistics from feedback
  const stats = useMemo(() => {
    const totalFeedback = feedbackList.length
    const lastFeedback = feedbackList.length > 0 
      ? feedbackList[0].created_at 
      : null
    const averageRating = feedbackList.length > 0
      ? feedbackList.reduce((sum, f) => sum + f.rating, 0) / feedbackList.length
      : 0
    const sentimentScore = feedbackList.length > 0
      ? feedbackList.reduce((sum, f) => sum + ((f.rating - 3) / 2), 0) / feedbackList.length
      : 0

    return {
      totalFeedback,
      lastFeedback,
      averageRating,
      sentimentScore
    }
  }, [feedbackList])

  // Prepare chart data based on real feedback
  const chartData = useMemo(() => {
    if (!feedbackList.length) return []

    // Group by last 30 days
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      date.setHours(0, 0, 0, 0)
      return {
        date: date.toISOString().split('T')[0],
        ratings: [] as number[],
        count: 0
      }
    })

    feedbackList.forEach(feedback => {
      const feedbackDate = new Date(feedback.created_at)
      feedbackDate.setHours(0, 0, 0, 0)
      const dateStr = feedbackDate.toISOString().split('T')[0]
      const dayData = last30Days.find(d => d.date === dateStr)
      if (dayData) {
        dayData.ratings.push(feedback.rating)
        dayData.count += 1
      }
    })

    return last30Days.map(day => ({
      date: new Date(day.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
      averageRating: day.ratings.length > 0 
        ? day.ratings.reduce((a, b) => a + b, 0) / day.ratings.length 
        : 0,
      feedbackCount: day.count
    }))
  }, [feedbackList])

  // Calculate rating distribution
  const ratingDistribution = useMemo(() => {
    const distribution = Array.from({ length: 5 }, (_, i) => ({
      rating: i + 1,
      count: 0
    }))

    feedbackList.forEach(feedback => {
      if (feedback.rating >= 1 && feedback.rating <= 5) {
        distribution[feedback.rating - 1].count += 1
      }
    })

    return distribution
  }, [feedbackList])

  // Calculate common keywords
  const commonKeywords = useMemo(() => {
    const keywordMap = new Map<string, number>()
    const stopWords = new Set([
      'and', 'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 
      'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has',
      'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'can',
      'may', 'might', 'must', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
      'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were',
      'my', 'your', 'his', 'her', 'its', 'our', 'their', 'me', 'him', 'her',
      'us', 'them', 'what', 'which', 'who', 'whom', 'whose', 'where', 'when',
      'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most',
      'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same',
      'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don',
      'should', 'now'
    ])

    feedbackList.forEach(feedback => {
      const words = feedback.content.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => 
          word.length > 2 && 
          !stopWords.has(word) &&
          !/\d/.test(word)
        )

      words.forEach(word => {
        keywordMap.set(word, (keywordMap.get(word) || 0) + 1)
      })
    })

    return Array.from(keywordMap.entries())
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }, [feedbackList])

  useEffect(() => {
    fetchFeedback()
  }, [])

  const fetchFeedback = async () => {
    try {
      let query = supabase
        .from("feedback")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })

      if (filterRating) {
        query = query.eq("rating", filterRating)
      }

      const { data, error } = await query

      if (error) throw error
      
      setFeedbackList(data || [])
      
    } catch (error) {
      console.error("Error fetching feedback:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteFeedback = async (feedbackId: string) => {
    if (!confirm("Delete this feedback?")) return

    setIsDeleting(feedbackId)
    try {
      const { error } = await supabase
        .from("feedback")
        .delete()
        .eq("id", feedbackId)

      if (error) throw error

      // Remove from local state
      setFeedbackList(prev => prev.filter(f => f.id !== feedbackId))
      
    } catch (error) {
      console.error("Error deleting feedback:", error)
      alert("Error deleting feedback")
    } finally {
      setIsDeleting(null)
    }
  }

  const filteredFeedback = useMemo(() => {
    if (filterRating === null) return feedbackList
    return feedbackList.filter(f => f.rating === filterRating)
  }, [feedbackList, filterRating])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold font-montserrat">{initialProject.name}</h1>
            <p className="text-sm text-muted-foreground">Feedback Dashboard</p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Project Stats Cards - REAL DATA */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Feedback</p>
                  <p className="text-2xl font-bold">{stats.totalFeedback}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Last Feedback</p>
                  <p className="text-lg font-semibold">
                    {stats.lastFeedback 
                      ? new Date(stats.lastFeedback).toLocaleDateString('en-US')
                      : 'No feedback yet'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">
                      {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '0.0'}
                    </p>
                    <span className="text-sm text-muted-foreground">/5</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Overall Mood</p>
                  <p className={`text-lg font-semibold ${getSentimentColor(stats.sentimentScore)}`}>
                    {getSentimentLabel(stats.sentimentScore)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Rating Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Rating Trend (Last 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" domain={[0, 5]} />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'averageRating') return [`${Number(value).toFixed(1)}`, 'Average Rating']
                        return [value, 'Feedback Count']
                      }}
                    />
                    <Bar 
                      yAxisId="right"
                      dataKey="feedbackCount" 
                      fill="#8884d8" 
                      name="Feedback Count"
                      radius={[2, 2, 0, 0]}
                    />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="averageRating" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Average Rating"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Rating Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Rating Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={ratingDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ rating, percent }) => `${rating}★ (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="rating"
                    >
                      {ratingDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name, props) => [
                        value, 
                        `Rating ${props.payload.rating}★`
                      ]}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Common Keywords */}
        {commonKeywords.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Frequently Mentioned Keywords</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {commonKeywords.map(({ keyword, count }) => (
                  <span
                    key={keyword}
                    className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm flex items-center gap-1"
                  >
                    {keyword}
                    <span className="text-xs opacity-75">({count})</span>
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Feedback List */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold font-montserrat">
              Feedback ({filteredFeedback.length})
              {filterRating && ` - Rating ${filterRating}★`}
            </h2>
            
            {/* Rating Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(rating => (
                  <Button
                    key={rating}
                    variant={filterRating === rating ? "default" : "outline"}
                    size="sm"
                    className="gap-1"
                    onClick={() => setFilterRating(filterRating === rating ? null : rating)}
                  >
                    <Star className={`w-3 h-3 ${rating <= 3 ? 'text-yellow-500' : 'text-emerald-500'}`} />
                    {rating}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filteredFeedback.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">
                  {filterRating 
                    ? `No feedback with ${filterRating}★ rating` 
                    : "No feedback yet. Share the project link to collect feedback!"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFeedback.map((feedback) => (
                <Card
                  key={feedback.id}
                  className="hover:shadow-lg transition-shadow border-l-4 group relative"
                  style={{
                    borderLeftColor: feedback.rating >= 4 ? "#10b981" : feedback.rating >= 3 ? "#f59e0b" : "#ef4444",
                  }}
                >
                  {/* Delete Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900"
                    onClick={() => handleDeleteFeedback(feedback.id)}
                    disabled={isDeleting === feedback.id}
                  >
                    {isDeleting === feedback.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>

                  <CardHeader className="pb-3 pr-10">
                    <div className="space-y-3">
                      <div>
                        <p className="font-semibold text-sm font-montserrat">
                          {feedback.name || "Anonymous"}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < feedback.rating 
                                  ? feedback.rating >= 4 
                                    ? 'fill-emerald-400 text-emerald-400' 
                                    : feedback.rating >= 3 
                                    ? 'fill-yellow-400 text-yellow-400' 
                                    : 'fill-red-400 text-red-400'
                                  : 'text-gray-300 dark:text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                        <span className={`text-sm font-semibold ${getRatingColor(feedback.rating)}`}>
                          {getRatingLabel(feedback.rating)}
                        </span>
                      </div>

                      {/* Date */}
                      <p className="text-xs text-muted-foreground">
                        {new Date(feedback.created_at).toLocaleDateString('en-US')} at{" "}
                        {new Date(feedback.created_at).toLocaleTimeString('en-US', { 
                          hour: "2-digit", 
                          minute: "2-digit" 
                        })}
                      </p>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                      {feedback.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
