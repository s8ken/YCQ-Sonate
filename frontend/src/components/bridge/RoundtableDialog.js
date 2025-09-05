import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box, Typography, Chip, CircularProgress,
  FormGroup, FormControlLabel, Checkbox
} from '@mui/material';
import axios from 'axios';

const DEFAULT_AGENTS = [
  { key: 'codex', label: 'Codex (OpenAI)', enabled: true },
  { key: 'v0', label: 'v0', enabled: false },
  { key: 'trae', label: 'Trae', enabled: false }
];

export default function RoundtableDialog({ open, onClose }) {
  const [task, setTask] = useState('');
  const [agents, setAgents] = useState(DEFAULT_AGENTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [recommended, setRecommended] = useState(null);
  const [dispatching, setDispatching] = useState(false);

  const toggleAgent = (key) => {
    setAgents(prev => prev.map(a => a.key === key ? { ...a, enabled: !a.enabled } : a));
  };

  const runRoundtable = async () => {
    if (!task.trim()) { setError('Please describe a goal/task.'); return; }
    setError(null);
    setLoading(true);
    setProposals([]);
    setRecommended(null);
    try {
      const active = agents.filter(a => a.enabled).map(a => a.key);
      const res = await axios.post('/api/bridge/orchestrate', { task, agents: active, context: {} });
      setProposals(res.data?.proposals || []);
      setRecommended(res.data?.recommended || null);
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Roundtable failed');
    } finally {
      setLoading(false);
    }
  };

  const dispatchProposal = async (p) => {
    setDispatching(true);
    try {
      await axios.post('/api/bridge/dispatch', { agent_key: p.agent_key, proposal: p.proposal, context: {} });
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Dispatch failed');
    } finally {
      setDispatching(false);
    }
  };

  const reset = () => {
    setTask('');
    setAgents(DEFAULT_AGENTS);
    setLoading(false);
    setError(null);
    setProposals([]);
    setRecommended(null);
    setDispatching(false);
  };

  const handleClose = () => { reset(); onClose?.(); };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Roundtable (Gather Proposals)</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Goal / Task"
            placeholder="Describe what you want accomplished"
            fullWidth
            value={task}
            onChange={(e) => setTask(e.target.value)}
          />
          <FormGroup row>
            {agents.map(a => (
              <FormControlLabel key={a.key}
                control={<Checkbox checked={a.enabled} onChange={() => toggleAgent(a.key)} />}
                label={a.label} />
            ))}
          </FormGroup>
          {error && <Typography color="error">{error}</Typography>}
          <Box>
            <Button variant="contained" onClick={runRoundtable} disabled={loading}>
              {loading ? <CircularProgress size={22} /> : 'Gather Proposals'}
            </Button>
          </Box>
          {proposals.length > 0 && (
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Proposals</Typography>
              {recommended && (
                <Chip color="success" label={`Recommended: ${recommended.agent_key} • ${recommended.proposal?.proposal_id || '?'}`} sx={{ mr: 1, mb: 1 }} />
              )}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {proposals.map((p, idx) => (
                  <Box key={idx} sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="subtitle2">{p.agent_key} • {p.proposal?.proposal_id || 'unknown'} • score {(p.score ?? 0).toFixed(2)}</Typography>
                    <Typography variant="body2" sx={{ mb: 0.5, opacity: 0.8 }}>{p.proposal?.goal}</Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                      <Chip label={`steps: ${p.proposal?.steps?.length || 0}`} size="small" />
                      <Chip label={`risks: ${p.proposal?.risks?.length || 0}`} size="small" />
                      {typeof p.proposal?.est_cost !== 'undefined' && <Chip label={`cost: ${p.proposal.est_cost}`} size="small" />}
                      {typeof p.proposal?.est_confidence !== 'undefined' && <Chip label={`conf: ${(p.proposal.est_confidence * 100).toFixed(0)}%`} size="small" />}
                    </Box>
                    <Button variant="outlined" onClick={() => dispatchProposal(p)} disabled={dispatching}>
                      {dispatching ? <CircularProgress size={22} /> : 'Approve & Dispatch (dry-run)'}
                    </Button>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

