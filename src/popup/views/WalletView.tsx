import React, { useState, useEffect } from 'react';
import { useStore } from '../../lib/store';
import { Button, Input, Alert, Card } from './components/UI';
import { encryptData } from '../../utils/encryption';

export const WalletView: React.FC = () => {
  const { wallets, activeWallet, addWallet, setActiveWallet } = useStore();
  const [privateKey, setPrivateKey] = useState('');
  const [walletName, setWalletName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleImport = async () => {
    try {
      if (!privateKey || !walletName || !password) {
        throw new Error('All fields are required');
      }

      // Basic validation for private key (exact length for byte array)
      if (!privateKey.match(/^\[(\d+,){31}\d+\]$/)) {
        throw new Error('Invalid private key format');
      }

      const encryptedKey = await encryptData(privateKey, password);
      const walletId = await addWallet({
        name: walletName,
        encryptedKey,
        publicKey: derivePublicKey(privateKey)
      });

      setSuccess(`Wallet "${walletName}" imported successfully`);
      setPrivateKey('');
      setWalletName('');
      setPassword('');
      setError('');
    } catch (err) {
      setError(err.message);
      setSuccess('');
    }
  };

  const handleSetActive = (walletId: string) => {
    setActiveWallet(walletId);
  };

  return (
    <Card title="Wallet Management">
      {error && <Alert type="error">{error}</Alert>}
      {success && <Alert type="success">{success}</Alert>}

      <div className="space-y-4">
        <Input
          label="Private Key (Array Format)"
          value={privateKey}
          onChange={setPrivateKey}
          placeholder="[1,2,3,...,32]"
          type="password"
        />
        <Input
          label="Wallet Name"
          value={walletName}
          onChange={setWalletName}
          placeholder="My Trading Wallet"
        />
        <Input
          label="Encryption Password"
          value={password}
          onChange={setPassword}
          type="password"
          placeholder="••••••••"
        />
        <Button onClick={handleImport} fullWidth>
          Import Wallet
        </Button>
      </div>

      <div className="mt-6">
        <h3 className="font-medium mb-2">Your Wallets</h3>
        <div className="space-y-2">
          {wallets.map((wallet) => (
            <div 
              key={wallet.id}
              className={`p-3 border rounded flex justify-between items-center ${
                wallet.id === activeWallet?.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
              }`}
            >
              <div>
                <p className="font-medium">{wallet.name}</p>
                <p className="text-sm text-gray-500 truncate">{wallet.publicKey}</p>
              </div>
              {wallet.id !== activeWallet?.id && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleSetActive(wallet.id)}
                >
                  Activate
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

// Helper function (would be in separate utils file)
function derivePublicKey(privateKey: string): string {
  try {
    const keypair = Keypair.fromSecretKey(new Uint8Array(JSON.parse(privateKey)));
    return keypair.publicKey.toString();
  } catch {
    return 'Invalid key';
  }
}
