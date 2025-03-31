import { Connection, Commitment } from '@solana/web3.js';

export class RpcHandler {
  private connectionCache = new Map<string, Connection>();

  async handle(request: RpcRequest): Promise<RpcResponse> {
    const { method, params, rpcUrl } = request;
    const connection = this.getConnection(rpcUrl);

    try {
      const response = await (connection as any)[method](...params);
      return { result: response };
    } catch (error) {
      console.error(`RPC ${method} failed:`, error);
      throw new Error(`RPC call failed: ${error.message}`);
    }
  }

  private getConnection(rpcUrl: string): Connection {
    if (!this.connectionCache.has(rpcUrl)) {
      this.connectionCache.set(
        rpcUrl,
        new Connection(rpcUrl, {
          commitment: 'confirmed',
          disableRetryOnRateLimit: true
        } as Commitment)
      );
    }
    return this.connectionCache.get(rpcUrl)!;
  }
}

interface RpcRequest {
  type: 'RPC_REQUEST';
  method: string;
  params: any[];
  rpcUrl: string;
}

interface RpcResponse {
  result?: any;
  error?: string;
}
