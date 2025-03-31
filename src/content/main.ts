import { Scanner } from './scanner';
import { OverlayManager } from './overlay';
import { AlertHandler } from './alert-handler';

class ContentScript {
  private scanner: Scanner;
  private overlay: OverlayManager;
  private alertHandler: AlertHandler;

  constructor() {
    this.scanner = new Scanner();
    this.overlay = new OverlayManager();
    this.alertHandler = new AlertHandler();

    this.initialize();
  }

  private initialize(): void {
    this.scanner.startScanning();
    this.overlay.inject();
    this.setupMessageListener();
  }

  private setupMessageListener(): void {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.alertHandler.handle(message).then(sendResponse);
      return true; // Keep message channel open
    });
  }
}

new ContentScript();
