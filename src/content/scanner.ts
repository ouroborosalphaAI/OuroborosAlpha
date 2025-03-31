import { Connection } from '@solana/web3.js';
import { sendAlert } from '../utils/alerts';

export class Scanner {
  private scanInterval = 5000; // 5 seconds
  private activeScan = false;
  private knownTokens = new Set<string>();

  async startScanning(): Promise<void> {
    if (this.activeScan) return;
    this.activeScan = true;

    const rpcUrl = await this.getRpcUrl();
    const connection = new Connection(rpcUrl);

    setInterval(async () => {
      try {
        const newTokens = await this.scanNewTokens(connection);
        this.processNewTokens(newTokens);
      } catch (error) {
        console.error('Scan error:', error);
      }
    }, this.scanInterval);
  }

  private async scanNewTokens(connection: Connection): Promise<TokenData[]> {
    // Implementation would query pump.fun contracts
    // This is a simplified simulation
    return [{
      address: 'simulatedToken' + Math.random().toString(36).substring(7),
      name: 'SIM',
      liquidity: Math.random() * 20,
      created: new Date(),
      rugRisk: Math.random() * 100
    }];
  }

  private processNewTokens(tokens: TokenData[]): void {
    tokens.forEach(token => {
      if (!this.knownTokens.has(token.address)) {
        this.knownTokens.add(token.address);
        this.evaluateToken(token);
      }
    });
  }

  private evaluateToken(token: TokenData): void {
    if (token.rugRisk > 70) {
      sendAlert('rug', {
        token: token.name,
        risk: token.rugRisk,
        liquidity: token.liquidity
      });
    }
  }

  private async getRpcUrl(): Promise<string> {
    return new Promise(resolve => {
      chrome.storage.sync.get(['rpcUrl'], result => {
        resolve(result.rpcUrl || 'https://api.mainnet-beta.solana.com');
      });
    });
  }
}

interface TokenData {
  address: string;
  name: string;
  liquidity: number;
  created: Date;
  rugRisk: number;
}
