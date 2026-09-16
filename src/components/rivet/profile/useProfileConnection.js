import { useCallback, useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';

export default function useProfileConnection(provider, onSaved) {
  const [state, setState] = useState({ busy: true, connected: false, error: '' });
  const timer = useRef(null), mounted = useRef(true);
  const run = useCallback(async (action = 'status') => {
    setState(s => ({ ...s, busy: true, error: '' }));
    try {
      const { data } = await base44.functions.invoke('syncProfessionalProfile', { provider: provider.key, action });
      if (data.error) throw new Error(data.error);
      if (mounted.current) { setState({ busy: false, connected: true, error: '' }); if (action === 'sync') onSaved(); }
    } catch (error) {
      if (mounted.current) setState(s => ({ ...s, busy: false, connected: action === 'status' ? false : s.connected, error: error.response?.data?.error || error.message }));
    }
  }, [provider.key, onSaved]);
  useEffect(() => { mounted.current = true; run(); return () => { mounted.current = false; window.clearInterval(timer.current); }; }, [run]);
  const connect = async () => {
    const popup = window.open('about:blank', '_blank');
    if (!popup) { setState(s => ({ ...s, error: 'Allow pop-ups, then try connecting again.' })); return; }
    setState(s => ({ ...s, busy: true, error: '' }));
    try {
      popup.location.href = await base44.connectors.connectAppUser(provider.connectorId);
      timer.current = window.setInterval(() => {
        if (popup.closed) { window.clearInterval(timer.current); if (mounted.current) run('sync'); }
      }, 500);
    } catch (error) { popup.close(); setState(s => ({ ...s, busy: false, error: error.message })); }
  };
  const disconnect = async () => {
    setState(s => ({ ...s, busy: true, error: '' }));
    try {
      await base44.functions.invoke('syncProfessionalProfile', { provider: provider.key, action: 'remove' });
      onSaved();
      await base44.connectors.disconnectAppUser(provider.connectorId);
      if (mounted.current) setState({ busy: false, connected: false, error: '' });
    } catch (error) { if (mounted.current) setState(s => ({ ...s, busy: false, error: error.response?.data?.error || error.message })); }
  };
  return { ...state, connect, disconnect, refresh: () => run('sync'), retry: () => run() };
}