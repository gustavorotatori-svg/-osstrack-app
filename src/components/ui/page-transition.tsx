"use client"

import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"
import { ReactNode } from "react"

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait">
      <motion.div key={pathname} className="relative">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>

        {/* Kimono sash sweep — covers old page on exit, reveals new on enter */}
        <motion.div
          className="fixed inset-y-0 left-0 w-full z-50 pointer-events-none"
          initial={{ x: "0%" }}
          animate={{ x: "100%" }}
          exit={{ x: "0%" }}
          transition={{ duration: 0.28, ease: [0.76, 0, 0.24, 1] }}
          style={{
            background: [
              "linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.18) 25%, rgba(180,30,30,0.07) 50%, rgba(201,168,76,0.1) 70%, transparent 100%)",
              "repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(201,168,76,0.03) 8px, rgba(201,168,76,0.03) 10px)",
            ].join(", "),
          }}
        />

        {/* Leading edge highlight */}
        <motion.div
          className="fixed inset-y-0 left-0 w-[2px] z-50 pointer-events-none"
          initial={{ x: "0%" }}
          animate={{ x: "100%" }}
          exit={{ x: "0%" }}
          transition={{ duration: 0.28, ease: [0.76, 0, 0.24, 1] }}
          style={{ background: "rgba(201,168,76,0.3)", boxShadow: "0 0 12px rgba(201,168,76,0.15)" }}
        />
      </motion.div>
    </AnimatePresence>
  )
}
