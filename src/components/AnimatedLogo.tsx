import React from 'react';
import { motion } from 'motion/react';

interface AnimatedLogoProps {
  className?: string;
  size?: number;
}

export default function AnimatedLogo({ className = "", size = 40 }: AnimatedLogoProps) {
  return (
    <motion.div
      className={`relative flex items-center justify-center bg-[#1A3A5C] rounded-xl shadow-md ${className}`}
      style={{ 
        width: size, 
        height: size,
      }}
      animate={{
        y: [0, -3, 0],
        scale: [1, 1.02, 1],
      }}
      transition={{
        duration: 4,
        ease: "easeInOut",
        repeat: Infinity,
      }}
    >
      {/* Subtle background gradient animation */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-[#1A3A5C] via-[#2a5280] to-[#1A3A5C] opacity-80 rounded-xl"
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%"],
        }}
        transition={{
          duration: 8,
          ease: "linear",
          repeat: Infinity,
          repeatType: "reverse",
        }}
        style={{ backgroundSize: "200% 200%" }}
      />
      
      {/* Subtle gold glow behind the icon */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#C9A84C] to-transparent opacity-10 rounded-xl" />
      
      {/* Scales of Justice Icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#C9A84C"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="relative z-10"
        style={{ width: "80%", height: "80%" }}
      >
        <path d="M12 3v18" />
        <path d="M8 21h8" />
        <path d="M4 7h16" />
        <path d="M4 7l-2 6c0 1.5 1.5 3 4 3s4-1.5 4-3l-2-6" />
        <path d="M20 7l-2 6c0 1.5 1.5 3 4 3s4-1.5 4-3l-2-6" />
        <path d="M12 3a2 2 0 0 0-2 2" />
        <path d="M12 3a2 2 0 0 1 2 2" />
      </svg>
    </motion.div>
  );
}
