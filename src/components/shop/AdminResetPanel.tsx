import { useEffect, useState, type FormEvent } from 'react'
import { api, ApiError } from '../../lib/api'
import { hasErrors, passwordStrength, rules } from '../../lib/validate'
import { useStore } from '../../state/store'
import { Alert, Field, Modal, PasswordField, Submit } from './ui'

const STRENGTH = ['Too weak', 'Weak', 'Okay', 'Good', 'Strong']
const adminPassword = (v: string) => (v.length < 12 ? 'Admin password must be at least 12 characters.' : rules.newPassword(v))

/** Admin "forgot password": a 6-digit code is texted to the café's admin phone. */
export function AdminResetPanel() {
  const { openPanel } = useStore()
  const [step, setStep] = useState<'email' | 'code' | 'done'>('email')
  const [email, setEmail] = useState('')
  const [sentTo, setSentTo] = useState('')
  const [f, setF] = useState({ code: '', password: '', confirm: '' })
  const [touched, setTouched] = useState(false)
  const [server, setServer] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [wait, setWait] = useState(0)

  useEffect(() => {
    if (!wait) return
    const id = setTimeout(() => setWait((w) => w - 1), 1000)
    return () => clearTimeout(id)
  }, [wait])

  async function sendCode(e?: FormEvent) {
    e?.preventDefault()
    setTouched(true)
    setError('')
    if (rules.email(email)) return
    setBusy(true)
    try {
      const r = await api<{ sentTo: string }>('/auth/admin-reset/request', { method: 'POST', json: { email } })
      setSentTo(r.sentTo)
      setStep('code')
      setTouched(false)
      setWait(60)
    } catch (err) {
      setError((err as ApiError).status === 429 ? 'Too many requests. Please wait a minute.' : (err as ApiError).message)
    } finally {
      setBusy(false)
    }
  }

  const errors = {
    code: /^\d{6}$/.test(f.code.trim()) ? '' : 'Enter the 6-digit code from the text message.',
    password: adminPassword(f.password),
    confirm: f.confirm !== f.password ? 'Passwords do not match.' : '',
  }
  const show = (k: keyof typeof errors) => (touched ? errors[k] : '') || server[k]

  async function confirm(e: FormEvent) {
    e.preventDefault()
    setTouched(true)
    setError('')
    if (hasErrors(errors)) return
    setBusy(true)
    try {
      await api('/auth/admin-reset/confirm', { method: 'POST', json: { email, code: f.code.trim(), password: f.password } })
      setStep('done')
    } catch (err) {
      const e2 = err as ApiError
      setServer(e2.fields)
      if (!Object.keys(e2.fields).length) setError(e2.status === 429 ? 'Too many tries. Please wait a minute.' : e2.message)
    } finally {
      setBusy(false)
    }
  }

  const strength = passwordStrength(f.password)

  return (
    <Modal title={step === 'done' ? 'Admin password changed' : 'Reset admin password'} onClose={() => openPanel(null)}>
      {step === 'email' && (
        <form noValidate onSubmit={sendCode} className="grid gap-4">
          <p className="text-sm text-latte">Enter the admin email. We'll text a 6-digit code to the café's registered admin phone.</p>
          <Alert>{error}</Alert>
          <Field label="Admin email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} error={touched ? rules.email(email) : ''} />
          <Submit busy={busy}>Text me a code</Submit>
          <button type="button" onClick={() => openPanel('forgot')} className="text-sm text-latte hover:text-roast">← Back</button>
        </form>
      )}
      {step === 'code' && (
        <form noValidate onSubmit={confirm} className="grid gap-4">
          <Alert tone="info">If <b>{email}</b> is an admin account, a code has been texted to <b>{sentTo}</b>. It expires in 10 minutes.</Alert>
          <Alert>{error}</Alert>
          <Field
            label="6-digit code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={f.code}
            onChange={(e) => { setF((x) => ({ ...x, code: e.target.value.replace(/\D/g, '') })); setServer((s) => ({ ...s, code: '' })) }}
            error={show('code')}
            className="[&_input]:text-center [&_input]:font-mono [&_input]:text-2xl [&_input]:tracking-[.5em]"
          />
          <PasswordField label="New admin password" autoComplete="new-password" value={f.password} onChange={(e) => setF((x) => ({ ...x, password: e.target.value }))} error={show('password')} hint="At least 12 characters, with letters and numbers." />
          {f.password && (
            <div aria-live="polite" className="-mt-2 flex items-center gap-2 text-xs text-latte">
              <div className="flex flex-1 gap-1">{[0, 1, 2, 3].map((i) => <span key={i} className={`h-1 flex-1 rounded-full ${i < strength ? (strength < 2 ? 'bg-[#c0533d]' : strength < 3 ? 'bg-gold' : 'bg-[#4d8a5a]') : 'bg-line'}`} />)}</div>
              {STRENGTH[strength]}
            </div>
          )}
          <PasswordField label="Confirm new password" autoComplete="new-password" value={f.confirm} onChange={(e) => setF((x) => ({ ...x, confirm: e.target.value }))} error={show('confirm')} />
          <Submit busy={busy}>Change admin password</Submit>
          <button type="button" disabled={wait > 0 || busy} onClick={() => sendCode()} className="text-sm text-mocha hover:underline disabled:text-latte disabled:no-underline">
            {wait > 0 ? `Didn't get it? Send a new code in ${wait}s` : 'Send a new code'}
          </button>
        </form>
      )}
      {step === 'done' && (
        <div>
          <Alert tone="success">The admin password has been changed and every admin session has been signed out.</Alert>
          <button onClick={() => openPanel('login')} className="w-full rounded-full bg-roast px-6 py-3 text-sm font-medium text-cream transition hover:bg-mocha">Sign in with the new password</button>
        </div>
      )}
    </Modal>
  )
}
