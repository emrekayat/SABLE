import { motion, AnimatePresence } from "framer-motion";

interface TreasuryDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance: string;
  lastUpdated: string;
  companyId: string;
  activeEmployees: number;
  monthlyPayroll: string;
  estimatedBatches: number;
}

export function TreasuryDetailsModal({
  isOpen,
  onClose,
  balance,
  lastUpdated,
  companyId,
  activeEmployees,
  monthlyPayroll,
  estimatedBatches,
}: TreasuryDetailsModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Treasury Details</h3>
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

          {/* Content */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">💰</span>
                <span className="text-sm text-gray-600 font-medium">Current Balance</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{balance}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-lg">👥</span>
                  <span className="text-xs text-gray-600">Active Employees</span>
                </div>
                <p className="text-xl font-bold text-gray-900">{activeEmployees}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-lg">📊</span>
                  <span className="text-xs text-gray-600">Est. Batches</span>
                </div>
                <p className="text-xl font-bold text-gray-900">{estimatedBatches}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <span>💼</span> Monthly Payroll
                </span>
                <span className="font-semibold text-gray-900">{monthlyPayroll}</span>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <span>🏢</span> Company ID
                </span>
                <span className="font-mono text-xs text-gray-900">{companyId}</span>
              </div>

              <div className="flex justify-between items-center py-3">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <span>📅</span> Last Updated
                </span>
                <span className="text-sm text-gray-900">{lastUpdated}</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
              <div className="flex items-start gap-2">
                <span className="text-lg">🔐</span>
                <div>
                  <p className="text-xs font-semibold text-blue-900">Encrypted on Aleo Network</p>
                  <p className="text-xs text-blue-700 mt-1">
                    All treasury data is stored as private records on-chain with zero-knowledge proofs.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
