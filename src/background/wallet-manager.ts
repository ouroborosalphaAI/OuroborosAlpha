import { Keypair } from '@solana/web3.js';
import { encryptData, decryptData } from '../utils/encryption';

interface Wallet {
  id: string;
  name: string;
  encryptedKey: string;
  isActive: boolean;
}

export class WalletManager {
  private wallets: Wallet[] = [];
  private activeWallet: Keypair | null = null;

  async initialize(): Promise<void> {
    const storedWallets = await this.getStoredWallets();
    this.wallets = storedWallets;
  }

  async handle(request: WalletRequest): Promise<WalletResponse> {
    switch (request.action) {
      case 'IMPORT':
        return this.importWallet(request);
      case 'EXPORT':
        return this.exportWallet(request);
      case 'SET_ACTIVE':
        return this.setActiveWallet(request);
      case 'LIST':
        return this.listWallets();
      default:
        throw new Error(`Invalid wallet action: ${request.action}`);
    }
  }

  private async importWallet(request: ImportWalletRequest): Promise<WalletResponse> {
    const { privateKey, name, password } = request;
    const keypair = Keypair.fromSecretKey(new Uint8Array(JSON.parse(privateKey)));
    const encryptedKey = await encryptData(privateKey, password);

    const wallet: Wallet = {
      id: this.generateId(),
      name,
      encryptedKey,
      isActive: false
    };

    this.wallets.push(wallet);
    await this.saveWallets();

    return {
      success: true,
      walletId: wallet.id
    };
  }

  private async setActiveWallet(request: SetActiveWalletRequest): Promise<WalletResponse> {
    const { walletId, password } = request;
    const wallet = this.wallets.find(w => w.id === walletId);
    
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    const decryptedKey = await decryptData(wallet.encryptedKey, password);
    this.activeWallet = Keypair.fromSecretKey(new Uint8Array(JSON.parse(decryptedKey)));

    return { success: true };
  }

  private async listWallets(): Promise<WalletListResponse> {
    return {
      wallets: this.wallets.map(w => ({
        id: w.id,
        name: w.name,
        isActive: w.isActive
      }))
    };
  }

  private async getStoredWallets(): Promise<Wallet[]> {
    return new Promise(resolve => {
      chrome.storage.local.get(['wallets'], result => {
        resolve(result.wallets || []);
      });
    });
  }

  private async saveWallets(): Promise<void> {
    return new Promise(resolve => {
      chrome.storage.local.set({ wallets: this.wallets }, () => resolve());
    });
  }

  private generateId(): string {
    return crypto.randomUUID();
  }
}

type WalletRequest = ImportWalletRequest | ExportWalletRequest | SetActiveWalletRequest | ListWalletsRequest;

interface ImportWalletRequest {
  action: 'IMPORT';
  privateKey: string;
  name: string;
  password: string;
}

interface SetActiveWalletRequest {
  action: 'SET_ACTIVE';
  walletId: string;
  password: string;
}

interface ListWalletsRequest {
  action: 'LIST';
}

type WalletResponse = {
  success: boolean;
  walletId?: string;
  wallets?: Array<{
    id: string;
    name: string;
    isActive: boolean;
  }>;
};
