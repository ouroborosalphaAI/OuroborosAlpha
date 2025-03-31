import React, { useEffect, useState } from 'react';
import { useStore } from '../lib/store';
import { WalletView } from './views/WalletView';
import { SettingsView } from './views/SettingsView';
import { AlertView } from './views/AlertView';
import { TabBar } from './components/TabBar';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'wallets' | 'settings' | 'alerts'>('wallets');
  const { initialize, isInitialized } = useStore();

  useEffect(() => {
    initialize();
  }, []);

  if (!isInitialized) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="app-container">
      <div className="header">
        <h1>Ouroboros Alpha</h1>
      </div>

      <TabBar activeTab={activeTab} onChangeTab={setActiveTab} />

      <div className="content">
        {activeTab === 'wallets' && <WalletView />}
        {activeTab === 'settings' && <SettingsView />}
        {activeTab === 'alerts' && <AlertView />}
      </div>
    </div>
  );
};
