'use client';

import React, { useEffect } from 'react';
import { logger } from '../lib/logger';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

/**
 * Root Error Boundary
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('CLIENT_SIDE_UNHANDLED_EXCEPTION', { digest: error.digest }, error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-red-100"
      >
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="text-red-500" size={32} />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          We encountered an unexpected error. The incident has been logged so the system can be diagnosed quickly.
        </p>

        {error.digest ? (
          <p className="text-xs text-gray-400 mb-6" aria-live="polite">
            Error reference: {error.digest}
          </p>
        ) : null}

        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 w-full h-12 bg-[#5f37ff] text-white rounded-lg font-bold hover:bg-[#4a2ccc] transition-colors shadow-lg shadow-purple-100"
          >
            <RefreshCw size={18} />
            Try again
          </button>
        </div>
      </motion.div>
    </div>
  );
}
