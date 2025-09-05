import React, { useEffect, useMemo, useState } from 'react';
import { Box, Chip, Tooltip } from '@mui/material';
import axios from 'axios';

/**
 * TrustChips
 * Props:
 *  - sessionId (string, required)
 *  - at (Date|string|number) optional timestamp to match nearest event (per-message chips)
 *  - compact (bool)  -> smaller chips
 *  - className (string)
 */
export default function TrustChips({ sessionId, at = null, compact = false, className = '' }) {
  const [points, setPoints] = useState([]);
  const [error, setError] = useState(null);
  const sid = useMemo(() => {
    if (!sessionId) return sessionId;
    const hex24 = /^[a-f0-9]{24}$/i;
    try {
      if (typeof sessionId === 'string' && (sessionId.startsWith('conv:') || !hex24.test(sessionId))) return sessionId;
      return `conv:${sessionId}`;
    } catch { return sessionId; }
  }, [sessionId]);

  useEffect(() => {
    let alive = true;
    async function load() {
      if (!sid) return;
      try {
        setError(null);
        const res = await axios.get('/api/insights/timeline', { params: { session_id: sid } });
        const items = res.data?.data?.points || [];
        if (alive) setPoints(Array.isArray(items) ? items : []);
      } catch (e) {
        if (alive) setError(e.response?.data?.message || e.message || 'Failed to load timeline');
      }
    }
    load();
    return () => { alive = false; };
  }, [sid]);

  const selected = useMemo(() => {
    if (!points.length) return null;
    if (!at) return points[points.length - 1];
    const t = toMs(at);
    let best = null, bestAbs = Infinity;
    for (const p of points) {
      const pt = toMs(p.at);
      const d = Math.abs((pt ?? 0) - t);
      if (d < bestAbs) { best = p; bestAbs = d; }
    }
    // Accept match if within ±5s, else ignore
    return bestAbs <= 5000 ? best : null;
  }, [points, at]);

  if (error || !selected) return null;

  const pivot = (selected.change_point_score || 0) > 0.6;
  const changeScorePct = Math.round((selected.change_point_score || 0) * 100);
  const stanceLabel = (() => {
    const from = selected.stance_from;
    const to = selected.stance_to;
    if (!from && to) return `→ ${to}`;
    if (from && !to) return `${from} →`;
    if (from && to) return `${from} → ${to}`;
    return null;
  })();

  const size = compact ? 'small' : 'medium';

  return (
    <Box className={className} sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
      {pivot && (
        <Chip size={size} color="error" variant="filled" label="Pivot" />
      )}
      <Chip size={size} color={pivot ? 'error' : 'warning'} variant={pivot ? 'outlined' : 'filled'} label={`Change: ${changeScorePct}%`} />
      {stanceLabel && (
        <Chip size={size} color="info" variant="outlined" label={stanceLabel} />
      )}
      {selected.row_hash && (
        <Tooltip title={selected.row_hash} placement="top" arrow>
          <Chip size={size} variant="outlined" label={`hash: ${selected.row_hash.slice(0, 10)}…`} />
        </Tooltip>
      )}
    </Box>
  );
}

function toMs(x) {
  if (!x) return null;
  if (x instanceof Date) return x.getTime();
  if (typeof x === 'number') return x;
  return new Date(x).getTime();
}
