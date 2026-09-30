import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'

interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  dismissible?: boolean
  className?: string
}

export function Modal({
  open,
  title,
  onClose,
  children,
  dismissible = true,
  className,
}: ModalProps) {
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const element = dialog.current
    if (!open || !element) return
    element.showModal()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      element.close()
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  return (
    <dialog
      className={className}
      ref={dialog}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        if (dismissible) onClose()
      }}
      onClick={(event) => {
        if (dismissible && event.target === event.currentTarget) onClose()
      }}
    >
      <span id={titleId} className="sr-only">
        {title}
      </span>
      <button
        className="close-dialog"
        type="button"
        onClick={onClose}
        aria-label="關閉視窗"
        disabled={!dismissible}
      >
        ×
      </button>
      {open && children}
    </dialog>
  )
}
