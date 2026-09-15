import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

const connectorId = '6aa93326ea3e93a0d60330a3';
export default function useGitHubMetadata(enabled) {
  const [state, setState] = useState({ loading: true, connected: false, data: null, error: '' });
  const load = useCallback(async () => {
    if (!enabled) return;
    setState(current => ({ ...current, loading: true, error: '' }));
    try { const response = await base44.functions.invoke('refreshModelMetadata', { action: 'status' }); setState({ loading: false, connected: true, data: response.data, error: '' }); }
    catch { setState({ loading: false, connected: false, data: null, error: '' }); }
  }, [enabled]);
  useEffect(() => { load(); }, [load]);
  const connect = async () => {
    const url = await base44.connectors.connectAppUser(connectorId);
    const popup = window.open(url, '_blank');
    const timer = window.setInterval(() => { if (!popup || popup.closed) { window.clearInterval(timer); load(); } }, 500);
  };
  const disconnect = async () => { await base44.connectors.disconnectAppUser(connectorId); setState({ loading: false, connected: false, data: null, error: '' }); };
  const refresh = async () => {
    setState(current => ({ ...current, loading: true, error: '' }));
    try { const response = await base44.functions.invoke('refreshModelMetadata', { action: 'refresh' }); setState({ loading: false, connected: true, data: response.data, error: '' }); }
    catch (error) { setState(current => ({ ...current, loading: false, error: error.response?.data?.error || error.message })); }
  };
  return { ...state, connect, disconnect, refresh };
}