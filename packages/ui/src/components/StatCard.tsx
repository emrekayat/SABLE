import React from "react";
import { motion } from "framer-motion";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, trend, description }) => {
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
      className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      
      <div className="flex items-baseline gap-2">
        <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
        {trend && (
          <span
            className={`text-sm font-medium ${
              trend.isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      
      {description && <p className="text-sm text-gray-500 mt-2">{description}</p>}
    </motion.div>
  );
};
