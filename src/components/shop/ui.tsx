import { useEffect, useId, useRef, useState, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react'

/** Centered dialog (or a right-hand drawer) that closes on Esc or a click outside, and keeps focus inside. */
export function Modal({ title, onClose, children, drawer, wide }: { title: string; onClose: () => void; children: ReactNode; drawer?: boolean; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  // Latest onClose without re-running the focus setup on every render (that would steal focus while typing).
  const close = useRef(onClose)
  useEffect(() => { close.current = onClose })
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    const first = ref.current?.querySelector<HTMLElement>('input, button:not([data-close]), select, textarea, a[href]')
    first?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close.current()
      if (e.key !== 'Tab' || !ref.current) return
      const items = [...ref.current.querySelectorAll<HTMLElement>('input, button, select, textarea, a[href]')].filter((el) => !el.hasAttribute('disabled'))
      if (!items.length) return
      const [a, b] = [items[0], items[items.length - 1]]
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); b.focus() }
      else if (!e.shiftKey && document.activeElement === b) { e.preventDefault(); a.focus() }
    }
    document.addEventListener('keydown', onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      if (prev?.isConnected && !document.querySelector('[role=dialog]')) prev.focus()
    }
  }, [])

  return (
    <div className="fixed inset-0 z-[70] flex animate-[fade-in_.25s_ease] bg-espresso/35 backdrop-blur-md" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={drawer
          ? 'ml-auto flex h-full w-full max-w-[440px] animate-[slide-in_.35s_var(--ease-smooth)] flex-col bg-cream text-brown shadow-2xl'
          : `m-auto flex max-h-[92svh] w-[calc(100%-2rem)] ${wide ? 'max-w-3xl' : 'max-w-md'} animate-[pop-in_.3s_var(--ease-smooth)] flex-col overflow-hidden rounded-[28px] bg-cream text-espresso shadow-[0_40px_90px_rgba(43,29,22,.3)]`}
      >
        <div className="flex items-center justify-between px-7 pt-6 pb-3">
          <h2 className="font-display text-3xl font-[900] tracking-tight text-espresso">{title}</h2>
          <button data-close aria-label="Close" onClick={onClose} className="grid size-9 place-items-center rounded-full text-xl text-latte transition hover:bg-cream-2 hover:text-roast">×</button>
        </div>
        <div className="flex-1 overflow-y-auto px-7 pt-2 pb-7">{children}</div>
      </div>
    </div>
  )
}

type FieldProps = { label: string; error?: string; hint?: string } & InputHTMLAttributes<HTMLInputElement>

export function Field({ label, error, hint, className = '', ...input }: FieldProps) {
  const id = useId()
  return (
    <div className={`block ${className}`}>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium text-roast">{label}</label>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error || hint ? `${id}-msg` : undefined}
        {...input}
        className={`w-full rounded-xl border bg-white px-4 py-3 text-[15px] text-roast outline-none transition placeholder:text-latte/60
          focus:border-terra focus:ring-2 focus:ring-terra/25 ${error ? 'border-[#b4442f]' : 'border-line'}`}
      />
      {(error || hint) && <span id={`${id}-msg`} className={`mt-1 block text-xs ${error ? 'text-[#b4442f]' : 'text-latte'}`}>{error || hint}</span>}
    </div>
  )
}

export function TextArea({ label, error, hint, ...input }: { label: string; error?: string; hint?: string } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId()
  return (
    <div className="block">
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium text-roast">{label}</label>
      <textarea
        id={id}
        aria-invalid={!!error}
        aria-describedby={error || hint ? `${id}-msg` : undefined}
        {...input}
        className={`w-full resize-y rounded-xl border bg-white px-4 py-3 text-[15px] text-roast outline-none transition focus:border-terra focus:ring-2 focus:ring-terra/25 ${error ? 'border-[#b4442f]' : 'border-line'}`}
      />
      {(error || hint) && <span id={`${id}-msg`} className={`mt-1 block text-xs ${error ? 'text-[#b4442f]' : 'text-latte'}`}>{error || hint}</span>}
    </div>
  )
}

export function PasswordField(props: FieldProps) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <Field {...props} type={show ? 'text' : 'password'} />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'Hide password' : 'Show password'}
        className="absolute top-[31px] right-2 rounded px-2 py-1 text-xs font-medium text-mocha hover:bg-cream-2"
      >
        {show ? 'Hide' : 'Show'}
      </button>
    </div>
  )
}

export function Submit({ busy, children, className = '' }: { busy?: boolean; children: ReactNode; className?: string }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className={`flex w-full items-center justify-center gap-2 rounded-full bg-espresso px-6 py-3.5 text-[15px] font-semibold text-cream transition hover:scale-[1.02] disabled:cursor-wait disabled:opacity-70 ${className}`}
    >
      {busy && <span className="size-4 animate-spin rounded-full border-2 border-cream/40 border-t-cream" />}
      {children}
    </button>
  )
}

export function Alert({ children, tone = 'error' }: { children: ReactNode; tone?: 'error' | 'success' | 'info' }) {
  if (!children) return null
  const styles = { error: 'border-[#e6b8ae] bg-[#fbeeea] text-[#8f3424]', success: 'border-[#b9d8bf] bg-[#eef7ef] text-[#2d6a3a]', info: 'border-line bg-cream-2 text-brown' }
  return <div role={tone === 'error' ? 'alert' : 'status'} className={`mb-4 rounded-lg border px-4 py-3 text-sm ${styles[tone]}`}>{children}</div>
}
