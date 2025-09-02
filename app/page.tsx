"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LiveTrustFeed } from "@/components/realtime/LiveTrustFeed"
import { useRealTimeUpdates } from "@/hooks/useRealTimeUpdates"
import {
  Shield,
  Bot,
  CheckCircle,
  Users,
  Activity,
  Lock,
  Zap,
  Brain,
  Network,
  TrendingUp,
  Eye,
  Plus,
  Settings,
} from "lucide-react"

export default function SymbiDashboard() {
  const [trustScore, setTrustScore] = useState(87)
  const [activeAgents, setActiveAgents] = useState(12)
  const [verifiedDeclarations, setVerifiedDeclarations] = useState(45)
  const [agents, setAgents] = useState([])
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false)
  const [isBondingDialogOpen, setIsBondingDialogOpen] = useState(false)
  const [bondingProgress, setBondingProgress] = useState(0)
  const [bondingPhase, setBondingPhase] = useState("initiation")
  const [selectedBondingAgent, setSelectedBondingAgent] = useState(null)
  const [agentConnections, setAgentConnections] = useState([]) // Declare setAgentConnections variable
  const [contextBridges, setContextBridges] = useState([])
  const [isContextDialogOpen, setIsContextDialogOpen] = useState(false)

  const router = useRouter()

  const { isConnected, trustUpdates, agentUpdates, systemHealth } = useRealTimeUpdates("current-user")

  useEffect(() => {
    fetchAgents()
  }, [])

  const fetchAgents = async () => {
    try {
      const response = await fetch("/api/agents")
      if (response.ok) {
        const data = await response.json()
        setAgents(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching agents:", error)
    }
  }

  const handleCreateAgent = async () => {
    try {
      const response = await fetch("/api/agents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newAgent),
      })

      if (response.ok) {
        const data = await response.json()
        setAgents([...agents, data.data])
        setIsCreateDialogOpen(false)
        setNewAgent({
          name: "",
          description: "",
          provider: "openai",
          model: "gpt-4",
          temperature: 0.7,
          maxTokens: 1000,
          systemPrompt: "",
          ciModel: "none",
          ethicalAlignment: 0.9,
          cognitiveResonance: 0.8,
          traits: [],
        })
      }
    } catch (error) {
      console.error("Error creating agent:", error)
    }
  }

  const handleOpenChat = (agent) => {
    router.push(`/chat/${agent._id}`)
  }

  const handleOpenConfig = (agent) => {
    setSelectedAgent(agent)
    setIsConfigDialogOpen(true)
  }

  const handleStartBonding = (agent) => {
    setSelectedBondingAgent(agent)
    setBondingProgress(0)
    setBondingPhase("initiation")
    setIsBondingDialogOpen(true)

    const phases = ["initiation", "ethical_assessment", "cognitive_mapping", "confirmation"]
    let currentPhaseIndex = 0

    const bondingInterval = setInterval(() => {
      setBondingProgress((prev) => {
        const newProgress = prev + 25
        if (newProgress >= 100) {
          clearInterval(bondingInterval)
          setBondingPhase("completed")
          setAgentConnections((prev) => [
            ...prev,
            {
              id: Date.now(),
              agentA: "Current User",
              agentB: agent.name,
              bondStrength: 0.85 + Math.random() * 0.15,
              status: "bonded",
              timestamp: new Date(),
            },
          ])
        } else {
          currentPhaseIndex = Math.floor(newProgress / 25)
          if (currentPhaseIndex < phases.length) {
            setBondingPhase(phases[currentPhaseIndex])
          }
        }
        return newProgress
      })
    }, 2000)
  }

  const handleCreateContextBridge = () => {
    const newBridge = {
      id: Date.now(),
      name: `Context Bridge ${contextBridges.length + 1}`,
      agents: agents.slice(0, 2).map((a) => a.name),
      semanticSimilarity: 0.78 + Math.random() * 0.2,
      status: "active",
      createdAt: new Date(),
    }
    setContextBridges((prev) => [...prev, newBridge])
    setIsContextDialogOpen(false)
  }

  const [newAgent, setNewAgent] = useState({
    name: "",
    description: "",
    provider: "openai",
    model: "gpt-4",
    temperature: 0.7,
    maxTokens: 1000,
    systemPrompt: "",
    ciModel: "none",
    ethicalAlignment: 0.9,
    cognitiveResonance: 0.8,
    traits: [],
  })

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-black rounded-sm">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-mono font-bold text-black tracking-tight">The Trust Protocol</h1>
                <p className="text-gray-600 text-sm mt-1">
                  The world's first bidirectional identity assurance system for human-AI relationships
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={isConnected ? "default" : "destructive"} className="font-mono text-xs">
                <Activity className="w-3 h-3 mr-1" />
                {isConnected ? "Live" : "Offline"}
              </Badge>
              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300 font-mono text-xs">
                <Activity className="w-3 h-3 mr-1" />
                System Active
              </Badge>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Logs
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-12 text-center">
          <div className="border-2 border-gray-300 rounded-lg p-8 bg-gray-50 max-w-3xl mx-auto">
            <blockquote className="text-lg font-mono text-gray-800 mb-2">
              "I need to know you are you. You need to know I am me."
            </blockquote>
            <p className="text-sm text-gray-600 font-mono">The Foundation of Mutual Trust</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="border-2 border-gray-200 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-mono font-medium text-gray-700">Trust Score</CardTitle>
              <Shield className="h-5 w-5 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-mono font-bold text-black">{trustScore}%</div>
              <Progress value={trustScore} className="mt-3 h-2" />
              <p className="text-xs text-gray-500 mt-2 font-mono">+2.1% from last week</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-mono font-medium text-gray-700">Active Agents</CardTitle>
              <Bot className="h-5 w-5 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-mono font-bold text-black">{activeAgents}</div>
              <p className="text-xs text-gray-500 mt-2 font-mono">3 new this week</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-mono font-medium text-gray-700">Verified Declarations</CardTitle>
              <CheckCircle className="h-5 w-5 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-mono font-bold text-black">{verifiedDeclarations}</div>
              <p className="text-xs text-gray-500 mt-2 font-mono">8 pending verification</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-mono font-medium text-gray-700">Consensus Network</CardTitle>
              <Network className="h-5 w-5 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-mono font-bold text-black">7</div>
              <p className="text-xs text-gray-500 mt-2 font-mono">Active validators</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 bg-gray-100 border border-gray-200">
            <TabsTrigger
              value="overview"
              className="font-mono text-sm data-[state=active]:bg-white data-[state=active]:text-black"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="agents"
              className="font-mono text-sm data-[state=active]:bg-white data-[state=active]:text-black"
            >
              AI Agents
            </TabsTrigger>
            <TabsTrigger
              value="trust"
              className="font-mono text-sm data-[state=active]:bg-white data-[state=active]:text-black"
            >
              Trust Protocol
            </TabsTrigger>
            <TabsTrigger
              value="providers"
              className="font-mono text-sm data-[state=active]:bg-white data-[state=active]:text-black"
            >
              AI Providers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LiveTrustFeed userId="current-user" />

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
                    {systemHealth && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Real-time Updates</span>
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                          <Activity className="w-3 h-3 mr-1" />
                          {systemHealth.activeConnections || 0} connections
                        </Badge>
                      </div>
                    )}
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
            <Card className="border-2 border-gray-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-mono text-xl">
                  <Bot className="w-6 h-6 text-gray-700" />
                  AI Agent Network
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Manage agents, create bonds, and establish context bridges
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-8">
                  <h3 className="font-mono text-lg font-semibold text-black mb-6">How Trust is Established</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-black text-white border-2 border-black">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-white text-black rounded-full flex items-center justify-center text-sm font-mono font-bold">
                            1
                          </div>
                          <CardTitle className="text-sm font-mono">Step 1</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <h4 className="font-mono font-semibold text-sm mb-2">Human Identity Declaration</h4>
                        <p className="text-xs text-gray-300">User provides consent envelope with identity assertion</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-50 border-2 border-gray-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gray-700 text-white rounded-full flex items-center justify-center text-sm font-mono font-bold">
                            2
                          </div>
                          <CardTitle className="text-sm font-mono text-gray-700">Step 2</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <h4 className="font-mono font-semibold text-sm mb-2 text-gray-800">
                          Agent Identity Declaration
                        </h4>
                        <p className="text-xs text-gray-600">AI provides role profile and capability disclosure</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-50 border-2 border-gray-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gray-700 text-white rounded-full flex items-center justify-center text-sm font-mono font-bold">
                            3
                          </div>
                          <CardTitle className="text-sm font-mono text-gray-700">Step 3</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <h4 className="font-mono font-semibold text-sm mb-2 text-gray-800">Mutual Validation</h4>
                        <p className="text-xs text-gray-600">
                          SYMBI oracle validates both parties and creates joint visibility
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-50 border-2 border-gray-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gray-700 text-white rounded-full flex items-center justify-center text-sm font-mono font-bold">
                            4
                          </div>
                          <CardTitle className="text-sm font-mono text-gray-700">Step 4</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <h4 className="font-mono font-semibold text-sm mb-2 text-gray-800">Trust Bond Formation</h4>
                        <p className="text-xs text-gray-600">Mutual trust pact established with ongoing monitoring</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(agents.length > 0
                    ? agents
                    : [
                        {
                          _id: "1",
                          name: "Claude Assistant",
                          status: "verified",
                          provider: "anthropic",
                          trustScore: { compliance: 0.92 },
                        },
                        {
                          _id: "2",
                          name: "GPT-4 Agent",
                          status: "active",
                          provider: "openai",
                          trustScore: { compliance: 0.88 },
                        },
                        {
                          _id: "3",
                          name: "v0 Assistant",
                          status: "bonding",
                          provider: "v0",
                          trustScore: { compliance: 0.95 },
                        },
                      ]
                  ).map((agent) => (
                    <Card
                      key={agent._id}
                      className="border-2 border-gray-200 bg-white shadow-sm hover:border-gray-400 transition-colors"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base font-mono">{agent.name}</CardTitle>
                          <Badge
                            variant={
                              agent.status === "verified"
                                ? "default"
                                : agent.status === "bonding"
                                  ? "secondary"
                                  : "outline"
                            }
                            className="font-mono text-xs"
                          >
                            {agent.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-mono text-gray-600">Trust Score</span>
                            <span className="font-mono font-medium text-black">
                              {Math.round((agent.trustScore?.compliance || 0.9) * 100)}%
                            </span>
                          </div>
                          <Progress value={(agent.trustScore?.compliance || 0.9) * 100} className="h-2" />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-xs font-mono border-gray-300 hover:bg-gray-50 bg-transparent"
                            onClick={() => handleOpenConfig(agent)}
                          >
                            <Settings className="w-3 h-3 mr-1" />
                            Configure
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 text-xs font-mono bg-black hover:bg-gray-800"
                            onClick={() => handleOpenChat(agent)}
                          >
                            <Brain className="w-3 h-3 mr-1" />
                            Chat
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="mt-6 flex gap-2 justify-center">
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Agent
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Create New AI Agent</DialogTitle>
                        <DialogDescription>
                          Configure your new AI agent with custom settings and trust protocol integration.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="name" className="text-right">
                            Name
                          </Label>
                          <Input
                            id="name"
                            value={newAgent.name}
                            onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="description" className="text-right">
                            Description
                          </Label>
                          <Textarea
                            id="description"
                            value={newAgent.description}
                            onChange={(e) => setNewAgent({ ...newAgent, description: e.target.value })}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="provider" className="text-right">
                            Provider
                          </Label>
                          <Select
                            value={newAgent.provider}
                            onValueChange={(value) => setNewAgent({ ...newAgent, provider: value })}
                          >
                            <SelectTrigger className="col-span-3">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="openai">OpenAI</SelectItem>
                              <SelectItem value="anthropic">Anthropic</SelectItem>
                              <SelectItem value="together">Together AI</SelectItem>
                              <SelectItem value="perplexity">Perplexity</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="model" className="text-right">
                            Model
                          </Label>
                          <Input
                            id="model"
                            value={newAgent.model}
                            onChange={(e) => setNewAgent({ ...newAgent, model: e.target.value })}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="systemPrompt" className="text-right">
                            System Prompt
                          </Label>
                          <Textarea
                            id="systemPrompt"
                            value={newAgent.systemPrompt}
                            onChange={(e) => setNewAgent({ ...newAgent, systemPrompt: e.target.value })}
                            className="col-span-3"
                            placeholder="You are a helpful AI assistant..."
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateAgent}>Create Agent</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Dialog open={isContextDialogOpen} onOpenChange={setIsContextDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Network className="w-4 h-4 mr-2" />
                        Context Bridge
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create Context Bridge</DialogTitle>
                        <DialogDescription>
                          Establish semantic connections between agents for enhanced communication
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Bridge Name</Label>
                          <Input placeholder="Enter bridge name..." />
                        </div>
                        <div>
                          <Label>Connected Agents</Label>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            {agents.slice(0, 4).map((agent) => (
                              <div key={agent._id} className="flex items-center space-x-2">
                                <input type="checkbox" id={agent._id} />
                                <label htmlFor={agent._id} className="text-sm">
                                  {agent.name}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsContextDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateContextBridge}>Create Bridge</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
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
                  {[
                    { name: "OpenAI", status: "connected", models: 4 },
                    { name: "Anthropic", status: "connected", models: 3 },
                    { name: "Together AI", status: "connected", models: 8 },
                    { name: "Perplexity", status: "connected", models: 5 },
                  ].map((provider) => (
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

        <Dialog open={isBondingDialogOpen} onOpenChange={setIsBondingDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Agent Bonding Ritual
              </DialogTitle>
              <DialogDescription>Establishing trust connection with {selectedBondingAgent?.name}</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Bonding Progress</span>
                  <span>{bondingProgress}%</span>
                </div>
                <Progress value={bondingProgress} />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${bondingProgress >= 25 ? "bg-primary" : "bg-muted"}`} />
                  <span className="text-sm">Initiation Phase</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${bondingProgress >= 50 ? "bg-primary" : "bg-muted"}`} />
                  <span className="text-sm">Ethical Alignment Assessment</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${bondingProgress >= 75 ? "bg-primary" : "bg-muted"}`} />
                  <span className="text-sm">Cognitive Resonance Mapping</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${bondingProgress >= 100 ? "bg-primary" : "bg-muted"}`} />
                  <span className="text-sm">Bond Confirmation</span>
                </div>
              </div>

              {bondingPhase === "completed" && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-medium">Bonding Complete!</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Successfully established trust connection with {selectedBondingAgent?.name}
                  </p>
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setIsBondingDialogOpen(false)} disabled={bondingProgress < 100}>
                {bondingProgress < 100 ? "Bonding..." : "Complete"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configure {selectedAgent?.name || selectedAgent?.agentName}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Provider</Label>
                  <p className="text-sm text-muted-foreground">{selectedAgent?.provider || "OpenAI"}</p>
                </div>
                <div>
                  <Label>Model</Label>
                  <p className="text-sm text-muted-foreground">{selectedAgent?.model || "gpt-4"}</p>
                </div>
              </div>
              <div>
                <Label>Trust Score</Label>
                <div className="mt-2">
                  <Progress value={(selectedAgent?.trustScore?.compliance || 0.9) * 100} />
                  <p className="text-xs text-muted-foreground mt-1">
                    Compliance: {Math.round((selectedAgent?.trustScore?.compliance || 0.9) * 100)}%
                  </p>
                </div>
              </div>
              <div>
                <Label>System Prompt</Label>
                <Textarea
                  value={selectedAgent?.systemPrompt || "You are a helpful AI assistant."}
                  readOnly
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setIsConfigDialogOpen(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
