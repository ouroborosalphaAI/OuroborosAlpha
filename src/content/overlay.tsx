import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { OverlayUI } from '../../src/popup/components/OverlayUI';

const OverlayManager = {
  containerId: 'ouroboros-overlay-root',
  styleId: 'ouroboros-overlay-styles',

  inject(): void {
    if (document.getElementById(this.containerId)) return;

    // Create container
    const container = document.createElement('div');
    container.id = this.containerId;
    document.body.appendChild(container);

    // Inject styles
    const style = document.createElement('style');
    style.id = this.styleId;
    style.textContent = this.getStyles();
    document.head.appendChild(style);

    // Render React component
    const root = createRoot(container);
    root.render(<OverlayContainer />);
  },

  getStyles(): string {
    return `
      #${this.containerId} {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
        font-family: 'Inter', sans-serif;
      }
      .ouroboros-alert {
        background: #1e1e2d;
        border: 1px solid #9945FF;
        border-radius: 8px;
        padding: 16px;
        width: 300px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
    `;
  }
};

const OverlayContainer: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'ALERT') {
        setAlerts(prev => [...prev, message.data]);
      }
    });
  }, []);

  const dismissAlert = (id: string): void => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  if (alerts.length === 0) return null;

  return (
    <div className="ouroboros-overlay">
      {alerts.map(alert => (
        <OverlayUI
          key={alert.id}
          alert={alert}
          onDismiss={dismissAlert}
        />
      ))}
    </div>
  );
};

interface Alert {
  id: string;
  type: 'rug' | 'pump' | 'whale';
  token: string;
  risk?: number;
  liquidity?: number;
}

export { OverlayManager };
