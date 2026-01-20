"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { StatCard, Button, Card, ProofGeneratorModal } from "@repo/ui";
import { TransactionProgress } from "@repo/aleo-sdk";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import { WalletMultiButton } from "@demox-labs/aleo-wallet-adapter-reactui";

export default function HomePage() {
  const { publicKey, connected, requestTransaction } = useWallet();
  const [showProofModal, setShowProofModal] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string>("");
  const [proofProgress, setProofProgress] = useState<TransactionProgress>({
    batchId: "batch_001",
    total: 30,
    completed: 0,
    status: "pending",
  });

  // Debug: Log wallet state changes
  useEffect(() => {
    console.log("[Dashboard] Wallet state changed:", { connected, publicKey });
  }, [connected, publicKey]);

  const handleRunPayroll = async () => {
    if (!connected || !requestTransaction) {
      alert("Please connect your wallet first");
      return;
    }

    setShowProofModal(true);
    await executePayrollTransaction();
  };

  const executePayrollTransaction = async () => {
    try {
      // Step 1: Initializing
      setProofProgress((prev) => ({
        ...prev,
        completed: 20,
        status: "processing",
        currentEmployee: "Preparing batch_001",
      }));
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Step 2: Generating Witness
      setProofProgress((prev) => ({
        ...prev,
        completed: 40,
        currentEmployee: "Processing employee records...",
      }));
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Step 3: Request transaction from Leo Wallet
      setProofProgress((prev) => ({
        ...prev,
        completed: 60,
        currentEmployee: "Waiting for wallet approval...",
      }));

      if (!requestTransaction) {
        throw new Error("Wallet not connected");
      }

      // Call the real deployed contract on testnet
      const aleoTransaction = await requestTransaction({
        program: "sable_payroll.aleo",
        function: "process_batch",
        inputs: [
          "1field", // batch_id
          "2400000u64", // total_amount
          "30u32" // employee_count
        ],
        fee: 100000, // 0.0001 Aleo
      } as any);

      if (!aleoTransaction) {
        throw new Error("Transaction rejected or failed");
      }

      // Step 4: Transaction submitted
      setProofProgress((prev) => ({
        ...prev,
        completed: 80,
        currentEmployee: "Transaction submitted to network...",
      }));
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Step 5: Complete
      setProofProgress((prev) => ({
        ...prev,
        completed: 100,
        status: "completed",
        currentEmployee: "Payroll distribution complete!",
      }));

      // Set the real transaction hash
      setTransactionHash(String(aleoTransaction));

      // Auto-close modal after completion
      setTimeout(() => {
        setShowProofModal(false);
        // Reset for next run
        setTimeout(() => {
          setProofProgress({
            batchId: "batch_001",
            total: 30,
            completed: 0,
            status: "pending",
          });
          setTransactionHash("");
        }, 500);
      }, 3000);
    } catch (error) {
      console.error("Payroll transaction failed:", error);
      alert(`Transaction failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      setShowProofModal(false);
      setProofProgress({
        batchId: "batch_001",
        total: 30,
        completed: 0,
        status: "pending",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">SABLE</h1>
                <p className="text-xs text-gray-500">The Invisible Engine</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {connected && publicKey ? (
                <div className="flex items-center gap-3">
                  <div className="text-sm">
                    <p className="text-gray-500 flex items-center gap-2">
                      Connected
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                        Wallet
                      </span>
                    </p>
                    <p className="font-mono text-xs text-gray-700">
                      {publicKey.slice(0, 10)}...{publicKey.slice(-8)}
                    </p>
                  </div>
                  <WalletMultiButton />
                </div>
              ) : (
                <WalletMultiButton />
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Executive Dashboard
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            100% Financial Privacy. 100% Audit Compliance. Zero Compromise.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <StatCard
            label="Total Payroll (This Month)"
            value="$2.4M"
            trend={{ value: 12, isPositive: true }}
            description="Across 847 employees"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            label="Active Employees"
            value="847"
            trend={{ value: 3, isPositive: true }}
            description="Shielded identities"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
          <StatCard
            label="ZK Proofs Generated"
            value="12,847"
            trend={{ value: 28, isPositive: true }}
            description="All-time transaction count"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            }
          />
        </motion.div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Treasury Overview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card hover>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Treasury Overview</h3>
                  <p className="text-gray-600">Encrypted balance and multi-sig status</p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Available Balance</span>
                  <span className="font-mono font-bold text-gray-900">████████ Aleo</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Authorized Signers</span>
                  <span className="text-gray-900 font-semibold">3 of 5</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-600">Last Allocation</span>
                  <span className="text-gray-900 font-semibold">2 hours ago</span>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button variant="secondary" size="sm" className="flex-1">
                  View Details
                </Button>
                <Button variant="ghost" size="sm" className="flex-1">
                  Allocate Funds
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Payroll Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card hover>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Payroll Distribution</h3>
                  <p className="text-gray-600">Run private payroll with batch processing</p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">Next Payroll Run</p>
                  <p className="text-2xl font-bold text-gray-900">January 31, 2026</p>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Batch Size Limit</span>
                  <span className="text-gray-900 font-semibold">30 employees/tx</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-600">Estimated Batches</span>
                  <span className="text-gray-900 font-semibold">29 batches</span>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  onClick={handleRunPayroll}
                  disabled={!connected}
                  className="w-full"
                >
                  {connected ? "Run Payroll Distribution" : "Connect Wallet to Continue"}
                </Button>
                {!connected && (
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Connect your wallet to execute payroll
                  </p>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Zero-Knowledge Architecture
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Shielded Records</h4>
                <p className="text-sm text-gray-600">
                  All salary data encrypted on-chain with Aleo&apos;s native privacy
                </p>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Selective Disclosure</h4>
                <p className="text-sm text-gray-600">
                  Generate ZK proofs for auditors without revealing individual salaries
                </p>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Batch Processing</h4>
                <p className="text-sm text-gray-600">
                  Client-side queuing handles 30 employees per transaction automatically
                </p>
              </div>
            </Card>
          </div>
        </motion.div>
      </div>

      {/* Proof Generator Modal */}
      <ProofGeneratorModal
        isOpen={showProofModal}
        onClose={() => setShowProofModal(false)}
        batchId={proofProgress.batchId}
        totalEmployees={proofProgress.total}
        currentProgress={(proofProgress.completed / proofProgress.total) * 100}
        currentStep={proofProgress.currentEmployee || "Initializing..."}
        estimatedTime="~2 minutes"
        transactionHash={transactionHash}
      />
    </div>
  );
}
