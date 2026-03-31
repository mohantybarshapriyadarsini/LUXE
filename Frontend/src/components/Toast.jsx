import { useEffect } from 'react';
import './Toast.css';

export default function Toast({ toasts, onRemove }) {
  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <span className="toast-icon">{toast.icon}</span>
          <div className="toast-body">
            <p className="toast-title">{toast.title}</p>
            {toast.sub && <p className="toast-sub">{toast.sub}</p>}
          </div>
          <button className="toast-close" onClick={() => onRemove(toast.id)}>✕</button>
        </div>
      ))}
    </div>
  );
}
