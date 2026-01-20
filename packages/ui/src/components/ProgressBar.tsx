import React from "react";
import { motion } from "framer-motion";

interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  variant?: "default" | "success" | "warning";
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  showPercentage = true,
  variant = "default",
}) => {
  const colors = {
    default: "from-gray-800 to-gray-900",
    success: "from-green-500 to-green-600",
    warning: "from-yellow-500 to-yellow-600",
  };

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          {label && <span>{label}</span>}
          {showPercentage && <span>{progress}%</span>}
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`h-full bg-gradient-to-r ${colors[variant]}`}
        />
      </div>
    </div>
  );
};
