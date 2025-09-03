import { type NextRequest, NextResponse } from "next/server"
import { withApiMiddleware } from "@/lib/api-middleware"
import { z } from "zod"

const EstablishTrustSchema = z.object({
  agentId: z.string().min(1, "Agent ID is required"),
  options: z
    .object({
      requireBiometric: z.boolean().optional(),
      trustThreshold: z.number().min(0).max(1).optional(),
      expirationDays: z.number().min(1).max(365).optional(),
    })
    .optional(),
})

async function establishTrustHandler(req: NextRequest) {
  try {
    const body = await req.json()
    const validatedData = EstablishTrustSchema.parse(body)

    // In a real implementation, this would call the backend service
    const response = await fetch(`${process.env.API_BASE_URL}/api/trust-bridge/establish`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: req.headers.get("Authorization") || "",
      },
      body: JSON.stringify(validatedData),
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { success: false, error: error.message || "Failed to establish trust bridge" },
        { status: response.status },
      )
    }

    const result = await response.json()
    return NextResponse.json(result, { status: result.success ? 201 : 400 })
  } catch (error) {
    console.error("[v0] Trust bridge establishment error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export const POST = withApiMiddleware(establishTrustHandler, {
  auth: "required",
  validation: { body: EstablishTrustSchema },
  rateLimit: { maxRequests: 10, windowMs: 60000 },
})
