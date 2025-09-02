"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Play, Square, Trash2, GitBranch, Settings } from "lucide-react"
import type { WorkflowDefinition, WorkflowTask, AgentRole } from "@/lib/agent-orchestrator"

export function WorkflowBuilder() {
  const [workflow, setWorkflow] = useState<Partial<WorkflowDefinition>>({
    name: "",
    description: "",
    agents: [],
    tasks: [],
    dependencies: [],
    triggers: [],
  })
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionId, setExecutionId] = useState<string | null>(null)

  const addTask = () => {
    const newTask: WorkflowTask = {
      id: `task_${Date.now()}`,
      name: "New Task",
      type: "llm_generation",
      requiredCapabilities: [],
      input: {},
      status: "pending",
      retryCount: 0,
      maxRetries: 3,
      timeout: 30000,
    }
    setWorkflow((prev) => ({
      ...prev,
      tasks: [...(prev.tasks || []), newTask],
    }))
  }

  const addAgent = () => {
    const newAgent: AgentRole = {
      agentId: "",
      role: "executor",
      capabilities: [],
      priority: 1,
    }
    setWorkflow((prev) => ({
      ...prev,
      agents: [...(prev.agents || []), newAgent],
    }))
  }

  const executeWorkflow = async () => {
    if (!workflow.id || !workflow.name) {
      alert("Please provide workflow ID and name")
      return
    }

    setIsExecuting(true)
    try {
      // Register workflow first
      await fetch("/api/orchestration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register_workflow",
          data: { workflow: workflow as WorkflowDefinition },
        }),
      })

      // Execute workflow
      const response = await fetch("/api/orchestration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "execute_workflow",
          data: { workflowId: workflow.id, parameters: {} },
        }),
      })

      const result = await response.json()
      if (result.success) {
        setExecutionId(result.data.executionId)
      }
    } catch (error) {
      console.error("Workflow execution failed:", error)
    } finally {
      setIsExecuting(false)
    }
  }

  const updateTask = (taskId: string, updates: Partial<WorkflowTask>) => {
    setWorkflow((prev) => ({
      ...prev,
      tasks: prev.tasks?.map((task) => (task.id === taskId ? { ...task, ...updates } : task)),
    }))
  }

  const removeTask = (taskId: string) => {
    setWorkflow((prev) => ({
      ...prev,
      tasks: prev.tasks?.filter((task) => task.id !== taskId),
    }))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5" />
            Workflow Builder
          </CardTitle>
          <CardDescription>Design and execute multi-agent workflows</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="workflow-id">Workflow ID</Label>
              <Input
                id="workflow-id"
                value={workflow.id || ""}
                onChange={(e) => setWorkflow((prev) => ({ ...prev, id: e.target.value }))}
                placeholder="unique-workflow-id"
              />
            </div>
            <div>
              <Label htmlFor="workflow-name">Workflow Name</Label>
              <Input
                id="workflow-name"
                value={workflow.name || ""}
                onChange={(e) => setWorkflow((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="My Workflow"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="workflow-description">Description</Label>
            <Textarea
              id="workflow-description"
              value={workflow.description || ""}
              onChange={(e) => setWorkflow((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this workflow does..."
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Agents</CardTitle>
              <Button size="sm" onClick={addAgent}>
                <Plus className="w-4 h-4 mr-1" />
                Add Agent
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {workflow.agents?.map((agent, index) => (
              <div key={index} className="p-3 border rounded-lg space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Agent ID"
                    value={agent.agentId}
                    onChange={(e) => {
                      const newAgents = [...(workflow.agents || [])]
                      newAgents[index] = { ...agent, agentId: e.target.value }
                      setWorkflow((prev) => ({ ...prev, agents: newAgents }))
                    }}
                  />
                  <Select
                    value={agent.role}
                    onValueChange={(value: any) => {
                      const newAgents = [...(workflow.agents || [])]
                      newAgents[index] = { ...agent, role: value }
                      setWorkflow((prev) => ({ ...prev, agents: newAgents }))
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="coordinator">Coordinator</SelectItem>
                      <SelectItem value="executor">Executor</SelectItem>
                      <SelectItem value="validator">Validator</SelectItem>
                      <SelectItem value="observer">Observer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-wrap gap-1">
                  {agent.capabilities.map((cap, capIndex) => (
                    <Badge key={capIndex} variant="secondary" className="text-xs">
                      {cap}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
            {workflow.agents?.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No agents added yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Tasks</CardTitle>
              <Button size="sm" onClick={addTask}>
                <Plus className="w-4 h-4 mr-1" />
                Add Task
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {workflow.tasks?.map((task) => (
              <div key={task.id} className="p-3 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <Input
                    value={task.name}
                    onChange={(e) => updateTask(task.id, { name: e.target.value })}
                    className="flex-1 mr-2"
                  />
                  <Button size="sm" variant="outline" onClick={() => removeTask(task.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                <Select value={task.type} onValueChange={(value: any) => updateTask(task.id, { type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="llm_generation">LLM Generation</SelectItem>
                    <SelectItem value="data_processing">Data Processing</SelectItem>
                    <SelectItem value="validation">Validation</SelectItem>
                    <SelectItem value="coordination">Coordination</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                <Badge variant={task.status === "completed" ? "default" : "secondary"}>{task.status}</Badge>
              </div>
            ))}
            {workflow.tasks?.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No tasks added yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Execution Control</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={executeWorkflow} disabled={isExecuting || !workflow.id}>
              <Play className="w-4 h-4 mr-2" />
              {isExecuting ? "Executing..." : "Execute Workflow"}
            </Button>
            <Button variant="outline" disabled={!executionId}>
              <Square className="w-4 h-4 mr-2" />
              Stop Execution
            </Button>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Advanced Settings
            </Button>
          </div>
          {executionId && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm">
                <strong>Execution ID:</strong> {executionId}
              </p>
              <p className="text-sm text-muted-foreground">Monitor execution progress in real-time</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
