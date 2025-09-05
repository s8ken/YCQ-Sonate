import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, FormControl, InputLabel, Select, MenuItem,
  CircularProgress, Box
} from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import axios from 'axios';

export default function AssistantEditDialog({ open, onClose, assistant }) {
  const [name, setName] = useState(assistant?.name || '');
  const [instructions, setInstructions] = useState(assistant?.instructions || '');
  const [model, setModel] = useState(assistant?.model || 'gpt-4o');
  const [toolsText, setToolsText] = useState(JSON.stringify(assistant?.tools || [], null, 2));
  const [models, setModels] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setName(assistant?.name || '');
    setInstructions(assistant?.instructions || '');
    setModel(assistant?.model || 'gpt-4o');
    setToolsText(JSON.stringify(assistant?.tools || [], null, 2));
  }, [assistant]);

  useEffect(() => {
    async function loadModels() {
      try {
        const r = await axios.get('/api/llm/models/openai');
        const list = r.data?.data?.models || [];
        const ids = list.map(m => m.id || m.name).filter(Boolean);
        setModels(ids);
      } catch {
        setModels(['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo']);
      }
    }
    if (open) loadModels();
  }, [open]);

  const handleSave = async () => {
    if (!assistant?.id && !assistant?.assistantId) return onClose?.(false);
    try {
      setSaving(true);
      const tools = JSON.parse(toolsText || '[]');
      const id = assistant.id || assistant.assistantId;
      await axios.put(`/api/assistant/${id}`, { name, instructions, model, tools });
      onClose?.(true);
    } catch (e) {
      setError(e.response?.data?.details || e.message || 'Failed to save');
      onClose?.(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => onClose?.(false)} maxWidth="md" fullWidth>
      <DialogTitle>Edit Assistant</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField label="Name" value={name} onChange={(e)=>setName(e.target.value)} fullWidth />
          <FormControl fullWidth>
            <InputLabel>Model</InputLabel>
            <Select value={model} label="Model" onChange={(e)=>setModel(e.target.value)}>
              {[model, ...models].filter((v,i,a)=>a.indexOf(v)===i).map(m => (
                <MenuItem key={m} value={m}>{m}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField label="Instructions" value={instructions} onChange={(e)=>setInstructions(e.target.value)} fullWidth multiline rows={6} />
          <TextField label="Tools (JSON array)" value={toolsText} onChange={(e)=>setToolsText(e.target.value)} fullWidth multiline rows={4} />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={()=>onClose?.(false)}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving} startIcon={saving ? <CircularProgress size={18}/> : null}>
          Save
        </Button>
      </DialogActions>
      <Snackbar open={!!error} autoHideDuration={5000} onClose={() => setError('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <MuiAlert onClose={() => setError('')} severity="error" elevation={6} variant="filled" sx={{ width: '100%' }}>
          {error}
        </MuiAlert>
      </Snackbar>
    </Dialog>
  );
}
