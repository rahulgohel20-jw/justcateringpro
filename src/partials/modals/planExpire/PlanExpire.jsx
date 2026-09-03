import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

export default function PlanExpire({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            className="absolute inset-0 bg-slate-800/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative z-10 w-full max-w-[440px] bg-white rounded-3xl shadow-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <div className="px-8 py-12 text-center">
              {/* Top Message */}

              <p className="text-sm text-[#005BA8] font-medium mb-4">
                Please Contact your admin
              </p>

              {/* Animated Success Icon */}
              <div className="relative mb-8 flex justify-center">
                <motion.div
                  className="relative w-32 h-32"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <svg viewBox="0 0 128 128" className="w-full h-full">
                    <motion.path
                      d="M20 45 L64 70 L108 45 L108 95 C108 98 106 100 103 100 L25 100 C22 100 20 98 20 95 Z"
                      fill="#005BA8"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 0.3, duration: 0.6 }}
                    />
                    <motion.path
                      d="M20 45 L64 70 L108 45 L64 20 Z"
                      fill="#005BA8"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                    />
                    <motion.path
                      d="M 75 25 L 85 35 L 105 15"
                      fill="none"
                      stroke="#22C55E"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{
                        delay: 1.1,
                        duration: 0.5,
                        ease: "easeOut",
                      }}
                    />
                  </svg>
                </motion.div>
              </div>

              <motion.h2
                className="text-3xl font-semibold text-gray-700 mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                OOPS!
              </motion.h2>

              <motion.div
                className="space-y-3 mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <p className="text-gray-600 text-base leading-relaxed">
                  Something Went Wrong
                </p>
                <p className="text-gray-600 text-base leading-relaxed">
                  Contact your admin.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
