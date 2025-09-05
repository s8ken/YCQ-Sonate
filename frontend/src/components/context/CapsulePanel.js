import React, { useEffect, useMemo, useState } from 'react';
import { Box, Paper, Typography, TextField, Button } from '@mui/material';
import axios from 'axios';

export default function CapsulePanel({ sessionId }) {
  const [capsule, setCapsule] = useState({ goals: [], tone_prefs: [], constraints: [], tags: [], notes: '' });
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sid = useMemo(() => {
    if (!sessionId) return sessionId;
    const hex24 = /^[a-f0-9]{24}$/i;
    return typeof sessionId === 'string' && (sessionId.startsWith('conv:') || !hex24.test(sessionId)) ? sessionId : `conv:${sessionId}`;
  }, [sessionId]);

  useEffect(() => {
    let alive = true;
    async function load() {
      if (!sid) return;
      try {
        setLoading(true);
        const r = await axios.get(`/api/context/capsule/${encodeURIComponent(sid)}`);
        const c = r.data?.capsule || { goals: [], tone_prefs: [], constraints: [], tags: [], notes: '' };
        if (alive) { setCapsule(c); setDirty(false); setError(null); }
      } catch (e) {
        if (alive) setError(e.response?.data?.message || e.message || 'Failed to load capsule');
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, [sid]);

  const save = async () => {
    if (!sid) return;
    try {
      setLoading(true);
      await axios.put(`/api/context/capsule/${encodeURIComponent(sid)}`, { capsule });
      setDirty(false);
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Failed to save capsule');
    } finally {
      setLoading(false);
    }
  };

  const bind = (key, isArray = true) => ({
    value: isArray ? (Array.isArray(capsule[key]) ? capsule[key].join(', ') : '') : (capsule[key] || ''),
    onChange: (e) => {
      const v = e.target.value;
      const next = isArray ? v.split(',').map(s => s.trim()).filter(Boolean) : v;
      setCapsule(prev => ({ ...prev, [key]: next }));
      setDirty(true);
    }
  });

  if (!sid) return null;

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Context Capsule
      </Typography>
      {error && (
        <Typography color="error" variant="body2" sx={{ mb: 1 }}>{error}</Typography>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <TextField label="Goals (comma-separated)" size="small" {...bind('goals', true)} />
        <TextField label="Tone (comma-separated)" size="small" {...bind('tone_prefs', true)} />
        <TextField label="Constraints (comma-separated)" size="small" {...bind('constraints', true)} />
        <TextField label="Tags (comma-separated)" size="small" {...bind('tags', true)} />
        <TextField label="Notes" size="small" multiline minRows={3} {...bind('notes', false)} />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button variant="contained" onClick={save} disabled={!dirty || loading}>
            {loading ? 'Saving…' : 'Save'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

