import { type NextRequest, NextResponse } from "next/server"
import { withApiMiddleware } from "@/lib/api-middleware"
import { z } from "zod"

const ConsentEnvelopeSchema = z.object({
  identityAssertion: z.string().min(1, "Identity assertion is required"),
  consentArticles: z.object({
    dataProcessing: z.boolean(),
    aiInteraction: z.boolean(),
    trustProtocolParticipation: z.boolean(),
    identityVerification: z.boolean(),
    consensusParticipation: z.boolean(),
    dataRetention: z.boolean(),
  }),
  verificationMethod: z.enum(["email", "phone", "biometric", "document", "multi-factor"]),
  biometricHash: z.string().optional(),
})

async function createConsentEnvelopeHandler(req: NextRequest) {
  try {
    const body = await req.json()
    const validatedData = ConsentEnvelopeSchema.parse(body)

    // In a real implementation, this would call the backend service
    const response = await fetch(`${process.env.API_BASE_URL}/api/human-identity/consent`, {
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
        { success: false, error: error.message || "Failed to create consent envelope" },
        { status: response.status },
      )
    }

    const result = await response.json()
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("[v0] Consent envelope creation error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export const POST = withApiMiddleware(createConsentEnvelopeHandler, {
  auth: "required",
  validation: {
    body: ConsentEnvelopeSchema,
  },
  rateLimit: { maxRequests: 5, windowMs: 60000 },
})
