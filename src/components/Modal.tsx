import { useEffect, useRef, type ReactNode } from 'react'

type Props = {
  open: boolean
  title: string
  children: ReactNode
  onClose: () => void
}

export function Modal({ open, title, children, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog ref={ref} className="modal" onClose={onClose}>
      <h2>{title}</h2>
      {children}
      <button type="button" className="btn btn-secondary" onClick={onClose}>
        Close
      </button>
    </dialog>
  )
}
