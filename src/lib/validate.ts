// The same rules the server checks, so mistakes show up as you type instead of after sending.
export const PHONE = /^\+?[0-9][0-9 ()-]{7,18}[0-9]$/
export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
export const NAME = /^[\p{L}][\p{L} .'-]*$/u

export type Errors<T> = Partial<Record<keyof T & string, string>>

export const rules = {
  name: (v: string) =>
    !v.trim() ? 'Enter your name.' : v.trim().length < 2 || v.trim().length > 80 ? 'Name must be 2 to 80 characters.' : !NAME.test(v.trim()) ? 'Name can only contain letters, spaces, dots, apostrophes and hyphens.' : '',
  email: (v: string) => (!v.trim() ? 'Enter your email address.' : !EMAIL.test(v.trim()) ? 'Enter a valid email address.' : ''),
  phone: (v: string) => (!v.trim() ? 'Enter your phone number.' : !PHONE.test(v.trim()) ? 'Enter a valid phone number, for example 077 123 4567.' : ''),
  newPassword: (v: string) =>
    v.length < 8 ? 'Password must be at least 8 characters.' : v.length > 72 ? 'Password must be 72 characters or fewer.' : !/[A-Za-z]/.test(v) || !/\d/.test(v) ? 'Password must contain at least one letter and one number.' : '',
  required: (label: string) => (v: string) => (v.trim() ? '' : `Enter ${label}.`),
}

/** 0–4 score for the password strength bar. */
export function passwordStrength(v: string) {
  let s = 0
  if (v.length >= 8) s++
  if (v.length >= 12) s++
  if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++
  if (/\d/.test(v) && /[^A-Za-z0-9]/.test(v)) s++
  return s
}

export const hasErrors = (e: Record<string, string | undefined>) => Object.values(e).some(Boolean)
