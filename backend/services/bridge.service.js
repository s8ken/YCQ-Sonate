const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const axios = require('axios');
const { openaiCall } = require('./llm.util');

function loadConfig() {
  try {
    const p = path.join(process.cwd(), 'backend', 'bridge', 'bridge.config.yaml');
    const txt = fs.readFileSync(p, 'utf8');
    return yaml.load(txt) || { agents: [] };
  } catch (e) {
    return { agents: [] };
  }
}

const CFG = loadConfig();

const BRIDGE_CONTRACT = `You are SYMBI agent. Return JSON only with keys: {"proposal_id","goal","steps","artifacts","risks","assumptions","est_cost","est_confidence"}. No extra prose.`;

function resolveEnvTemplates(str) {
  if (!str) return str;
  return str.replace(/\$\{([A-Z0-9_]+)\}/g, (_, v) => process.env[v] || '');
}

async function askHttp(agent, payload) {
  const url = agent.route ? `${agent.base_url}${agent.route}` : agent.base_url;
  const headers = { 'Content-Type': 'application/json' };
  if (agent.auth_header) headers['Authorization'] = resolveEnvTemplates(agent.auth_header);
  const res = await axios.post(url, { task: payload.task, context: payload.context, contract: BRIDGE_CONTRACT }, { headers, timeout: 30000 });
  const raw = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
  return { agent_key: agent.key, raw, proposal: safeParseJson(raw) };
}

async function askLlm(agent, payload) {
  const msg = `Task: ${payload.task}\nContext: ${JSON.stringify(payload.context)}\n\n${BRIDGE_CONTRACT}`;
  const text = await openaiCall(agent.model || 'gpt-4o', '', [
    { role: 'system', content: BRIDGE_CONTRACT },
    { role: 'user', content: msg }
  ]);
  return { agent_key: agent.key, raw: text, proposal: safeParseJson(text) };
}

function safeParseJson(s) { try { return JSON.parse(s); } catch { return null; } }

async function dispatchToAgents({ task, agents, context }) {
  const active = (CFG.agents || []).filter(a => agents.includes(a.key) && a.enabled);
  const outs = await Promise.all(active.map(async (a) => {
    try {
      if (a.kind === 'http') return await askHttp(a, { task, context });
      if (a.kind === 'llm') return await askLlm(a, { task, context });
      return { agent_key: a.key, error: `Unknown kind ${a.kind}` };
    } catch (e) {
      return { agent_key: a.key, error: String(e?.message || e) };
    }
  }));
  return outs.filter(Boolean);
}

function rankProposals(arr, { weights }) {
  return (arr || []).map(x => {
    const p = x.proposal || {};
    const completeness = Math.min(1, ((p.steps?.length || 0) + (p.artifacts?.length || 0)) / 8);
    const risk = scoreInverse((p.risks?.length || 0));
    const cost = p.est_cost != null ? 1 / (1 + Number(p.est_cost)) : 0.5;
    const confidence = clamp(Number(p.est_confidence ?? 0.5), 0, 1);
    const score = (weights.risk * risk) + (weights.confidence * confidence) + (weights.cost * cost) + (weights.completeness * completeness);
    return { ...x, score };
  }).sort((a, b) => (b.score || 0) - (a.score || 0));
}

async function executeProposal({ agent_key, proposal, context }) {
  // For now, dry-run dispatch description
  return { dispatched: agent_key, proposal_id: proposal?.proposal_id, mode: 'dry-run', context };
}

function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
function scoreInverse(n) { return 1 / (1 + n); }

module.exports = { dispatchToAgents, rankProposals, executeProposal };

