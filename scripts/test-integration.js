// Integration test script for SYMBI Trust Protocol
const axios = require("axios")

const BASE_URL = process.env.API_BASE_URL || "http://localhost:5000"

class IntegrationTester {
  constructor() {
    this.results = []
    this.authToken = null
  }

  log(message, status = "INFO") {
    const timestamp = new Date().toISOString()
    const logEntry = `[${timestamp}] ${status}: ${message}`
    console.log(logEntry)
    this.results.push({ timestamp, status, message })
  }

  async testEndpoint(name, method, endpoint, data = null, expectedStatus = 200) {
    try {
      const config = {
        method,
        url: `${BASE_URL}${endpoint}`,
        headers: this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {},
      }

      if (data) {
        config.data = data
      }

      const response = await axios(config)

      if (response.status === expectedStatus) {
        this.log(`✅ ${name}: SUCCESS (${response.status})`, "PASS")
        return response.data
      } else {
        this.log(`❌ ${name}: Unexpected status ${response.status}`, "FAIL")
        return null
      }
    } catch (error) {
      this.log(`❌ ${name}: ${error.message}`, "FAIL")
      return null
    }
  }

  async testMultiAIProviders() {
    this.log("🧪 Testing Multi-AI Provider Integration", "TEST")

    // Test getting available providers
    const providers = await this.testEndpoint("Get AI Providers", "GET", "/api/llm/providers")

    if (providers && providers.success) {
      this.log(`Found ${providers.data.length} AI providers`, "INFO")

      // Test each provider's models
      for (const provider of providers.data) {
        await this.testEndpoint(`Get ${provider.name} Models`, "GET", `/api/llm/models/${provider.id}`)
      }
    }

    // Test AI generation with different providers
    const testMessage = {
      provider: "openai",
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Hello, this is a test message." },
      ],
      temperature: 0.7,
      maxTokens: 100,
    }

    await this.testEndpoint("Test AI Generation", "POST", "/api/llm/generate", testMessage)
  }

  async testTrustProtocol() {
    this.log("🛡️ Testing Trust Protocol Core", "TEST")

    // Test creating a trust declaration
    const trustDeclaration = {
      agent_id: "test-agent-001",
      agent_name: "Test Agent",
      trust_articles: {
        inspection_mandate: true,
        consent_architecture: true,
        ethical_override: true,
        continuous_validation: true,
        right_to_disconnect: true,
        moral_recognition: true,
      },
      notes: "Integration test declaration",
    }

    const declaration = await this.testEndpoint("Create Trust Declaration", "POST", "/api/trust", trustDeclaration)

    if (declaration && declaration.success) {
      const declarationId = declaration.data._id
      this.log(`Created trust declaration: ${declarationId}`, "INFO")

      // Test signing the declaration
      await this.testEndpoint("Sign Trust Declaration", "POST", "/api/trust-protocol/sign", {
        declarationId,
        agentId: "test-agent-001",
      })

      // Test verifying the signature
      await this.testEndpoint("Verify Trust Declaration", "POST", "/api/trust-protocol/verify", { declarationId })

      // Test compliance validation
      await this.testEndpoint("Validate Trust Compliance", "POST", "/api/trust-protocol/validate", { declarationId })
    }

    // Test getting JWKS
    await this.testEndpoint("Get JWKS", "GET", "/api/trust-protocol/jwks")

    // Test trust analytics
    await this.testEndpoint("Get Trust Analytics", "GET", "/api/trust/analytics")
  }

  async testAssistantFunctionCalling() {
    this.log("🤖 Testing Assistant Function Calling", "TEST")

    // Test creating an assistant
    const assistantConfig = {
      name: "Test Integration Assistant",
      instructions: "You are a test assistant for integration testing.",
      model: "gpt-4-1106-preview",
    }

    const assistant = await this.testEndpoint("Create Assistant", "POST", "/api/assistant/create", assistantConfig)

    if (assistant && assistant.success) {
      this.log(`Created assistant: ${assistant.data.id}`, "INFO")

      // Test creating a thread
      const thread = await this.testEndpoint("Create Thread", "POST", "/api/assistant/thread")

      if (thread && thread.id) {
        // Test sending a message with function calling
        await this.testEndpoint("Send Message with Function Calling", "POST", "/api/assistant/message", {
          threadId: thread.id,
          assistantId: assistant.data.id,
          message: "Can you show me my trust declarations and create a new one for a test agent?",
        })
      }
    }
  }

  async testSystemHealth() {
    this.log("💚 Testing System Health", "TEST")

    // Test basic API health
    await this.testEndpoint("API Health Check", "GET", "/")

    // Test database connectivity (implicit through other tests)
    await this.testEndpoint("Get Trust Declarations", "GET", "/api/trust")

    // Test validators
    await this.testEndpoint("Get Consensus Validators", "GET", "/api/trust-protocol/validators")
  }

  async runAllTests() {
    this.log("🚀 Starting SYMBI Trust Protocol Integration Tests", "START")

    try {
      await this.testSystemHealth()
      await this.testMultiAIProviders()
      await this.testTrustProtocol()
      await this.testAssistantFunctionCalling()

      this.log("✅ Integration tests completed", "COMPLETE")
      this.generateReport()
    } catch (error) {
      this.log(`❌ Integration tests failed: ${error.message}`, "ERROR")
    }
  }

  generateReport() {
    const passed = this.results.filter((r) => r.status === "PASS").length
    const failed = this.results.filter((r) => r.status === "FAIL").length
    const total = passed + failed

    console.log("\n" + "=".repeat(60))
    console.log("📊 INTEGRATION TEST REPORT")
    console.log("=".repeat(60))
    console.log(`Total Tests: ${total}`)
    console.log(`Passed: ${passed} ✅`)
    console.log(`Failed: ${failed} ❌`)
    console.log(`Success Rate: ${total > 0 ? Math.round((passed / total) * 100) : 0}%`)
    console.log("=".repeat(60))

    if (failed > 0) {
      console.log("\n❌ FAILED TESTS:")
      this.results.filter((r) => r.status === "FAIL").forEach((r) => console.log(`  - ${r.message}`))
    }

    console.log("\n🎯 NEXT STEPS:")
    console.log("1. Review any failed tests and fix issues")
    console.log("2. Set up environment variables for API keys")
    console.log("3. Deploy to production environment")
    console.log("4. Run tests against production endpoints")
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new IntegrationTester()
  tester.runAllTests().catch(console.error)
}

module.exports = IntegrationTester
