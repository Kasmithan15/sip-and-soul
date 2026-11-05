import { useState, type FormEvent } from 'react'
import { api, ApiError } from '../../lib/api'
import { hasErrors, passwordStrength, rules } from '../../lib/validate'
import { useStore } from '../../state/store'
import { Alert, Modal, PasswordField, Submit } from './ui'

const STRENGTH = ['Too weak', 'Weak', 'Okay', 'Good', 'Strong']
const tokenFromHash = () => new URLSearchParams(window.location.hash.split('?')[1] ?? '').get('token') ?? ''

/** Opened from the reset link (#/reset-password?token=…). */
export function ResetPasswordPage() {
  const { openPanel, setUser } = useStore()
  const [token] = useState(tokenFromHash)
  const [f, setF] = useState({ password: '', confirm: '' })
  const [touched, setTouched] = useState(false)
  const [error, setError] = useState(token.length < 20 ? 'This reset link is not complete. Please open the full link, or request a new one.' : '')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const errors = { password: rules.newPassword(f.password), confirm: f.confirm !== f.password ? 'Passwords do not match.' : '' }
  const strength = passwordStrength(f.password)

  const goHome = (panel: 'login' | 'forgot' | null) => {
    setUser(null)
    window.location.hash = '#home'
    openPanel(panel)
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (hasErrors(errors) || token.length < 20) return
    setBusy(true)
    setError('')
    try {
      await api('/auth/reset-password', { method: 'POST', json: { token, password: f.password } })
      setDone(true)
    } catch (err) {
      setError((err as ApiError).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-svh bg-espresso">
      <Modal title={done ? 'Password changed' : 'Choose a new password'} onClose={() => goHome(null)}>
        {done ? (
          <div className="py-2">
            <Alert tone="success">Your password has been changed. For your safety, you've been signed out on every device.</Alert>
            <button onClick={() => goHome('login')} className="w-full rounded-full bg-roast px-6 py-3 text-sm font-medium text-cream transition hover:bg-mocha">Sign in with the new password</button>
          </div>
        ) : (
          <form noValidate onSubmit={submit} className="grid gap-4">
            <Alert>{error}</Alert>
            {error.includes('expired') || error.includes('not complete') ? (
              <button type="button" onClick={() => goHome('forgot')} className="-mt-2 text-left text-sm font-medium text-mocha hover:underline">Request a new reset link →</button>
            ) : null}
            <PasswordField label="New password" autoComplete="new-password" value={f.password} onChange={(e) => setF((x) => ({ ...x, password: e.target.value }))} error={touched ? errors.password : ''} hint="At least 8 characters, with letters and numbers." />
            {f.password && (
              <div aria-live="polite" className="-mt-2 flex items-center gap-2 text-xs text-latte">
                <div className="flex flex-1 gap-1">
                  {[0, 1, 2, 3].map((i) => <span key={i} className={`h-1 flex-1 rounded-full ${i < strength ? (strength < 2 ? 'bg-[#c0533d]' : strength < 3 ? 'bg-gold' : 'bg-[#4d8a5a]') : 'bg-line'}`} />)}
                </div>
                {STRENGTH[strength]}
              </div>
            )}
            <PasswordField label="Confirm new password" autoComplete="new-password" value={f.confirm} onChange={(e) => setF((x) => ({ ...x, confirm: e.target.value }))} error={touched ? errors.confirm : ''} />
            <Submit busy={busy}>Save new password</Submit>
          </form>
        )}
      </Modal>
    </div>
  )
}
