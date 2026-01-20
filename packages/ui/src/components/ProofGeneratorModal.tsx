import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ProofGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  batchId: string;
  totalEmployees: number;
  currentProgress: number;
  currentStep: string;
  estimatedTime?: string;
  transactionHash?: string;
}

export const ProofGeneratorModal: React.FC<ProofGeneratorModalProps> = ({
  isOpen,
  onClose,
  batchId,
  totalEmployees,
  currentProgress,
  currentStep,
  estimatedTime = "~2 minutes",
  transactionHash,
}) => {
  const steps = [
    { id: 1, name: "Initializing ZK Circuit", status: currentProgress > 0 ? "completed" : "current" },
    { id: 2, name: "Generating Witness", status: currentProgress > 25 ? "completed" : currentProgress > 0 ? "current" : "pending" },
    { id: 3, name: "Computing Proof", status: currentProgress > 50 ? "completed" : currentProgress > 25 ? "current" : "pending" },
    { id: 4, name: "Verifying Constraints", status: currentProgress > 75 ? "completed" : currentProgress > 50 ? "current" : "pending" },
    { id: 5, name: "Broadcasting Transaction", status: currentProgress === 100 ? "completed" : currentProgress > 75 ? "current" : "pending" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">ZK Proof Generation</h2>
                  <p className="text-sm text-gray-500 mt-1">Batch ID: {batchId}</p>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Progress Info */}
              <div className="mb-8">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>{currentProgress}% Complete</span>
                  <span>Est. {estimatedTime}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${currentProgress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-gray-800 to-gray-900"
                  />
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4"
                  >
                    {/* Step Indicator */}
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        step.status === "completed"
                          ? "bg-gray-900 text-white"
                          : step.status === "current"
                          ? "bg-gray-200 text-gray-900 border-2 border-gray-900"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {step.status === "completed" ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span className="text-sm font-medium">{step.id}</span>
                      )}
                    </div>

                    {/* Step Info */}
                    <div className="flex-1">
                      <p className={`font-medium ${step.status === "pending" ? "text-gray-400" : "text-gray-900"}`}>
                        {step.name}
                      </p>
                      {step.status === "current" && (
                        <p className="text-xs text-gray-500 mt-0.5">Processing...</p>
                      )}
                    </div>

                    {/* Loading Spinner */}
                    {step.status === "current" && (
                      <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                {currentProgress === 100 ? (
                  <div className="text-center space-y-3">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">Payroll Completed Successfully!</span>
                    </div>
                    {transactionHash && (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">Transaction Hash:</p>
                        <code className="block px-3 py-2 bg-gray-50 rounded text-xs font-mono text-gray-800 break-all">
                          {transactionHash}
                        </code>
                        <a
                          href={`https://testnet.explorer.provable.com/transaction/${transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                          <span>View on Aleo Explorer</span>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      Processing {totalEmployees} employee{totalEmployees > 1 ? "s" : ""}
                    </span>
                    <span className="text-gray-900 font-medium">{currentStep}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
