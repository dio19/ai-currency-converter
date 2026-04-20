'use client';

import React from 'react';
import { motion } from 'motion/react';
import { ReactNode } from 'react';

interface AnimatedCardProps {
  children: ReactNode;
  triggerKey: string;
}

export default function AnimatedCard({ children, triggerKey }: AnimatedCardProps) {
  return (
    <motion.div
      key={triggerKey}
      initial={{ outline: '0px solid rgba(225, 225, 255, 0)' }}
      animate={{
        outline: [
          '0px solid rgba(225, 225, 255, 0)',
          '5px solid rgba(225, 225, 255, 0.8)',
          '0px solid rgba(225, 225, 255, 0)',
        ],
      }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="bg-white rounded-lg shadow-xl p-8 md:p-12 relative overflow-hidden ring-1 ring-gray-100"
    >
      {/* Subtle top progress bar effect for loading feedback */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: [0, 1, 1], opacity: [0, 1, 0] }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
        className="absolute top-0 left-0 right-0 h-1 bg-[#e1e1ff] origin-left"
      />

      {children}
    </motion.div>
  );
}
