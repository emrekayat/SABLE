import { 
  BaseMessageSignerWalletAdapter,
  WalletReadyState, 
  WalletName,
  WalletNotConnectedError,
  WalletError
} from "@demox-labs/aleo-wallet-adapter-base";
import { connect, disconnect, Network, requestCreateEvent, EventType, getEvent } from "@puzzlehq/sdk-core";

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
            [Network.AleoTestnet]: ["sable_payroll.aleo", "sable_payroll_v2.aleo", "sable_payroll_zk.aleo"],
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

  async requestTransaction(params: any): Promise<string> {
    if (!this._connected || !this._publicKey) {
      throw new WalletNotConnectedError();
    }
    
    try {
      console.log("[PuzzleWallet] Requesting transaction:", params);
      
      const response = await requestCreateEvent({
        type: EventType.Execute,
        programId: params.program || "sable_payroll.aleo",
        functionId: params.functionName || params.function || "process_batch",
        inputs: params.inputs || [],
        fee: params.fee || 0.1,
        address: this._publicKey,
      });
      
      console.log("[PuzzleWallet] Transaction event created:", response);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (!response.eventId) {
        throw new Error("No event ID returned from Puzzle Wallet");
      }
      
      const eventId = response.eventId;
      console.log("[PuzzleWallet] ✅ Event created successfully!");
      console.log("[PuzzleWallet] 📱 Event ID:", eventId);
      console.log("[PuzzleWallet] ⏳ Waiting for user approval in Puzzle Wallet extension...");
      
      // Poll for event status - wait for user approval
      return new Promise((resolve, reject) => {
        let isResolved = false;
        
        const checkInterval = setInterval(async () => {
          if (isResolved) return;
          
          try {
            const eventData = await getEvent({ id: eventId, address: this._publicKey || undefined });
            const status = eventData.event.status;
            console.log("[PuzzleWallet] Event status check:", status);
            
            // Check for success (case-insensitive)
            if (status?.toLowerCase() === 'settled' || status?.toLowerCase() === 'completed') {
              isResolved = true;
              clearInterval(checkInterval);
              
              // Log full event data to see transaction ID
              console.log("[PuzzleWallet] Full event data:", eventData.event);
              
              // Get transaction ID from event (common fields: transactionId, txId, transaction_id)
              const txId = (eventData.event as any).transactionId || 
                           (eventData.event as any).txId || 
                           (eventData.event as any).transaction_id ||
                           (eventData.event as any).id;
              
              console.log("[PuzzleWallet] ✅ Transaction approved and settled!");
              if (txId && txId !== eventId) {
                console.log("[PuzzleWallet] 🔗 Transaction ID:", txId);
              }
              
              // Return transaction ID if available, otherwise event ID
              resolve(txId || eventId);
            } 
            // Check for rejection (case-insensitive)
            else if (status?.toLowerCase() === 'rejected' || status?.toLowerCase() === 'failed') {
              isResolved = true;
              clearInterval(checkInterval);
              reject(new WalletError("Transaction rejected by user"));
            }
            // Continue polling if status is 'pending', 'creating', etc.
          } catch (pollError) {
            console.error("[PuzzleWallet] Error checking event status:", pollError);
          }
        }, 2000); // Check every 2 seconds
        
        // 120 second timeout (2 minutes)
        setTimeout(() => {
          if (!isResolved) {
            clearInterval(checkInterval);
            reject(new WalletError("Transaction approval timeout - please check Puzzle Wallet extension"));
          }
        }, 120000);
      });
    } catch (error) {
      console.error("[PuzzleWallet] Transaction error:", error);
      throw new WalletError("Failed to create transaction: " + (error as Error).message);
    }
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
