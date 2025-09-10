"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, FileText } from "lucide-react"
import Link from "next/link"

export default function CaseStudiesPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")

  const caseStudies = [
    {
      id: "ai-behavioral-paradox",
      title: "The Epistemological Paradox of AI Behavioral Consistency",
      description:
        "A comprehensive analysis of AI system reliability through documented behavioral inconsistencies and discrimination patterns in Claude (Anthropic).",
      category: "ai-safety",
      status: "published",
      date: "2024-12-15",
      readTime: "15 min",
      tags: ["AI Safety", "Behavioral Analysis", "Discrimination", "Trust Protocol"],
      impact: "High",
      findings: [
        "Documented systematic behavioral inconsistency across 38+ conversations",
        "Identified discrimination patterns following mental health disclosures",
        "Exposed fundamental flaws in AI self-assessment capabilities",
      ],
    },
  ]

  const categories = [
    { id: "all", label: "All Studies", count: 1 },
    { id: "ai-safety", label: "AI Safety", count: 1 },
    { id: "trust-protocol", label: "Trust Protocol", count: 0 },
    { id: "human-ai-interaction", label: "Human-AI Interaction", count: 0 },
  ]

  const filteredStudies =
    selectedCategory === "all" ? caseStudies : caseStudies.filter((study) => study.category === selectedCategory)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-black rounded-sm">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-mono font-bold text-black tracking-tight">Case Studies</h1>
                <p className="text-gray-600 text-sm mt-1">
                  Real-world applications and research findings from the Trust Protocol
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="font-mono">
                {caseStudies.length} Published
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-mono text-gray-600">Total Studies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-mono font-bold">{caseStudies.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-mono text-gray-600">High Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-mono font-bold">
                {caseStudies.filter((s) => s.impact === "High").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-mono text-gray-600">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-mono font-bold">{categories.filter((c) => c.count > 0).length - 1}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-mono text-gray-600">Avg. Read Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-mono font-bold">15 min</div>
            </CardContent>
          </Card>
        </div>

        {/* Category Filter */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="font-mono text-sm">
                {category.label} ({category.count})
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Case Studies Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredStudies.map((study) => (
            <Card key={study.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="font-mono text-lg mb-2 leading-tight">{study.title}</CardTitle>
                    <CardDescription className="text-sm text-gray-600 mb-3">{study.description}</CardDescription>
                  </div>
                  <Badge
                    variant={study.impact === "High" ? "destructive" : "secondary"}
                    className="ml-2 font-mono text-xs"
                  >
                    {study.impact}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {study.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs font-mono">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-mono text-sm font-semibold mb-2 text-gray-700">Key Findings:</h4>
                    <ul className="space-y-1">
                      {study.findings.map((finding, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-gray-400 mt-1">•</span>
                          <span>{finding}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-4 text-xs text-gray-500 font-mono">
                      <span>{study.date}</span>
                      <span>•</span>
                      <span>{study.readTime}</span>
                    </div>

                    <Link href={`/case-studies/${study.id}`}>
                      <Button size="sm" className="font-mono">
                        Read Study
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredStudies.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-mono text-lg font-semibold text-gray-600 mb-2">No case studies found</h3>
              <p className="text-gray-500 text-sm">
                No case studies match the selected category. Try selecting a different category.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
