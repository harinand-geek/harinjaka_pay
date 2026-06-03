import { type ReactNode, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  children: ReactNode
}

/** Mobile slide-up panel. Renders nothing when closed. */
export default function BottomSheet({ open, onClose, children }: BottomSheetProps) {
  // Lock background scroll while the sheet is open.
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-ink/50" onClick={onClose} aria-hidden />

          {/* Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            className="relative max-h-[88vh] w-full overflow-y-auto rounded-t-2xl border-t border-line bg-surface shadow-[0_-12px_40px_-12px_rgba(0,0,0,0.35)]"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
          >
            {/* Handle + close (sticky) */}
            <div className="sticky top-0 z-10 flex items-center justify-center border-b border-line bg-surface/95 px-4 py-3 backdrop-blur">
              <span className="h-1.5 w-10 rounded-full bg-line-strong" />
              <button
                type="button"
                onClick={onClose}
                aria-label="Fermer"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-ink-muted transition hover:bg-surface-2 hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="pb-[max(1rem,env(safe-area-inset-bottom))]">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
