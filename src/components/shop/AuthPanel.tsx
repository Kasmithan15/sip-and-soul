import { useState, type FormEvent } from 'react'
import { api, ApiError } from '../../lib/api'
import type { User } from '../../lib/types'
import { hasErrors, passwordStrength, rules } from '../../lib/validate'
import { DEMO, DEMO_ADMIN } from '../../lib/demoApi'
import { useStore } from '../../state/store'
import { Alert, Field, Modal, PasswordField, Submit } from './ui'

const STRENGTH = ['Too weak', 'Weak', 'Okay', 'Good', 'Strong']

/** One sign-in for everyone: customers stay on the website, admins go straight to the admin panel. */
export function AuthPanel({ mode, onClose }: { mode: 'login' | 'register'; onClose?: () => void }) {
  const { setUser, openPanel, afterLogin, online } = useStore()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const register = mode === 'register'

  const errors = {
    name: register ? rules.name(form.name) : '',
    email: rules.email(form.email),
    phone: register ? rules.phone(form.phone) : '',
    password: register ? rules.newPassword(form.password) : form.password ? '' : 'Enter your password.',
    confirm: register ? (form.confirm !== form.password ? 'Passwords do not match.' : '') : '',
  }
  const show = (k: keyof typeof errors) => (touched[k] ? errors[k] : '') || serverErrors[k]

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    setServerErrors((s) => ({ ...s, [k]: '' }))
  }
  const blur = (k: string) => () => setTouched((t) => ({ ...t, [k]: true }))

  async function submit(e: FormEvent) {
    e.preventDefault()
    setTouched({ name: true, email: true, phone: true, password: true, confirm: true })
    setMessage('')
    if (hasErrors(errors)) return
    setBusy(true)
    try {
      const body = register
        ? { name: form.name, email: form.email, phone: form.phone, password: form.password }
        : { email: form.email, password: form.password }
      const user = await api<User>(register ? '/auth/register' : '/auth/login', { method: 'POST', json: body })
      setUser(user)
      if (user.role === 'admin') {
        openPanel(null)
        window.location.hash = '#/admin'
      } else {
        openPanel(afterLogin)
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setServerErrors(err.fields)
        setMessage(err.status === 429 ? 'Too many attempts. Please wait a minute and try again.' : Object.keys(err.fields).length ? '' : err.message)
      }
    } finally {
      setBusy(false)
    }
  }

  const strength = passwordStrength(form.password)

  return (
    <Modal title={register ? 'Create your account' : 'Welcome back'} onClose={onClose ?? (() => openPanel(null))}>
      {!online && <Alert tone="info">Accounts and online ordering need the café server. This copy of the site is a preview only.</Alert>}
      {DEMO && !register && (
        <Alert tone="info">
          <b>Demo version.</b> Everything works, and your changes are saved in this browser only.<br />
          Admin demo login: <b>{DEMO_ADMIN.email}</b> · <b>{DEMO_ADMIN.password}</b>
        </Alert>
      )}
      <p className="mb-5 text-sm text-latte">
        {register ? 'Order ahead, track your coffee and save your details for next time.' : 'Customers and café staff both sign in here.'}
      </p>
      <Alert>{message}</Alert>
      <form noValidate onSubmit={submit} className="grid gap-4">
        {register && <Field label="Full name" autoComplete="name" value={form.name} onChange={set('name')} onBlur={blur('name')} error={show('name')} placeholder="Nimal Perera" />}
        <Field label="Email" type="email" autoComplete="email" inputMode="email" value={form.email} onChange={set('email')} onBlur={blur('email')} error={show('email')} placeholder="you@example.com" />
        {register && <Field label="Phone number" type="tel" autoComplete="tel" inputMode="tel" value={form.phone} onChange={set('phone')} onBlur={blur('phone')} error={show('phone')} placeholder="077 123 4567" hint="We'll call only about your orders." />}
        <PasswordField
          label="Password"
          autoComplete={register ? 'new-password' : 'current-password'}
          value={form.password}
          onChange={set('password')}
          onBlur={blur('password')}
          error={show('password')}
          hint={register ? 'At least 8 characters, with letters and numbers.' : undefined}
        />
        {!register && (
          <button type="button" onClick={() => openPanel('forgot')} className="-mt-2 justify-self-end text-sm font-medium text-mocha underline-offset-4 hover:underline">
            Forgot password?
          </button>
        )}
        {register && form.password && (
          <div aria-live="polite" className="-mt-2 flex items-center gap-2 text-xs text-latte">
            <div className="flex flex-1 gap-1">
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className={`h-1 flex-1 rounded-full ${i < strength ? (strength < 2 ? 'bg-[#c0533d]' : strength < 3 ? 'bg-gold' : 'bg-[#4d8a5a]') : 'bg-line'}`} />
              ))}
            </div>
            {STRENGTH[strength]}
          </div>
        )}
        {register && <PasswordField label="Confirm password" autoComplete="new-password" value={form.confirm} onChange={set('confirm')} onBlur={blur('confirm')} error={show('confirm')} />}
        <Submit busy={busy} className="mt-1">{register ? 'Create account' : 'Sign in'}</Submit>
      </form>
      <p className="mt-5 text-center text-sm text-latte">
        {register ? 'Already have an account? ' : 'New to Sip & Soul? '}
        <button type="button" onClick={() => openPanel(register ? 'login' : 'register', afterLogin)} className="font-medium text-mocha underline-offset-4 hover:underline">
          {register ? 'Sign in' : 'Create an account'}
        </button>
      </p>
    </Modal>
  )
}
