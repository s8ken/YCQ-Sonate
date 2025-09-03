import { type NextRequest, NextResponse } from "next/server"
import { withApiMiddleware } from "@/lib/api-middleware"
import { z } from "zod"

const VerificationSchema = z.object({
  consentEnvelopeId: z.string().min(1, "Consent envelope ID is required"),
  verificationData: z.object({
    verificationCode: z.string().optional(),
    email: z.string().email().optional(),
    phoneNumber: z.string().optional(),
    biometricHash: z.string().optional(),
    documentHash: z.string().optional(),
    documentType: z.string().optional(),
    factors: z
      .array(
        z.object({
          method: z.string(),
          data: z.any(),
        }),
      )
      .optional(),
  }),
})

async function verifyIdentityHandler(req: NextRequest) {
  try {
    const body = await req.json()
    const validatedData = VerificationSchema.parse(body)

    // In a real implementation, this would call the backend service
    const response = await fetch(`${process.env.API_BASE_URL}/api/human-identity/verify`, {
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
        { success: false, error: error.message || "Identity verification failed" },
        { status: response.status },
      )
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Identity verification error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export const POST = withApiMiddleware(verifyIdentityHandler, {
  auth: "required",
  validation: {
    body: VerificationSchema,
  },
  rateLimit: { maxRequests: 10, windowMs: 60000 },
})
