import { RpcHandler } from './rpc-handler';
import { WalletManager } from './wallet-manager';
import { AlertService } from './alert-service';

class BackgroundService {
  private rpcHandler: RpcHandler;
  private walletManager: WalletManager;
  private alertService: AlertService;

  constructor() {
    this.rpcHandler = new RpcHandler();
    this.walletManager = new WalletManager();
    this.alertService = new AlertService();

    this.setupListeners();
    this.initialize();
  }

  private setupListeners(): void {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse).then(sendResponse);
      return true; // Keep message channel open for async
    });
  }

  private async handleMessage(
    request: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ): Promise<any> {
    try {
      switch (request.type) {
        case 'RPC_REQUEST':
          return await this.rpcHandler.handle(request);
        case 'WALLET_OPERATION':
          return await this.walletManager.handle(request);
        case 'ALERT_SUBSCRIPTION':
          return this.alertService.handleSubscription(request);
        default:
          throw new Error(`Unhandled message type: ${request.type}`);
      }
    } catch (error) {
      console.error('Background error:', error);
      return { error: error.message };
    }
  }

  private async initialize(): Promise<void> {
    await this.walletManager.initialize();
    this.alertService.startMonitoring();
  }
}

new BackgroundService();
