import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Collapse,
  IconButton,
  Grid
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import TimelineIcon from '@mui/icons-material/Timeline';
import axios from 'axios';

const ReviewConsole = () => {
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [points, setPoints] = useState([]);
  const [events, setEvents] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);

  const loadTimeline = async () => {
    if (!sessionId.trim()) {
      setError('Please enter a session ID');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await axios.get('/api/insights/timeline', {
        params: { session_id: sessionId }
      });
      setPoints(res.data?.data?.points || []);
      
      // Also try to fetch events for bridge receipts
      try {
        const eventsRes = await axios.get('/api/events', {
          params: { session_id: sessionId }
        });
        setEvents(eventsRes.data?.events || []);
      } catch (eventsError) {
        // Events endpoint might not exist or fail, but don't break the main flow
        console.warn('Failed to load events for bridge receipts:', eventsError);
        setEvents([]);
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load timeline');
      setPoints([]);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const stanceLabel = (from, to) => {
    if (!from && to) return `→ ${to}`;
    if (from && !to) return `${from} →`;
    if (from && to) return `${from} → ${to}`;
    return 'stance change';
  };

  // Filter events for bridge receipts
  const bridgeReceipts = events.filter(e => e?.metadata?.receipt?.type === 'bridge_receipt');

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <TimelineIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Review Console</Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={8}>
          <TextField
            label="Session ID"
            fullWidth
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            placeholder="Enter a session UUID or identifier"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Button
            fullWidth
            variant="contained"
            sx={{ height: '100%' }}
            onClick={loadTimeline}
          >
            Load Timeline
          </Button>
        </Grid>
      </Grid>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
      )}

      {!loading && !error && points.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          Enter a session ID to view detected change-points and pivots.
        </Typography>
      )}

      {/* Bridge Receipts Section */}
      {bridgeReceipts.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'grey.50' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Bridge Receipts
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {bridgeReceipts.map((e, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      size="small"
                      sx={{ bgcolor: 'primary.100', color: 'primary.800', px: 1 }}
                      label={e.metadata.receipt.chosen?.agent_key || 'none'}
                    />
                    <Typography variant="body2" color="text.secondary">
                      score={e.metadata.receipt.chosen?.score ?? 'n/a'} • agents={e.metadata.receipt.agents_considered?.length ?? 0}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {points.map((p, idx) => {
          const pivot = (p.change_point_score || 0) > 0.6;
          return (
            <Card key={`${p.row_hash || idx}`} sx={{
              borderLeft: 6,
              borderLeftColor: pivot ? 'error.main' : 'warning.main',
              transition: 'box-shadow 0.2s ease',
              '&:hover': { boxShadow: 6 }
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      {new Date(p.at).toLocaleString()}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {stanceLabel(p.stance_from, p.stance_to)}
                    </Typography>
                    <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        size="small"
                        color={pivot ? 'error' : 'warning'}
                        icon={pivot ? <WarningAmberIcon /> : <CheckCircleIcon />}
                        label={`Change score: ${(p.change_point_score * 100).toFixed(0)}%`}
                      />
                      {pivot && (
                        <Chip size="small" color="error" variant="outlined" label="Pivot" />
                      )}
                      {p.row_hash && (
                        <Chip size="small" variant="outlined" label={`hash: ${p.row_hash.slice(0, 10)}…`} />
                      )}
                    </Box>
                  </Box>
                  <IconButton onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}>
                    <ExpandMoreIcon />
                  </IconButton>
                </Box>
                <Collapse in={expandedIndex === idx} timeout="auto" unmountOnExit>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Previous</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {p.evidence_window?.previous_excerpt || '—'}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary">Current</Typography>
                    <Typography variant="body2">
                      {p.evidence_window?.current_excerpt || '—'}
                    </Typography>
                  </Box>
                </Collapse>
              </CardContent>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
};

export default ReviewConsole;
