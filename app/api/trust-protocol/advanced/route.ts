import { type NextRequest, NextResponse } from "next/server"
import { advancedTrustProtocol } from "@/lib/advanced-trust-protocol"
import { withApiMiddleware } from "@/lib/api-middleware"

export async function POST(request: NextRequest) {
  return withApiMiddleware(request, async (req) => {
    const { action, data } = await req.json()

    switch (action) {
      case "generate_zk_proof":
        const zkProof = await advancedTrustProtocol.generateZKProof(data.secret, data.publicInputs)
        return NextResponse.json({
          success: true,
          data: { proof: zkProof },
        })

      case "verify_zk_proof":
        const isValid = await advancedTrustProtocol.verifyZKProof(data.proof, data.publicInputs)
        return NextResponse.json({
          success: true,
          data: { valid: isValid },
        })

      case "create_multisig":
        const multiSigTx = advancedTrustProtocol.createMultiSigTransaction(data.transactionData, data.config)
        return NextResponse.json({
          success: true,
          data: { transaction: multiSigTx },
        })

      case "create_immutable_record":
        const blockHash = advancedTrustProtocol.createImmutableTrustRecord(data.trustData)
        return NextResponse.json({
          success: true,
          data: { blockHash, timestamp: Date.now() },
        })

      case "verify_chain_integrity":
        const isChainValid = advancedTrustProtocol.verifyChainIntegrity()
        return NextResponse.json({
          success: true,
          data: { valid: isChainValid },
        })

      case "generate_pq_keys":
        const pqKeys = advancedTrustProtocol.generatePostQuantumKeys()
        return NextResponse.json({
          success: true,
          data: { keys: pqKeys },
        })

      case "calculate_enhanced_trust":
        const trustScore = advancedTrustProtocol.calculateEnhancedTrustScore(data.agentHistory)
        return NextResponse.json({
          success: true,
          data: { trustScore },
        })

      case "detect_anomalies":
        const anomalies = advancedTrustProtocol.detectAnomalies(data.agentData)
        return NextResponse.json({
          success: true,
          data: { anomalies },
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
