import { useState } from 'react';

export default function DeleteModal({ monitor, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(4,4,4,0.66)', animation: 'pwfade .18s ease-out' }} onClick={onClose} />
      <div role="alertdialog" style={{ position: 'relative', width: '100%', maxWidth: 404, background: '#1a1a1a', border: '0.5px solid #2a2a2a', borderRadius: 14, padding: 24, animation: 'pwrise .2s cubic-bezier(0.16,1,0.3,1)', zIndex: 1 }}>
        <div style={{ width: 42, height: 42, borderRadius: 11, background: 'rgba(226,75,74,0.1)', border: '0.5px solid rgba(226,75,74,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#E24B4A" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.3 3.6 1.8 18a2 2 0 0 0 1.7 3h16.9a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>

        <h2 style={{ margin: '16px 0 0', fontSize: 16.5, fontWeight: 600, letterSpacing: '-0.01em', color: '#f2f2f2' }}>Eliminar monitor</h2>
        <p style={{ margin: '8px 0 0', fontSize: 13.5, color: '#888', lineHeight: 1.6 }}>
          Esto eliminará permanentemente el monitor junto con todos sus registros e historial de uptime. Esta acción no se puede deshacer.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginTop: 16, background: '#101010', border: '0.5px solid #242424', borderRadius: 10, padding: '12px 14px' }}>
          <span style={{ width: 8, height: 8, flexShrink: 0, borderRadius: '50%', background: monitor?.last_status === 'up' ? '#1D9E75' : '#E24B4A', boxShadow: '0 0 8px 1px rgba(29,158,117,0.6)' }} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 500, color: '#e8e8e8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{monitor?.name}</div>
            <div style={{ fontFamily: "'Geist Mono',monospace", fontSize: 11.5, color: '#555', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 }}>{monitor?.url}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 22 }}>
          <button onClick={onClose} style={{ flex: 1, height: 39, borderRadius: 9, background: 'transparent', border: '0.5px solid #2f2f2f', color: '#cfcfcf', fontSize: 13, fontWeight: 450, cursor: 'pointer' }}>Cancelar</button>
          <button onClick={handleDelete} disabled={loading} style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, height: 39, borderRadius: 9, background: '#E24B4A', border: '0.5px solid #E24B4A', color: '#1a0606', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            {loading ? 'Eliminando…' : 'Eliminar monitor'}
          </button>
        </div>
      </div>
    </div>
  );
}
