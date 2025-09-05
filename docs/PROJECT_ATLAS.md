# PROJECT ATLAS

## 1) Repo Quick Facts
- Root path: `/Users/admin/Symbi Synergy`
- Current branch: `optimized-rebuild-clean`
- Recent commits (last 10):
  - 1c2f3aa Update all files for optimized rebuild
  - 73e3702 feat: Add OpenAI GPT Assistant integration with function calling capabilities
  - 6141a04 feat: Add optimized rebuild with 60% size reduction
  - a1fb916 chore: add @vercel/analytics dependency and update package-lock.json
  - 6d73a42 security: update dependencies to address vulnerabilities
  - e9ea1f6 Merge repo-cleanup/add-community-files branch - resolve package-lock.json conflicts
  - 9d6b229 Merge remote-tracking branch 'origin/dependabot/npm_and_yarn/npm_and_yarn-1bef3d5c74'
  - 3afb84d feat: implement all GPT-4 code review recommendations
  - 18cc5a1 feat: Add OpenAI and Anthropic API integration for AI-powered code review
  - 0c005e4 feat: Complete Symbi Trust Protocol security hardening and infrastructure
- Language/LOC breakdown (cloc): JSON 31,428 | HTML 21,957 | JavaScript 18,178 | Markdown 4,390 | YAML 1,948 | CSS 1,629 | JSX 667 | Dockerfile 39
- Largest tracked files (top ~15, excluding node_modules/.next/dist/build):
  - `archives/*` multiple 0.5–1.6MB HTML/MHTML reference artifacts
  - `frontend/package-lock.json` ~712K
  - `package-lock.json` ~416K
  - `backend/coverage/*` coverage reports (HTML/XML/LCOV)
- Untracked/unexplained (in-app scope): many `archives/*` docs, `.DS_Store` files, and `backend/coverage/*` committed outputs

## 2) Architecture Map
```mermaid
flowchart LR
  subgraph FE[Frontend (React + MUI)]
    FE_App[App Router & Pages]
    FE_Auth[AuthContext (JWT)]
    FE_Review[ReviewConsole]
  end

  subgraph BE[Backend (Express + Mongoose)]
    BE_App[app.js (routes, security, CORS)]
    BE_Socket[Socket.IO (server.js)]
    BE_Auth[Auth/Users]
    BE_Conv[Conversations]
    BE_Agents[Agents]
    BE_Assist[Assistants (OpenAI beta)]
    BE_LLM[LLM API]
    BE_Trust[Trust Protocol]
    BE_Context[Context + Weaviate]
    BE_Ledger[Events/Ledger + Analysis + Insights + Guardrails]
  end

  subgraph DB[MongoDB]
    Coll_Users[(users)]
    Coll_Agents[(agents)]
    Coll_Convs[(conversations)]
    Coll_Trust[(trust_declarations)]
    Coll_Context[(contexts)]
    Coll_Reports[(reports)]
    Coll_Events[(interaction_events)]
  end

  subgraph Ext[External Services]
    OpenAI[OpenAI API (gpt-4o, Assistants)]
    Anthropic[Anthropic]
    Perplexity[Perplexity]
    V0[Vercel v0]
    Weaviate[Weaviate]
    Vercel[Vercel (FE deploy)]
    Grafana[Grafana/Loki/Prometheus]
  end

  FE_App <--> BE_App
  FE_Auth --> BE_Auth
  FE_Review --> BE_Ledger
  BE_App --> Coll_Users & Coll_Agents & Coll_Convs & Coll_Trust & Coll_Context & Coll_Reports & Coll_Events
  BE_Assist --> OpenAI
  BE_LLM --> OpenAI & Anthropic & Perplexity & V0
  BE_Context -.optional.-> Weaviate
  FE_App -.deploy.-> Vercel
  BE_App -.metrics/logs.-> Grafana
```

Data flows: Auth via JWT; Conversations via REST + Socket.IO rooms; Trust/Ledger via append-only events and analysis; Assistants via OpenAI beta Assistants API; optional Weaviate for context search.

## 3) Backend Inventory
- Entrypoints
  - HTTP + Socket.IO: `backend/server.js:1` (JWT-authenticated socket, origin allowlist)
  - Express app: `backend/app.js:1` (security, CORS, routes, Mongo connect, static, errors)
- Middleware chain (order)
  - Helmet security headers (`security.middleware.js`)
  - `compression()`
  - Request size limiter (10MB)
  - Content-Type validator (JSON, URL-encoded)
  - CORS (env-driven; dev open, prod allowlist)
  - Body parsers (json/urlencoded, 10MB)
  - Input sanitization (mongoSanitize + HPP)
  - Suspicious activity detector (regex for SQLi/XSS/etc.)
  - Request logger + `morgan` (error-only)
  - Rate limit `/api/*` + dedicated auth rate limit
- Health/Readiness
  - `GET /healthz` uptime; `GET /readyz` Mongo state (`backend/app.js:167`)
- Routes table (high-level)
  - Auth: `POST /api/auth/register|login|logout`, `GET /api/auth/me`, `PUT /api/auth/profile` (logout allows optional auth)
  - Users: `GET/PUT /api/users/profile`, `DELETE /api/users/account`, API keys CRUD under `/api/users/api-keys`
  - Conversations: CRUD `/api/conversations`, messages `/api/conversations/:id/messages`
  - Agents: CRUD `/api/agents`, connect/toggle/sync external systems
  - Assistants: `POST /api/assistant/create`, `GET /list`, `GET /latest`, `PUT /:assistantId`, `DELETE /:assistantId`, threads (`/thread/create`, `/thread/:id/messages`), chat (`/message`)
  - LLM: `GET /api/llm/providers`, `GET /models/:provider`, `POST /generate`, `POST /stream`, `POST /code-review`
  - Trust: `GET /api/trust/analytics`, `GET /agent/:agentId`, `POST /:id/audit`, `GET/PUT/DELETE /:id`, `GET /`, `POST /`
  - Context: `GET /api/context`, `/tag/:tag`, `/:id`; `POST /`, `/bridge`, `/search`, `/recommendations`, Weaviate `status|init|sync`; `PUT /:id`, `/deactivate`; `DELETE /:id`
  - Events/Ledger: `POST /api/events` (ingest + auto-analyze); `GET /api/ledger` (stream); alias `GET /api/events/ledger`
  - Analysis: `POST /api/analyze/turn`
  - Guardrails: `POST /api/guardrails/apply`
  - Insights: `GET /api/insights/timeline`
  - Webhooks: `POST /api/webhooks/sky/:agentId`, `POST /test`, `GET /status` (public)
- Socket.IO channels `backend/server.js`
  - Auth: handshake requires JWT (auth.token or Authorization header)
  - Events: `joinConversation` (verifies ownership, joins room) → emits `joined` or `error`; `new_message` rebroadcasts to room as `message_received` and `newMessage`; `ai_communication` emits to target agent room
- Models/Schemas (Mongo via Mongoose)
  - User: email(unique), password(select:false), apiKeys[{provider,name,key(select:false)}], preferences
  - Agent: provider/model/systemPrompt/apiKeyId, traits, connectedAgents, externalSystems (apiKey select:false), status
  - Conversation: user, messages[{sender,content,agentId,timestamp,…}], agents[], text indexes
  - TrustDeclaration: agent_id/name, declaration_date, trust_articles (6 booleans), compliance_score, guilt_score (deterministic), audit_history
  - Context: knowledge entries with vectorization + Weaviate sync helpers
  - Report: reporting schema
  - InteractionEvent: session_id/user/model info/prompt/response/metadata, analysis, embeddings, ledger{prev_hash,row_hash,signature}; append-only
- Services
  - LLM controller invokes OpenAI/Anthropic/Perplexity/V0
  - Assistant service handles OpenAI Assistants (create/update/list/delete, threads, runs, tool calls)
  - Analysis service provides heuristics + change-point scoring
  - Weaviate and Snowflake integrations present
- Env variables referenced
  - Core: `PORT`, `NODE_ENV`, `MONGODB_URI`, `JWT_SECRET`, `CORS_ORIGIN`, `CORS_ORIGINS`
  - LLM: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `PERPLEXITY_API_KEY`, `V0_API_KEY`, `OPENAI_BASE_URL`
  - Weaviate: `WEAVIATE_URL`, `WEAVIATE_TIMEOUT`, `WEAVIATE_STARTUP_PERIOD`, `WEAVIATE_API_KEY`, `WEAVIATE_ADDITIONAL_HEADERS`, `DEFAULT_SEARCH_LIMIT`, `DEFAULT_SIMILARITY_THRESHOLD`, `MAX_SEARCH_RESULTS`
  - Ledger: `LEDGER_SIGNING_KEY`
  - Snowflake: account/username/password/database/schema/warehouse/role/timeout

## 4) Frontend Inventory
- Router map (React Router v6)
  - Public: `/login`, `/register`
  - Protected: `/`, `/dashboard`, `/conversations`, `/conversations/:id`, `/agents`, `/agents/:id`, `/assistants`, `/assistants/new`, `/assistants/:assistantId/chat`, `/settings`, `/reports`, `/context-bridge`, `/review`
  - 404: `*`
- Key screens/components
  - Dashboard; Conversations + ConversationDetail (Socket.IO real-time, token sent via `io({auth:{token}})`)
  - Agents (list/detail), Assistants (create/list/update/chat), Settings, Reports, Context Bridge
  - ReviewConsole: fetches `/api/insights/timeline` and renders change-points with evidence excerpts
- API client usage
  - Axios: base via CRA proxy to `http://localhost:5000`, Authorization header set from localStorage token in `AuthContext`
- Build output
  - Not generated in this inspection; CRA build scripts present

## 5) LLM & Assistants
- Model selection
  - OpenAI defaults prioritize `gpt-4o`; static list includes `gpt-4o-mini`, `gpt-4-turbo`, `gpt-4`, `gpt-3.5-turbo`
  - `GET /api/llm/models/openai` tries dynamic `openai.models.list()` when key is configured, falls back to static
  - Code review defaults to `gpt-4o` for OpenAI provider
- Assistant endpoints & behavior
  - Create (`POST /api/assistant/create`): accepts `name`, `instructions`, `model`, `tools`; default model `gpt-4o`
  - List (`GET /api/assistant/list`): returns most-recent-first
  - Latest (`GET /api/assistant/latest`): returns the most recently created assistant
  - Update (`PUT /api/assistant/:assistantId`): update name/instructions/model/tools
  - Delete (`DELETE /api/assistant/:assistantId`)
  - Threads (`POST /api/assistant/thread/create`, `GET /api/assistant/thread/:threadId/messages`)
  - Message (`POST /api/assistant/message`): uses provided `assistantId` or falls back to latest assistant

## 6) Trust / Ledger & Analysis
- Event/Ledger schema
  - Keys: `event_id`, `session_id`, `user`, `model_vendor`, `model_name`, `timestamp`, `prompt`, `response`, `metadata`, `analysis`, `embeddings`, `ledger:{prev_hash,row_hash,signature}`
- Hash-chain & signatures
  - `prev_hash` set to last event’s `row_hash` in-session; `row_hash = sha256(canonical(payload + prev_hash))`
  - Optional `signature` (Ed25519) from `LEDGER_SIGNING_KEY` (PEM)
  - Append-only constraints via pre-hooks
- Heuristic analysis
  - Features: sentiment, formality, clinical_register, emoji_count, hedging_index, politeness, safety_flags, disclosure_flags, stance(+conf)
  - Change-point logic: delta vs recent K events; `pivot_detected` thresholded and tied to disclosures
- Guardrails engine
  - `POST /api/guardrails/apply` composes apology + scope alignment + optional dual-track preface before the draft

## 7) CI/CD & Ops
- GitHub Actions
  - CI (`.github/workflows/ci.yml`): lint/type-check (both apps), tests (Mongo service), Codecov upload; security scan (npm audit, OWASP DC, Semgrep, Trivy)
  - CodeQL (`.github/workflows/codeql.yml`): weekly + pushes/PRs to main
- Deploy targets
  - Vercel frontend project files present; Express serves built frontend in production
- Observability
  - Prometheus/Grafana/Loki/OTel configs present; app does not yet export metrics/traces

## 8) Security Posture (snapshot)
- JWT & RBAC
  - JWT required (no default secret in non-test); token 30d exp; helper middlewares for `requireRole`/`validateJWTScopes` exist but not widely applied
- CORS
  - Dev: allow all; Prod: allowlist from `CORS_ORIGINS`/`CORS_ORIGIN` + localhost
- Rate limiting & content-type
  - `/api/auth` stricter; general `/api/*` limiter; Content-Type restricted; 10MB body + Content-Length limits
- Input hygiene
  - Helmet CSP; mongoSanitize with logging; HPP whitelist; suspicious input detector (regexes)
- Secrets
  - User API keys stored with `select:false` and not returned by controllers
- Risks
  - Public webhooks without signature verification
  - Tests reference external Mongo URIs embedded in files
  - Streaming endpoint simulates chunks, not true provider streams

## 9) Gaps, Risks, Unknowns
- OpenAPI spec mismatch with actual `/api/*` routes (trust, ledger, events, analyze, guardrails, insights)
- Public webhooks lack HMAC validation
- Coverage artifacts and `.DS_Store` committed
- Role/Scopes middleware not enforced on admin/sensitive routes
- Observability plumbing not wired (no metrics/traces emitted)

## 10) Recommendations
- Top 5 immediate fixes
  1. Enforce HMAC signatures on all webhooks and make endpoints private by default
  2. Align `openapi.yaml` to actual routes; mount Swagger UI for discoverability
  3. Require `requireRole('admin')` on sensitive trust/ledger operations (e.g., audits, deletes)
  4. Replace simulated `/api/llm/stream` with actual streaming or rename to `/simulate-stream`
  5. Remove hard-coded external Mongo URIs from test scripts; use env-based config
- Top 5 de-bloat deletions/merges
  1. Remove `backend/coverage/*` and add to `.gitignore`
  2. Purge `.DS_Store` and add ignore
  3. Consider moving `archives/*` into a docs-only repo or exclude from builds
  4. Consolidate `/api/events/ledger` with `/api/ledger` (document alias if kept)
  5. Remove dead/unused security middleware paths or wire them consistently
- Top 5 quality-of-life improvements
  1. Add `/api/sessions/recent` for ReviewConsole session selection
  2. Add `/api/ledger/verify` to validate hash chains per session
  3. Frontend: central Axios error interceptor + toasts; model picker sourced from `/api/llm/models/openai`
  4. Minimal metrics middleware and `/metrics` endpoint
  5. Pre-commit hooks for lint/format; ensure consistent CI lint scripts

---

Prepared for PR: create branch `docs/project-atlas`, add this file, and open PR.
