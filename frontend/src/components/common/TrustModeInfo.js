import React, { useState } from 'react';
import { IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export default function TrustModeInfo({ size = 'small' }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Tooltip title="What is Trust Mode?">
        <IconButton size={size} onClick={() => setOpen(true)} aria-label="trust-mode-info">
          <InfoOutlinedIcon fontSize="inherit" />
        </IconButton>
      </Tooltip>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Trust Mode</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2">
              Trust Mode explains how SYMBI evaluates conversation turns and shows trust overlays (Pivot, Change %, Stance, Row‑hash).
            </Typography>
            <Typography variant="body2">
              In this POC, Trust Mode is <strong>Heuristic (local)</strong>: lightweight on‑server heuristics derived from the conversation ledger.
            </Typography>
            <Typography variant="body2">
              No external governance layers are enabled. Session memory is provided via <strong>Context Capsules</strong> (goals, tone, constraints).
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} variant="contained">Got it</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

