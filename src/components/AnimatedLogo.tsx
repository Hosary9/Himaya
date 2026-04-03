import React from 'react';
import { motion } from 'motion/react';

interface AnimatedLogoProps {
  className?: string;
  size?: number;
}

export default function AnimatedLogo({ className = "", size = 40 }: AnimatedLogoProps) {
  return (
    <motion.div
      className={`relative flex items-center justify-center bg-[#1A3A5C] rounded-xl shadow-md overflow-hidden ${className}`}
      style={{ width: size, height: size }}
      whileHover={{ scale: 1.05, boxShadow: "0px 4px 15px rgba(201, 168, 76, 0.4)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Subtle background glow animation */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-tr from-[#1A3A5C] via-[#2a5280] to-[#1A3A5C] opacity-50"
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
        }}
        transition={{
          duration: 5,
          ease: "linear",
          repeat: Infinity,
        }}
        style={{ backgroundSize: "200% 200%" }}
      />
      
      {/* Scales of Justice Icon */}
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#C9A84C" // Gold accent
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="relative z-10"
        style={{ width: size * 0.6, height: size * 0.6 }}
        animate={{
          y: [0, -2, 0],
        }}
        transition={{
          duration: 3,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      >
        {/* Base/Stand */}
        <path d="M12 3v18" />
        <path d="M8 21h8" />
        {/* Beam */}
        <path d="M4 7h16" />
        {/* Left Scale */}
        <motion.path 
          d="M4 7l-2 6c0 1.5 1.5 3 4 3s4-1.5 4-3l-2-6" 
          animate={{ rotate: [0, 2, -2, 0] }}
          transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
          style={{ transformOrigin: "4px 7px" }}
        />
        {/* Right Scale */}
        <motion.path 
          d="M20 7l-2 6c0 1.5 1.5 3 4 3s4-1.5 4-3l-2-6"
          animate={{ rotate: [0, -2, 2, 0] }}
          transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
          style={{ transformOrigin: "20px 7px" }}
        />
        {/* Top Handle */}
        <path d="M12 3a2 2 0 0 0-2 2" />
        <path d="M12 3a2 2 0 0 1 2 2" />
      </motion.svg>
    </motion.div>
  );
}
