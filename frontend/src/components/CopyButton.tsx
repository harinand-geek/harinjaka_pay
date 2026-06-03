import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import toast from 'react-hot-toast'
import { copyToClipboard } from '@/lib/clipboard'

interface CopyButtonProps {
  value: string
  /** Optional label shown in the success toast. */
  label?: string
  onCopied?: () => void
  className?: string
}

export default function CopyButton({ value, label, onCopied, className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const ok = await copyToClipboard(value)
    if (ok) {
      setCopied(true)
      toast.success(label ? `${label} copié !` : 'Copié dans le presse-papier !')
      onCopied?.()
      window.setTimeout(() => setCopied(false), 1500)
    } else {
      toast.error('Impossible de copier')
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={label ? `Copier ${label}` : 'Copier'}
      className={`copy-btn shrink-0 rounded-lg p-3 ${className}`}
    >
      {copied ? <Check className="h-5 w-5 text-accent" /> : <Copy className="h-5 w-5" />}
    </button>
  )
}
