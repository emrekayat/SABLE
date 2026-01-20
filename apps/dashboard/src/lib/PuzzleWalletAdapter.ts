import { 
  BaseMessageSignerWalletAdapter,
  WalletReadyState, 
  WalletName,
  WalletNotConnectedError,
  WalletError
} from "@demox-labs/aleo-wallet-adapter-base";
import { connect, disconnect, Network } from "@puzzlehq/sdk-core";

export const PuzzleWalletName = "Puzzle" as WalletName<"Puzzle">;

export class PuzzleWalletAdapter extends BaseMessageSignerWalletAdapter {
  name = PuzzleWalletName;
  url = "https://puzzle.online";
  icon = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHJ4PSI0IiBmaWxsPSIjNjM2NkYxIi8+CiAgPHBhdGggZD0iTTEyIDZMMTggMTJMMTIgMThMNiAxMkwxMiA2WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+";
  supportedTransactionVersions = null;
  transitionViewKeys: any = null;

  private _publicKey: string | null = null;
  private _connecting = false;
  private _connected = false;

  get publicKey() {
    return this._publicKey;
  }

  get connecting() {
    return this._connecting;
  }

  get connected() {
    return this._connected;
  }

  get readyState() {
    // Puzzle Wallet is always installed if SDK is present
    return WalletReadyState.Installed;
  }

  async connect(): Promise<void> {
    try {
      if (this._connected) {
        console.log("[PuzzleWallet] Already connected");
        return;
      }
      
      this._connecting = true;
      
      console.log("[PuzzleWallet] Connecting using @puzzlehq/sdk-core...");
      
      const response = await connect({
        dAppInfo: {
          name: "SABLE",
          description: "Private Payroll Distribution on Aleo",
          iconUrl: "https://sable.aleo/icon.png",
        },
        permissions: {
          programIds: {
            [Network.AleoTestnet]: ["sable_payroll.aleo"],
          },
        },
      });

      console.log("[PuzzleWallet] Connection response:", response);
      
      this._publicKey = response.connection.address;
      this._connected = true;
      
      console.log("[PuzzleWallet] Connected successfully with address:", this._publicKey);
      
      this.emit('connect', this._publicKey);
      
    } catch (error) {
      console.error("[PuzzleWallet] Connection error:", error);
      const walletError = error instanceof WalletError ? error : new WalletError(String(error));
      this.emit('error', walletError);
      throw error;
    } finally {
      this._connecting = false;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await disconnect();
      this._publicKey = null;
      this._connected = false;
      this.emit('disconnect');
      this.emit('disconnect');
    } catch (error) {
      console.error("[PuzzleWallet] Disconnect error:", error);
      throw error;
    }
  }

  async requestTransaction(_params: any): Promise<string> {
    if (!this._connected || !this._publicKey) {
      throw new WalletNotConnectedError();
    }
    throw new Error("Transaction support for Puzzle wallet coming soon");
  }

  async requestRecords(_program: string): Promise<any[]> {
    throw new Error("requestRecords not supported");
  }

  async requestExecution(_params: any): Promise<string> {
    throw new Error("requestExecution not supported");
  }

  async requestBulkTransactions(_transactions: any[]): Promise<string[]> {
    throw new Error("requestBulkTransactions not supported");
  }

  async requestDeploy(_params: any): Promise<string> {
    throw new Error("requestDeploy not supported");
  }

  async transactionStatus(_transactionId: string): Promise<string> {
    throw new Error("transactionStatus not supported");
  }

  async getExecution(_transactionId: string): Promise<string> {
    throw new Error("getExecution not supported");
  }

  async requestRecordPlaintexts(_program: string): Promise<any[]> {
    throw new Error("requestRecordPlaintexts not supported");
  }

  async requestTransactionHistory(_program: string): Promise<any[]> {
    throw new Error("requestTransactionHistory not supported");
  }

  async signMessage(_message: Uint8Array): Promise<Uint8Array> {
    throw new Error("Message signing not supported");
  }

  async decrypt(_cipherText: string): Promise<string> {
    throw new Error("Decryption not supported");
  }
}
