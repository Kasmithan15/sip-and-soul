import { useState, type FormEvent } from 'react'
import { api, ApiError } from '../../lib/api'
import { rules } from '../../lib/validate'
import { useStore } from '../../state/store'
import { Alert, Field, Modal, Submit } from './ui'

export function ForgotPanel() {
  const { openPanel, site } = useStore()
  const [email, setEmail] = useState('')
  const [touched, setTouched] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState<null | { emailed: boolean }>(null)
  const emailError = rules.email(email)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setTouched(true)
    setError('')
    if (emailError) return
    setBusy(true)
    try {
      setSent(await api<{ emailed: boolean }>('/auth/forgot-password', { method: 'POST', json: { email } }))
    } catch (err) {
      setError((err as ApiError).status === 429 ? 'Too many requests. Please wait a minute and try again.' : (err as ApiError).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal title="Forgot your password?" onClose={() => openPanel(null)}>
      {sent ? (
        <div className="py-2">
          <Alert tone="success">
            {sent.emailed
              ? <>If an account exists for <b>{email}</b>, we've emailed a link to reset the password. The link works once and expires in 1 hour.</>
              : <>If an account exists for <b>{email}</b>, the café has received your request. We'll send a reset link to the phone number on your account shortly (usually by WhatsApp).</>}
          </Alert>
          <p className="text-sm text-latte">Didn't get it? Call us on <a className="font-medium text-mocha" href={`tel:${site.contact.phone.replace(/[^\d+]/g, '')}`}>{site.contact.phone}</a>.</p>
          <button onClick={() => openPanel('login')} className="mt-6 w-full rounded-full bg-roast px-6 py-3 text-sm font-medium text-cream transition hover:bg-mocha">Back to sign in</button>
        </div>
      ) : (
        <form noValidate onSubmit={submit} className="grid gap-4">
          <p className="text-sm text-latte">Enter the email you signed up with and we'll help you choose a new password.</p>
          <Alert>{error}</Alert>
          <Field label="Email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={touched ? emailError : ''} placeholder="you@example.com" />
          <Submit busy={busy}>Send reset link</Submit>
          <button type="button" onClick={() => openPanel('login')} className="text-sm text-latte hover:text-roast">← Back to sign in</button>
        </form>
      )}
    </Modal>
  )
}
