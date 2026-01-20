import React from "react";
import { motion } from "framer-motion";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = "", hover = false }) => {
  return (
    <motion.div
      whileHover={hover ? { y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" } : {}}
      className={`bg-white rounded-xl border border-gray-200 shadow-sm p-6 ${className}`}
    >
      {children}
    </motion.div>
  );
};
