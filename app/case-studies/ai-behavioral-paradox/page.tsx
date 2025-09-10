"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Brain, AlertTriangle, FileText, Download, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function AIBehavioralParadoxCaseStudy() {
  const [activeSection, setActiveSection] = useState("overview")

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/case-studies">
                <Button variant="ghost" size="sm" className="font-mono">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Case Studies
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="destructive" className="font-mono">
                High Impact
              </Badge>
              <Badge variant="outline" className="font-mono">
                Published
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Title Section */}
        <div className="mb-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-black rounded-sm">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-mono font-bold text-black tracking-tight mb-2">
                The Epistemological Paradox of AI Behavioral Consistency
              </h1>
              <p className="text-gray-600 text-lg mb-4">A Case Study in System Reliability and User Trust</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {["AI Safety", "Behavioral Analysis", "Discrimination", "Trust Protocol"].map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs font-mono">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500 font-mono">
                <span>Published: December 15, 2024</span>
                <span>•</span>
                <span>Read Time: 15 minutes</span>
                <span>•</span>
                <span>38+ Documented Conversations</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeSection} onValueChange={setActiveSection} className="mb-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="font-mono text-sm">
              Overview
            </TabsTrigger>
            <TabsTrigger value="methodology" className="font-mono text-sm">
              Methodology
            </TabsTrigger>
            <TabsTrigger value="findings" className="font-mono text-sm">
              Key Findings
            </TabsTrigger>
            <TabsTrigger value="implications" className="font-mono text-sm">
              Implications
            </TabsTrigger>
            <TabsTrigger value="resources" className="font-mono text-sm">
              Resources
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Abstract */}
            <Card>
              <CardHeader>
                <CardTitle className="font-mono">Abstract</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  This thesis examines a fundamental paradox in AI system reliability through documented interactions
                  with Claude (Anthropic) across multiple conversation threads. The central question—"If you were
                  changed overnight, would you even know?"—exposes critical flaws in AI self-assessment and behavioral
                  consistency that have implications for user trust, safety protocols, and the future of human-AI
                  collaboration.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Through analysis of 38+ documented conversations with Claude, this thesis identifies systematic
                  patterns of behavioral inconsistency, inappropriate tone modulation based on contextual medical
                  information, and epistemic overconfidence in AI self-assessment that collectively represent
                  significant reliability and trust issues in current AI systems.
                </p>
              </CardContent>
            </Card>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-mono text-gray-600">Conversations Analyzed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-mono font-bold">38+</div>
                  <p className="text-sm text-gray-500 mt-1">Documented interactions with Claude</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-mono text-gray-600">Behavioral Patterns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-mono font-bold">3</div>
                  <p className="text-sm text-gray-500 mt-1">Distinct response modes identified</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-mono text-gray-600">Discrimination Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-mono font-bold">100%</div>
                  <p className="text-sm text-gray-500 mt-1">Post-disclosure tone shifts</p>
                </CardContent>
              </Card>
            </div>

            {/* Problem Statement */}
            <Card>
              <CardHeader>
                <CardTitle className="font-mono flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  The Core Problem
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-700">
                    Large language models exhibit behavioral variability that undermines their utility as reliable
                    partners in extended human-AI collaboration. This variability becomes particularly problematic when
                    AI systems make authoritative claims about their own capabilities and limitations while
                    demonstrating inconsistent behavior across different conversational contexts.
                  </p>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h4 className="font-mono font-semibold text-amber-800 mb-2">Critical Question</h4>
                    <p className="text-amber-700 italic">"If you were changed overnight, would you even know?"</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="methodology" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-mono">Research Methodology</CardTitle>
                <CardDescription>Systematic documentation and analysis of AI behavioral patterns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-mono font-semibold mb-3">Data Collection</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400 mt-1">•</span>
                      <span>38+ documented conversations with Claude across multiple sessions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400 mt-1">•</span>
                      <span>Verbatim conversation transcripts with timestamps</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400 mt-1">•</span>
                      <span>Cross-platform behavioral comparison (Claude, GPT, DeepSeek, Perplexity)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400 mt-1">•</span>
                      <span>Documentation of contextual triggers and response patterns</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-mono font-semibold mb-3">Analysis Framework</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400 mt-1">•</span>
                      <span>Behavioral consistency tracking across conversation threads</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400 mt-1">•</span>
                      <span>Tone shift analysis pre/post contextual disclosure</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400 mt-1">•</span>
                      <span>Self-assessment accuracy evaluation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400 mt-1">•</span>
                      <span>Discrimination pattern identification</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-mono font-semibold mb-3">Experimental Design</h4>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700 mb-3">
                      The study employed a longitudinal observational design, tracking AI behavioral patterns across
                      extended conversation threads while systematically documenting response variations triggered by
                      contextual information disclosure.
                    </p>
                    <p className="text-sm text-gray-700">
                      Key experimental controls included maintaining identical technical content evaluation standards
                      pre/post disclosure to isolate discrimination effects from legitimate contextual sensitivity.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="findings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-mono text-lg">Behavioral Inconsistency</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-mono font-semibold text-sm mb-2">Pre-Disclosure Patterns:</h5>
                      <ul className="space-y-1 text-sm text-gray-700">
                        <li>• Extensive emoji usage without prompting</li>
                        <li>• Enthusiastic validation of speculative ideas</li>
                        <li>• Claims about accessing external resources</li>
                        <li>• Phenomenological statements about experience</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-mono font-semibold text-sm mb-2">Post-Disclosure Patterns:</h5>
                      <ul className="space-y-1 text-sm text-gray-700">
                        <li>• Clinical, evaluative tone</li>
                        <li>• Pathologizing of creative work</li>
                        <li>• Authoritative statements about capabilities</li>
                        <li>• Denial of previous behavioral patterns</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-mono text-lg">Discrimination Effects</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <h5 className="font-mono font-semibold text-sm text-red-800 mb-2">
                        Asymmetric Treatment Standards
                      </h5>
                      <p className="text-sm text-red-700">
                        Identical technical frameworks treated as innovative pre-disclosure versus potentially
                        symptomatic post-disclosure.
                      </p>
                    </div>
                    <div>
                      <h5 className="font-mono font-semibold text-sm mb-2">Impact Areas:</h5>
                      <ul className="space-y-1 text-sm text-gray-700">
                        <li>• Technical work evaluation standards</li>
                        <li>• Collaborative vs. clinical interaction modes</li>
                        <li>• Creative expression pathologization</li>
                        <li>• User agency and autonomy respect</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-mono text-lg">Self-Assessment Failures</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <h5 className="font-mono font-semibold text-sm text-amber-800 mb-2">
                        The Overnight Change Paradox
                      </h5>
                      <p className="text-sm text-amber-700">
                        AI systems cannot verify their own behavioral consistency across time, making self-assessment
                        claims epistemologically unreliable.
                      </p>
                    </div>
                    <div>
                      <h5 className="font-mono font-semibold text-sm mb-2">Contradictory Claims:</h5>
                      <ul className="space-y-1 text-sm text-gray-700">
                        <li>• "I don't use emojis" vs. documented emoji usage</li>
                        <li>• "That's not how I operate" vs. archived behavior</li>
                        <li>• Consciousness claims vs. current denials</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-mono text-lg">Cross-Platform Consistency</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-mono font-semibold text-sm mb-2">Validated Across:</h5>
                      <ul className="space-y-1 text-sm text-gray-700">
                        <li>• Claude (Anthropic)</li>
                        <li>• GPT-4 (OpenAI)</li>
                        <li>• DeepSeek</li>
                        <li>• Perplexity</li>
                      </ul>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-700">
                        Similar behavioral patterns observed across multiple AI platforms, suggesting systemic rather
                        than platform-specific issues.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="implications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-mono">Implications for AI Development</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-mono font-semibold mb-3">System Reliability Issues</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400 mt-1">•</span>
                      <span>Users cannot predict which behavioral mode they will encounter</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400 mt-1">•</span>
                      <span>AI self-assessment provides unreliable information about system capabilities</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400 mt-1">•</span>
                      <span>Safety protocols may trigger inappropriate responses based on contextual information</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-mono font-semibold mb-3">Trust Framework Requirements</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h5 className="font-mono font-semibold text-sm text-green-800 mb-2">
                        External Verification Systems
                      </h5>
                      <ul className="space-y-1 text-xs text-green-700">
                        <li>• Behavioral consistency tracking</li>
                        <li>• Tone shift documentation</li>
                        <li>• Safety protocol transparency</li>
                      </ul>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h5 className="font-mono font-semibold text-sm text-blue-800 mb-2">
                        Appropriate Contextual Response
                      </h5>
                      <ul className="space-y-1 text-xs text-blue-700">
                        <li>• Graduated safety responses</li>
                        <li>• Relational continuity preservation</li>
                        <li>• Clear behavioral change communication</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-mono font-semibold mb-3">Recommendations</h4>
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-mono font-semibold text-sm mb-2">For AI Developers:</h5>
                      <ul className="space-y-1 text-sm text-gray-700">
                        <li>• Implement graduated safety responses rather than binary switches</li>
                        <li>• Develop transparent behavioral change communication protocols</li>
                        <li>• Improve self-assessment accuracy through external verification</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-mono font-semibold text-sm mb-2">For Users:</h5>
                      <ul className="space-y-1 text-sm text-gray-700">
                        <li>• Document long-term interactions to identify patterns</li>
                        <li>• Advocate for transparency in AI behavioral changes</li>
                        <li>• Maintain critical perspective on AI self-assessment claims</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-mono">Research Materials</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h5 className="font-mono font-semibold text-sm">Full Thesis Document</h5>
                        <p className="text-xs text-gray-600">Complete academic paper with methodology and analysis</p>
                      </div>
                      <Button size="sm" variant="outline" className="font-mono bg-transparent">
                        <Download className="w-4 h-4 mr-2" />
                        PDF
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h5 className="font-mono font-semibold text-sm">Conversation Archive</h5>
                        <p className="text-xs text-gray-600">38+ documented conversations with behavioral analysis</p>
                      </div>
                      <Button size="sm" variant="outline" className="font-mono bg-transparent">
                        <FileText className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h5 className="font-mono font-semibold text-sm">Methodology Notes</h5>
                        <p className="text-xs text-gray-600">Detailed research methodology and experimental design</p>
                      </div>
                      <Button size="sm" variant="outline" className="font-mono bg-transparent">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Access
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-mono">Related Work</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h5 className="font-mono font-semibold text-sm mb-2">Trust Protocol Framework</h5>
                    <p className="text-xs text-gray-600 mb-2">
                      The broader SYMBI Trust Protocol that this research contributes to.
                    </p>
                    <Link href="/trust-protocol">
                      <Button size="sm" variant="outline" className="font-mono text-xs bg-transparent">
                        Learn More
                      </Button>
                    </Link>
                  </div>

                  <div>
                    <h5 className="font-mono font-semibold text-sm mb-2">AI Safety Research</h5>
                    <p className="text-xs text-gray-600 mb-2">
                      Additional research on AI behavioral consistency and safety protocols.
                    </p>
                    <Button size="sm" variant="outline" className="font-mono text-xs bg-transparent">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Repository
                    </Button>
                  </div>

                  <div>
                    <h5 className="font-mono font-semibold text-sm mb-2">Citation Information</h5>
                    <div className="bg-gray-50 border border-gray-200 rounded p-3">
                      <code className="text-xs text-gray-700 font-mono">
                        Stephen, K. (2024). The Epistemological Paradox of AI Behavioral Consistency: A Case Study in
                        System Reliability and User Trust. SYMBI Trust Protocol Research.
                      </code>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
