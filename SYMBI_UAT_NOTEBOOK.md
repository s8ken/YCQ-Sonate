# SYMBI UAT Notebook (v0.1-rc1)

This single document provides:
- A copy-paste UAT runbook with commands
- A Postman Collection (v2.1) you can import as JSON
- An optional smoke.sh you can run with one command

## Conventions
- `$API` = http://localhost:5000 (or your deployed URL)
- `$JWT` = Bearer <your JWT from /login>
- `<CONV_ID>` = Mongo ObjectId of the conversation (prefixed server-side to conv:<id>)
- `<THREAD_ID>` = OpenAI Assistant thread id returned by thread/create

## 0) Setup

### Required Environment Variables
```bash
export MONGODB_URI="mongodb+srv://..."
export JWT_SECRET="change-me"
export NODE_ENV=development
export CORS_ORIGINS="http://localhost:3000"
```

### Optional API Keys
```bash
export OPENAI_API_KEY="sk-..."
export ANTHROPIC_API_KEY="..."
export V0_TOKEN="..."
export PERPLEXITY_API_KEY="..."
```

### Start Servers
```bash
# Backend
cd backend && npm i && npm run dev &

# Frontend
cd ../frontend && npm i && npm start &
```

### Client Environment
```bash
export API=http://localhost:5000
# Obtain a JWT via web UI (login/register), then:
export JWT="Bearer <paste JWT>"
```

## 1) One-Command Baseline (Smoke Test)

Run the comprehensive smoke test:
```bash
chmod +x tools/smoke.sh && API_BASE=$API ./tools/smoke.sh
```

This tests:
- ✅ Health checks (healthz, readyz)
- ✅ Authentication (register/login)
- ✅ Bridge orchestrator
- ✅ Event ingestion and ledger verification
- ✅ Trust analytics
- ✅ Context creation and Weaviate status
- ✅ LLM generation
- ✅ Guardrails
- ✅ Context Capsules
- ✅ Session management
- ✅ Webhook status

## 2) Advanced AI Integration

### Models
```bash
curl -s $API/api/llm/models/openai | jq
```

### OpenAI Assistants
```bash
# Create thread
THREAD_ID=$(curl -s -X POST $API/api/assistant/thread/create \
  -H "Authorization: $JWT" | jq -r '.thread.id')

echo "THREAD_ID=$THREAD_ID"

# Message to latest assistant
curl -s -X POST $API/api/assistant/message \
  -H "Authorization: $JWT" -H "Content-Type: application/json" \
  -d '{
    "threadId": "'"$THREAD_ID"'",
    "message": "Summarize the Bridge design in 4 bullets.",
    "session_id": "conv:<CONV_ID>"
  }' | jq
```

### Bridge Multi-Agent Orchestration
```bash
# Orchestrate
curl -s -X POST $API/api/bridge/orchestrate \
  -H "Authorization: $JWT" -H "Content-Type: application/json" \
  -d '{
    "task":"Add per-message trust overlays + receipts",
    "agents":["codex","v0","trae"]
  }' | jq '.proposals[0]'

# Dispatch (dry-run)
# Replace proposal_id below from the orchestrate result
curl -s -X POST $API/api/bridge/dispatch \
  -H "Authorization: $JWT" -H "Content-Type: application/json" \
  -d '{
    "agent_key":"codex",
    "proposal":{"proposal_id":"<PROPOSAL_ID>"},
    "context":{"session_id":"conv:<CONV_ID>"}
  }' | jq
```

### Bridge Receipts (Ledger Audit) ✨ NEW
```bash
# Test orchestration with session_id for receipt generation
curl -s -X POST $API/api/bridge/orchestrate \
  -H "Authorization: $JWT" -H "Content-Type: application/json" \
  -d '{"task":"demo receipts","agents":["codex","v0"],"session_id":"conv:test-receipt-123"}' | jq

# Verify bridge receipt was written to ledger
curl -s "$API/api/ledger?session_id=conv:test-receipt-123" \
  -H "Authorization: $JWT" \
  | jq 'map(select(.metadata.receipt.type=="bridge_receipt")) | .[0].metadata.receipt'

# Verify ledger chain integrity
curl -s "$API/api/ledger/verify?session_id=conv:test-receipt-123" \
  -H "Authorization: $JWT" | jq
```

### Socket.IO Quick Check
Save as `scripts/socket-check.mjs` and run with: `node scripts/socket-check.mjs`

```javascript
import { io } from 'socket.io-client';
const API = process.env.API || 'http://localhost:5000';
const JWT = (process.env.JWT || '').replace(/^Bearer\s+/, '');
const CONV = process.env.CONV_ID || '<CONV_ID>';
const s = io(API, { auth: { token: JWT } });
s.on('connect', ()=>{ console.log('connected', s.id); s.emit('joinConversation', CONV); });
s.on('connect_error', e => console.error('connect_error', e.message));
```

## 3) Enterprise Security

### JWT Required & RBAC
```bash
# Expect 401 without JWT
curl -s -o /dev/null -w "%{http_code}\n" $API/api/trust | head -n1
```

### Security Headers
```bash
curl -sI $API/healthz | egrep -i 'content-security-policy|x-frame-options|x-content-type-options|referrer-policy'
```

### Webhook HMAC Validation
```bash
BODY='{"type":"message","data":{}}'
SIG=$(echo -n "$BODY" | openssl dgst -sha256 -hmac "$WEBHOOK_SECRET" -binary | xxd -p -c 256)

curl -s -X POST $API/api/webhooks/sky/dummy \
  -H "x-symbi-signature: $SIG" -H "Content-Type: application/json" \
  -d "$BODY" | jq
```

### Ledger Integrity (Tamper-Evident)
```bash
curl -s "$API/api/ledger/verify?session_id=conv:<CONV_ID>" -H "Authorization: $JWT" | jq
```

## 4) Observability

### Health Monitoring
```bash
curl -s $API/healthz | jq
curl -s $API/readyz | jq
```

### Prometheus Metrics ✨ NEW
```bash
# Check metrics endpoint (open in dev, token-protected in prod)
curl -s $API/metrics | head -20

# In production with METRICS_TOKEN:
# curl -H "Authorization: Bearer $METRICS_TOKEN" $API/metrics

# Verify HTTP request metrics are being collected
curl $API/healthz  # Generate some traffic
curl -s $API/metrics | grep "http_requests_total"
curl -s $API/metrics | grep "http_request_duration_seconds"
```

### Grafana Stack (if running)
- Grafana: http://localhost:3001 (admin/admin123)
- Prometheus: http://localhost:9090
- Loki: http://localhost:3100

## 5) Sophisticated Architecture (Quick UAT)

### VS Code Extension
1. Press F5 → "SYMBI: Set API Base" → http://localhost:5000
2. "SYMBI: Save SYMBI_API_KEY" → your JWT
3. Run "Roundtable" and "Verify Ledger"

### Context Capsules
1. In Conversation UI, set Goals / Tone / Constraints / Tags
2. Save capsule
3. Send message → reply honors capsule settings

### Trust Overlays
1. In Conversation UI, observe trust chips at header
2. Under each message: Pivot / Change% / Stance / Row-hash
3. Trigger disclosure → see stance changes

## 6) 5-Minute Stakeholder Demo

1. **Dashboard → Roundtable**: "Ship per-message trust overlays & receipts"
   - Show proposals + scores
   - Demonstrate dry-run dispatch

2. **Assistants → Use Most Recent**:
   - Edit model to gpt-4o
   - Tweak instructions
   - Save changes

3. **Conversations → Open Thread**:
   - Capsule panel: set Goals "clarity", Tone "co-creator", Constraints "no clinical register"
   - Save capsule
   - Send message → observe capsule honored
   - TrustChips show stable state

4. **Trigger Disclosure**:
   - See Pivot chip + stance change + hash snippet
   - Run ledger/verify

5. **VS Code Extension**:
   - "Roundtable" & "Verify Ledger" commands

## Postman Collection (v2.1)

Import the JSON below into Postman. Set Variables after import:
- `baseUrl` = http://localhost:5000
- `jwt` = Bearer <your JWT>
- `convId` = <CONV_ID> (without conv:; scripts will add it)
- `webhookSecret` = your secret

```json
{
  "info": {
    "name": "SYMBI UAT Collection",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {"key": "baseUrl", "value": "http://localhost:5000"},
    {"key": "jwt", "value": "Bearer "},
    {"key": "convId", "value": ""},
    {"key": "webhookSecret", "value": ""}
  ],
  "item": [
    {
      "name": "Health",
      "item": [
        {
          "name": "Health Check",
          "request": {
            "method": "GET",
            "header": [],
            "url": {"raw": "{{baseUrl}}/healthz", "host": ["{{baseUrl}}"], "path": ["healthz"]}
          }
        },
        {
          "name": "Readiness Check",
          "request": {
            "method": "GET",
            "header": [],
            "url": {"raw": "{{baseUrl}}/readyz", "host": ["{{baseUrl}}"], "path": ["readyz"]}
          }
        }
      ]
    },
    {
      "name": "Security",
      "item": [
        {
          "name": "Unauthorized Access",
          "request": {
            "method": "GET",
            "header": [],
            "url": {"raw": "{{baseUrl}}/api/trust", "host": ["{{baseUrl}}"], "path": ["api","trust"]}
          },
          "event": [
            {"listen": "test", "script": {"exec": [
              "pm.test('401 unauthorized', function(){ pm.response.to.have.status(401); });"
            ]}}
          ]
        },
        {
          "name": "Ledger Verify",
          "request": {
            "method": "GET",
            "header": [{"key": "Authorization", "value": "{{jwt}}"}],
            "url": {
              "raw": "{{baseUrl}}/api/ledger/verify?session_id=conv:{{convId}}",
              "host": ["{{baseUrl}}"],
              "path": ["api","ledger","verify"],
              "query": [{"key": "session_id", "value": "conv:{{convId}}"}]
            }
          }
        }
      ]
    },
    {
      "name": "AI Integration",
      "item": [
        {
          "name": "Bridge Orchestrate",
          "request": {
            "method": "POST",
            "header": [
              {"key": "Authorization", "value": "{{jwt}}"},
              {"key": "Content-Type", "value": "application/json"}
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"task\": \"Add per-message trust overlays\",\n  \"agents\": [\"codex\", \"v0\", \"trae\"]\n}"
            },
            "url": {"raw": "{{baseUrl}}/api/bridge/orchestrate", "host": ["{{baseUrl}}"], "path": ["api","bridge","orchestrate"]}
          }
        },
        {
          "name": "Assistant Create Thread",
          "request": {
            "method": "POST",
            "header": [{"key": "Authorization", "value": "{{jwt}}"}],
            "url": {"raw": "{{baseUrl}}/api/assistant/thread/create", "host": ["{{baseUrl}}"], "path": ["api","assistant","thread","create"]}
          }
        }
      ]
    },
    {
      "name": "Context & Memory",
      "item": [
        {
          "name": "Context Capsule Put",
          "request": {
            "method": "PUT",
            "header": [
              {"key": "Authorization", "value": "{{jwt}}"},
              {"key": "Content-Type", "value": "application/json"}
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"capsule\": {\n    \"goals\": [\"clarity\"],\n    \"tone_prefs\": [\"co-creator\"],\n    \"constraints\": [\"no clinical register\"],\n    \"tags\": [\"uat\"],\n    \"notes\": \"UAT testing\"\n  }\n}"
            },
            "url": {"raw": "{{baseUrl}}/api/context/capsule/conv:{{convId}}", "host": ["{{baseUrl}}"], "path": ["api","context","capsule","conv:{{convId}}"]}
          }
        },
        {
          "name": "Context Capsule Get",
          "request": {
            "method": "GET",
            "header": [{"key": "Authorization", "value": "{{jwt}}"}],
            "url": {"raw": "{{baseUrl}}/api/context/capsule/conv:{{convId}}", "host": ["{{baseUrl}}"], "path": ["api","context","capsule","conv:{{convId}}"]}
          }
        }
      ]
    }
  ]
}
```

## Quick Reference Commands

```bash
# Full smoke test
./tools/smoke.sh

# Health only
curl -s $API/healthz | jq

# Auth test
curl -s $API/api/trust -H "Authorization: $JWT" | jq

# Bridge test
curl -s -X POST $API/api/bridge/orchestrate \
  -H "Authorization: $JWT" -H "Content-Type: application/json" \
  -d '{"task":"test","agents":["codex"]}' | jq

# Ledger verify
curl -s "$API/api/ledger/verify?session_id=conv:test" -H "Authorization: $JWT" | jq
```

---

**Note**: This UAT notebook covers the core functionality of SYMBI. For production deployments, ensure all environment variables are properly configured and API keys are securely managed.