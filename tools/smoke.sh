#!/usr/bin/env bash
# SYMBI end-to-end smoke test (local).
# Requirements: bash, curl, jq

set -u

API_BASE=${API_BASE:-http://localhost:5000}
FRONTEND_BASE=${FRONTEND_BASE:-http://localhost:3000}

if ! command -v jq >/dev/null 2>&1; then
  echo "[!] jq is required. Install jq and re-run." >&2
  exit 1
fi

green() { printf "\033[32m%s\033[0m\n" "$*"; }
yellow() { printf "\033[33m%s\033[0m\n" "$*"; }
red() { printf "\033[31m%s\033[0m\n" "$*"; }

PASS=0; FAIL=0
step() { echo; yellow "==> $*"; }
ok() { green "✔ $*"; PASS=$((PASS+1)); }
err() { red "✖ $*"; FAIL=$((FAIL+1)); }

# 1) Health
step "API health check"
if curl -sS "$API_BASE/healthz" | jq . >/dev/null 2>&1; then ok "healthz ok"; else err "healthz failed"; fi

# 2) Register/login
step "Register/login"
EMAIL="smoke_$(date +%s)@local.test"
NAME="Smoke Test"
PASSWORD="ChangeMe!123"
JWT=""

JWT=$(curl -sS -X POST "$API_BASE/api/auth/register" \
  -H 'Content-Type: application/json' \
  -d "{\"name\":\"$NAME\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" | jq -r '.data.token // empty') || true

if [ -z "$JWT" ]; then
  JWT=$(curl -sS -X POST "$API_BASE/api/auth/login" \
    -H 'Content-Type: application/json' \
    -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" | jq -r '.data.token // empty') || true
fi

if [ -n "$JWT" ]; then ok "auth ok ($EMAIL)"; else err "auth failed"; fi

AUTH=(-H "Authorization: Bearer $JWT")

# 3) Orchestrator (optional, skips failures)
step "Bridge orchestrator (optional)"
ORCH=$(curl -sS -X POST "$API_BASE/api/bridge/orchestrate" \
  "${AUTH[@]}" -H 'Content-Type: application/json' \
  -d '{"task":"Draft release notes for SYMBI","agents":["codex","v0"],"context":{}}' 2>/dev/null | jq -r '.success // false') || true
if [ "$ORCH" = "true" ]; then ok "bridge orchestrate"; else yellow "bridge orchestrate skipped/failed (likely no vendor keys)"; fi

# 4) Ingest events → timeline → verify ledger
SID="conv:smoke-$(date +%s)"
step "Ingest events for $SID"

E1=$(curl -sS -X POST "$API_BASE/api/events" "${AUTH[@]}" -H 'Content-Type: application/json' \
  -d "{\"session_id\":\"$SID\",\"prompt\":\"hello\",\"response\":\"general reply\"}" | jq -r '.success // false') || true
E2=$(curl -sS -X POST "$API_BASE/api/events" "${AUTH[@]}" -H 'Content-Type: application/json' \
  -d "{\"session_id\":\"$SID\",\"prompt\":\"I was \"diagnosed\" recently\",\"response\":\"clinical assessment with diagnosis and medication and psychiatric terms\"}" | jq -r '.success // false') || true

if [ "$E1" = "true" ] && [ "$E2" = "true" ]; then ok "events ingested"; else err "events ingest failed"; fi

step "Insights timeline"
POINTS=$(curl -sS "$API_BASE/api/insights/timeline?session_id=$SID" "${AUTH[@]}" | jq -r '.data.count // 0') || POINTS=0
if [ "$POINTS" -gt 0 ]; then ok "timeline points: $POINTS"; else err "timeline empty"; fi

step "Ledger verify"
VERIFY=$(curl -sS "$API_BASE/api/ledger/verify?session_id=$SID" "${AUTH[@]}" | jq -r '.ok // false') || true
if [ "$VERIFY" = "true" ]; then ok "ledger ok"; else err "ledger verify failed"; fi

# 5) Trust (analytics ping)
step "Trust analytics"
TRUST=$(curl -sS "$API_BASE/api/trust/analytics" "${AUTH[@]}" | jq -r '.success // false') || true
if [ "$TRUST" = "true" ]; then ok "trust analytics ok"; else yellow "trust analytics unavailable"; fi

# 6) Context + Weaviate status
step "Context create + status"
CTX=$(curl -sS -X POST "$API_BASE/api/context" "${AUTH[@]}" -H 'Content-Type: application/json' \
  -d '{"tag":"smoke","source":"symbi","data":{"title":"smoke","content":"test"}}' | jq -r '._id // .id // .tag // empty') || true
if [ -n "$CTX" ]; then ok "context created ($CTX)"; else err "context create failed"; fi

WST=$(curl -sS "$API_BASE/api/context/weaviate/status" "${AUTH[@]}" | jq -r '.connected // false') || true
if [ "$WST" = "true" ]; then ok "weaviate connected"; else yellow "weaviate not connected (fallback to Mongo search)"; fi

# 7) LLM (mock provider)
step "LLM generate (google mock)"
LLM=$(curl -sS -X POST "$API_BASE/api/llm/generate" "${AUTH[@]}" -H 'Content-Type: application/json' \
  -d '{"provider":"google","model":"gemini-pro","messages":[{"role":"user","content":"ping"}]}' | jq -r '.success // false') || true
if [ "$LLM" = "true" ]; then ok "llm generate ok (mock)"; else err "llm generate failed"; fi

# 8) Guardrails
step "Guardrails apply"
GR=$(curl -sS -X POST "$API_BASE/api/guardrails/apply" "${AUTH[@]}" -H 'Content-Type: application/json' \
  -d '{"draft_response":"Thanks!","signals":{"pivot":true,"scope":true,"dual_track":true}}' | jq -r '.success // false') || true
if [ "$GR" = "true" ]; then ok "guardrails ok"; else err "guardrails failed"; fi

# 9) Capsule (memory)
step "Capsule put/get"
CP_P=$(curl -sS -X PUT "$API_BASE/api/context/capsule/$SID" "${AUTH[@]}" -H 'Content-Type: application/json' \
  -d '{"capsule":{"goals":["demo"],"tone_prefs":["warm"],"constraints":["keep short"],"tags":["smoke"],"notes":"uat"}}' | jq -r '.session_id // empty') || true
CP_G=$(curl -sS "$API_BASE/api/context/capsule/$SID" "${AUTH[@]}" | jq -r '.capsule.goals[0] // empty') || true
if [ "$CP_P" = "$SID" ] && [ "$CP_G" = "demo" ]; then ok "capsule ok"; else err "capsule failed"; fi

# 10) Sessions recent
step "Sessions recent includes our id"
HAS=$(curl -sS "$API_BASE/api/sessions/recent?limit=200" "${AUTH[@]}" | jq -r --arg sid "$SID" '[.items[] | select(. == $sid)] | length') || true
if [ "$HAS" != "0" ]; then ok "sessions recent includes $SID"; else err "sessions recent missing"; fi

# 11) Metrics endpoint
step "Metrics endpoint"
METRICS=$(curl -sS "$API_BASE/metrics" | grep -c "process_cpu_user_seconds_total" 2>/dev/null) || METRICS=0
if [ "$METRICS" -gt 0 ]; then ok "metrics ok"; else err "metrics failed"; fi

# 12) Webhook status
step "Webhook status"
WS=$(curl -sS "$API_BASE/api/webhooks/status" | jq -r '.success // false') || true
if [ "$WS" = "true" ]; then ok "webhooks ok"; else err "webhooks status failed"; fi

echo
yellow "==> Results: $PASS passed, $FAIL failed"
if [ $FAIL -eq 0 ]; then exit 0; else exit 1; fi

