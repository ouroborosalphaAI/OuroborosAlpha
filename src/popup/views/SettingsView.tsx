import React, { useState, useEffect } from 'react';
import { useStore } from '../../lib/store';
import { Button, Input, Alert, Card, Switch } from './components/UI';

export const SettingsView: React.FC = () => {
  const { rpcEndpoint, setRpcEndpoint, settings, updateSettings } = useStore();
  const [customRpc, setCustomRpc] = useState(rpcEndpoint);
  const [isTesting, setIsTesting] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);
  const [error, setError] = useState('');

  const testRpcConnection = async () => {
    setIsTesting(true);
    setError('');
    
    try {
      const start = Date.now();
      const response = await fetch(customRpc, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getVersion',
          params: []
        })
      });
      
      if (!response.ok) throw new Error('RPC request failed');
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      
      setLatency(Date.now() - start);
    } catch (err) {
      setError(err.message);
      setLatency(null);
    } finally {
      setIsTesting(false);
    }
  };

  const saveSettings = () => {
    setRpcEndpoint(customRpc);
    updateSettings({
      ...settings,
      rpcEndpoint: customRpc
    });
  };

  useEffect(() => {
    setCustomRpc(rpcEndpoint);
  }, [rpcEndpoint]);

  return (
    <Card title="Configuration Settings">
      <div className="space-y-6">
        <div>
          <h3 className="font-medium mb-3">RPC Configuration</h3>
          <div className="space-y-4">
            <Input
              label="Custom RPC Endpoint"
              value={customRpc}
              onChange={setCustomRpc}
              placeholder="https://api.mainnet-beta.solana.com"
            />
            
            <div className="flex items-center space-x-3">
              <Button 
                onClick={testRpcConnection} 
                loading={isTesting}
                disabled={isTesting}
              >
                Test Connection
              </Button>
              {latency !== null && (
                <span className="text-sm">
                  Latency: <span className="font-mono">{latency}ms</span>
                </span>
              )}
            </div>

            {error && <Alert type="error">{error}</Alert>}

            <Button 
              onClick={saveSettings}
              variant="primary"
              fullWidth
              disabled={!!error || isTesting}
            >
              Save Settings
            </Button>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-medium mb-3">Trading Preferences</h3>
          <div className="space-y-3">
            <Switch
              label="Enable Auto-Snipe"
              checked={settings.autoSnipe}
              onChange={(checked) => updateSettings({ autoSnipe: checked })}
            />
            <Switch
              label="Rug-Pull Protection"
              checked={settings.rugProtection}
              onChange={(checked) => updateSettings({ rugProtection: checked })}
            />
            <Input
              label="Max Slippage (%)"
              type="number"
              value={settings.slippage.toString()}
              onChange={(val) => updateSettings({ slippage: parseFloat(val) || 0 })}
              min="0"
              max="100"
              step="0.1"
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
