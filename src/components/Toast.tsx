import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      pointerEvents: 'none'
    }}>
      {toasts.map(toast => (
        <div
          key={toast.id}
          style={{
            pointerEvents: 'auto',
            minWidth: 300,
            maxWidth: 420,
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            background: toast.type === 'success' ? '#064e3b' : toast.type === 'error' ? '#881337' : '#1e1b4b',
            border: `1px solid ${toast.type === 'success' ? '#10b981' : toast.type === 'error' ? '#f43f5e' : '#6366f1'}`,
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            animation: 'fadeIn 0.25s ease',
            color: '#fff'
          }}
        >
          <div style={{ marginTop: 2 }}>
            {toast.type === 'success' && <CheckCircle2 size={18} color="#34d399" />}
            {toast.type === 'error' && <AlertCircle size={18} color="#fb7185" />}
            {toast.type === 'info' && <Info size={18} color="#818cf8" />}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{toast.title}</div>
            {toast.message && <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>{toast.message}</div>}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              padding: 2
            }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
