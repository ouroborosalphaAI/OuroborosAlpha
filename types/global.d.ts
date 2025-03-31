import 'react';

declare global {
  // Augment Window object
  interface Window {
    solana?: {
      isPhantom?: boolean;
      publicKey?: { toBase58(): string };
      connect(): Promise<void>;
      request(params: { method: string; params?: any }): Promise<any>;
    };
  }

  // Type declarations for our application
  interface Wallet {
    id: string;
    name: string;
    encryptedKey: string;
    publicKey: string;
    createdAt: number;
  }

  interface AppSettings {
    rpcEndpoint: string;
    autoSnipe: boolean;
    rugProtection: boolean;
    slippage: number;
    feeWallet: string;
  }

  interface TokenData {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    liquidity: number;
    rugRisk: number;
    socialScore: number;
    price: number;
  }

  // Extend CSS properties
  namespace React {
    interface CSSProperties {
      '--primary'?: string;
      '--secondary'?: string;
    }
  }

  // Utility types
  type Nullable<T> = T | null;
  type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
}

// Make TypeScript recognize CSS modules
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
