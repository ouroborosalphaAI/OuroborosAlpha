import { sendTransaction } from '../lib/solana/transactions';

export type AlertType = 'rug' | 'pump' | 'whale';

interface AlertThresholds {
  rugRisk: number;
  minLiquidity: number;
  maxLiquidity: number;
  socialMentions: number;
}

export class AlertService {
  private static DEFAULT_THRESHOLDS: AlertThresholds = {
    rugRisk: 65,
    minLiquidity: 5,
    maxLiquidity: 50,
    socialMentions: 30
  };

  static shouldAlert(token: TokenData, customThresholds?: Partial<AlertThresholds>): boolean {
    const thresholds = { ...this.DEFAULT_THRESHOLDS, ...customThresholds };
    
    return (
      token.rugRisk > thresholds.rugRisk ||
      token.liquidity < thresholds.minLiquidity ||
      token.liquidity > thresholds.maxLiquidity ||
      token.socialMentions > thresholds.socialMentions
    );
  }

  static async handleAutomatedAction(
    alertType: AlertType,
    token: TokenData,
    wallet: Keypair,
    rpcUrl: string
  ): Promise<string | null> {
    switch (alertType) {
      case 'rug':
        return this.handleRugAlert(token, wallet, rpcUrl);
      case 'pump':
        return this.handlePumpAlert(token, wallet, rpcUrl);
      default:
        return null;
    }
  }

  private static async handleRugAlert(
    token: TokenData,
    wallet: Keypair,
    rpcUrl: string
  ): Promise<string | null> {
    if (!token.position) return null;
    
    // Sell the position if we detect a rug
    return sendTransaction({
      wallet,
      rpcUrl,
      instructions: [
        // Would include actual sell instructions for pump.fun
      ]
    });
  }

  private static async handlePumpAlert(
    token: TokenData,
    wallet: Keypair,
    rpcUrl: string
  ): Promise<string | null> {
    // Buy the token if it meets pump criteria
    return sendTransaction({
      wallet,
      rpcUrl,
      instructions: [
        // Would include actual buy instructions for pump.fun
      ],
      amount: token.suggestedBuyAmount
    });
  }
}

interface TokenData {
  address: string;
  name: string;
  rugRisk: number;
  liquidity: number;
  socialMentions: number;
  position?: {
    amount: number;
    value: number;
  };
  suggestedBuyAmount?: number;
}

export function sendAlert(type: AlertType, data: any): void {
  chrome.runtime.sendMessage({
    type: 'ALERT',
    alertType: type,
    data: {
      ...data,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    }
  });
}
