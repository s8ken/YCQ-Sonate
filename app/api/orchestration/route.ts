import { type NextRequest, NextResponse } from "next/server"
import { agentOrchestrator, type WorkflowDefinition, type AgentCapabilities } from "@/lib/agent-orchestrator"
import { withApiMiddleware } from "@/lib/api-middleware"

export async function POST(request: NextRequest) {
  return withApiMiddleware(request, async (req) => {
    const { action, data } = await req.json()

    switch (action) {
      case "register_workflow":
        const workflow: WorkflowDefinition = data.workflow
        agentOrchestrator.registerWorkflow(workflow)
        return NextResponse.json({
          success: true,
          message: "Workflow registered successfully",
          data: { workflowId: workflow.id },
        })

      case "execute_workflow":
        const executionId = await agentOrchestrator.executeWorkflow(data.workflowId, data.parameters)
        return NextResponse.json({
          success: true,
          message: "Workflow execution started",
          data: { executionId },
        })

      case "get_execution_status":
        const execution = agentOrchestrator.getExecutionStatus(data.executionId)
        if (!execution) {
          return NextResponse.json(
            {
              success: false,
              error: "Execution not found",
            },
            { status: 404 },
          )
        }
        return NextResponse.json({
          success: true,
          data: { execution },
        })

      case "cancel_execution":
        await agentOrchestrator.cancelExecution(data.executionId)
        return NextResponse.json({
          success: true,
          message: "Execution cancelled successfully",
        })

      case "register_agent":
        const capabilities: AgentCapabilities = data.capabilities
        agentOrchestrator.registerAgent(data.agentId, capabilities)
        return NextResponse.json({
          success: true,
          message: "Agent registered successfully",
          data: { agentId: data.agentId },
        })

      case "unregister_agent":
        agentOrchestrator.unregisterAgent(data.agentId)
        return NextResponse.json({
          success: true,
          message: "Agent unregistered successfully",
        })

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Unknown action",
          },
          { status: 400 },
        )
    }
  })
}

export async function GET(request: NextRequest) {
  return withApiMiddleware(request, async (req) => {
    const { searchParams } = new URL(req.url)
    const executionId = searchParams.get("executionId")

    if (executionId) {
      const execution = agentOrchestrator.getExecutionStatus(executionId)
      if (!execution) {
        return NextResponse.json(
          {
            success: false,
            error: "Execution not found",
          },
          { status: 404 },
        )
      }
      return NextResponse.json({
        success: true,
        data: { execution },
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        message: "Orchestration API is running",
        endpoints: {
          POST: "Execute orchestration actions",
          GET: "Get execution status",
        },
      },
    })
  })
}
