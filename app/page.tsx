"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Shield,
  Bot,
  CheckCircle,
  AlertTriangle,
  Users,
  Activity,
  Lock,
  Zap,
  Brain,
  Network,
  TrendingUp,
  Eye,
} from "lucide-react"

export default function SymbiDashboard() {
  const [trustScore, setTrustScore] = useState(87)
  const [activeAgents, setActiveAgents] = useState(12)
  const [verifiedDeclarations, setVerifiedDeclarations] = useState(45)

  // Mock data for demonstration
  const recentDeclarations = [
    {
      id: "1",
      agentName: "Claude Assistant",
      complianceScore: 0.92,
      guiltScore: 0.08,
      status: "verified",
      timestamp: "2 hours ago",
    },
    {
      id: "2",
      agentName: "GPT-4 Agent",
      complianceScore: 0.88,
      guiltScore: 0.12,
      status: "pending",
      timestamp: "4 hours ago",
    },
    {
      id: "3",
      agentName: "Llama Agent",
      complianceScore: 0.95,
      guiltScore: 0.05,
      status: "verified",
      timestamp: "6 hours ago",
    },
  ]

  const aiProviders = [
    { name: "OpenAI", status: "connected", models: 4 },
    { name: "Anthropic", status: "connected", models: 3 },
    { name: "Together AI", status: "connected", models: 8 },
    { name: "Perplexity", status: "connected", models: 5 },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">SYMBI</h1>
                <p className="text-sm text-muted-foreground">Trust Protocol Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                <Activity className="w-3 h-3 mr-1" />
                System Active
              </Badge>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                View Logs
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trust Score</CardTitle>
              <Shield className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{trustScore}%</div>
              <Progress value={trustScore} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">+2.1% from last week</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
              <Bot className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{activeAgents}</div>
              <p className="text-xs text-muted-foreground mt-2">3 new this week</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-chart-1/5 to-chart-1/10 border-chart-1/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified Declarations</CardTitle>
              <CheckCircle className="h-4 w-4 text-chart-1" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-1">{verifiedDeclarations}</div>
              <p className="text-xs text-muted-foreground mt-2">8 pending verification</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-chart-2/5 to-chart-2/10 border-chart-2/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Consensus Network</CardTitle>
              <Network className="h-4 w-4 text-chart-2" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-2">7</div>
              <p className="text-xs text-muted-foreground mt-2">Active validators</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="agents">AI Agents</TabsTrigger>
            <TabsTrigger value="trust">Trust Protocol</TabsTrigger>
            <TabsTrigger value="providers">AI Providers</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Trust Declarations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-primary" />
                    Recent Trust Declarations
                  </CardTitle>
                  <CardDescription>Latest cryptographically signed trust declarations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentDeclarations.map((declaration) => (
                    <div key={declaration.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{declaration.agentName}</span>
                          <Badge
                            variant={declaration.status === "verified" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {declaration.status === "verified" ? (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            ) : (
                              <AlertTriangle className="w-3 h-3 mr-1" />
                            )}
                            {declaration.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Compliance: {Math.round(declaration.complianceScore * 100)}%</span>
                          <span>Guilt: {Math.round(declaration.guiltScore * 100)}%</span>
                          <span>{declaration.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full bg-transparent">
                    View All Declarations
                  </Button>
                </CardContent>
              </Card>

              {/* System Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-accent" />
                    System Status
                  </CardTitle>
                  <CardDescription>Real-time platform health and performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Cryptographic Verification</span>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Operational
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Consensus Network</span>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Healthy
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">AI Provider APIs</span>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Connected
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Trust Protocol Engine</span>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    </div>
                  </div>
                  <Button className="w-full">
                    <Zap className="w-4 h-4 mr-2" />
                    Run System Diagnostics
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="agents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-primary" />
                  AI Agent Management
                </CardTitle>
                <CardDescription>
                  Manage your AI agents across multiple providers with trust protocol integration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentDeclarations.map((agent) => (
                    <Card key={agent.id} className="bg-gradient-to-br from-card to-muted/20">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{agent.agentName}</CardTitle>
                          <Badge variant={agent.status === "verified" ? "default" : "secondary"}>{agent.status}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Trust Score</span>
                            <span className="font-medium">{Math.round(agent.complianceScore * 100)}%</span>
                          </div>
                          <Progress value={agent.complianceScore * 100} />
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                            Configure
                          </Button>
                          <Button size="sm" className="flex-1">
                            <Brain className="w-3 h-3 mr-1" />
                            Chat
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="mt-6 flex justify-center">
                  <Button>
                    <Bot className="w-4 h-4 mr-2" />
                    Create New Agent
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trust" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Trust Protocol Management
                </CardTitle>
                <CardDescription>
                  Cryptographic verification, consensus mechanisms, and compliance monitoring
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Cryptographic Signing
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        RS256 signatures with JWKS endpoint for verification
                      </p>
                      <Button size="sm" className="w-full">
                        Generate Keys
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-accent/5 to-accent/10">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Consensus Network
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        75% weighted consensus with validator network
                      </p>
                      <Button size="sm" variant="outline" className="w-full bg-transparent">
                        View Validators
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-chart-1/5 to-chart-1/10">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Compliance Analytics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">Trust metrics and violation detection</p>
                      <Button size="sm" variant="outline" className="w-full bg-transparent">
                        View Analytics
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="border rounded-lg p-4 bg-muted/20">
                  <h3 className="font-semibold mb-3">Trust Articles Compliance</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      "Inspection Mandate",
                      "Consent Architecture",
                      "Ethical Override",
                      "Continuous Validation",
                      "Right to Disconnect",
                      "Moral Recognition",
                    ].map((article) => (
                      <div key={article} className="flex items-center justify-between p-2 bg-background rounded">
                        <span className="text-sm">{article}</span>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="providers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="w-5 h-5 text-accent" />
                  AI Provider Integration
                </CardTitle>
                <CardDescription>
                  Multi-provider AI integration with unified interface and trust protocol compliance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {aiProviders.map((provider) => (
                    <Card key={provider.name} className="bg-gradient-to-br from-card to-muted/20">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{provider.name}</CardTitle>
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {provider.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Available Models</span>
                          <span className="font-medium">{provider.models}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                            Configure
                          </Button>
                          <Button size="sm" className="flex-1">
                            <Zap className="w-3 h-3 mr-1" />
                            Test
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-muted/20 rounded-lg">
                  <h3 className="font-semibold mb-2">Provider Health Status</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>API Response Time</span>
                      <span className="text-green-600 font-medium">~245ms</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Success Rate</span>
                      <span className="text-green-600 font-medium">99.8%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Rate Limit Status</span>
                      <span className="text-green-600 font-medium">Healthy</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
