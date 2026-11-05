import { useStore } from '../../state/store'
import { AccountPanel } from './AccountPanel'
import { AuthPanel } from './AuthPanel'
import { CartPanel } from './CartPanel'
import { ForgotPanel } from './ForgotPanel'
import { MenuPanel } from './MenuPanel'

/** Shows whichever pop-up (sign in, cart, account, menu) is open. */
export function Panels() {
  const { panel, user } = useStore()
  if (panel === 'login' || panel === 'register') return <AuthPanel key={panel} mode={panel} />
  if (panel === 'forgot') return <ForgotPanel />
  if (panel === 'cart') return <CartPanel key={user?.id ?? 'guest'} />
  if (panel === 'account') return user ? <AccountPanel /> : <AuthPanel mode="login" />
  if (panel === 'menu') return <MenuPanel />
  return null
}
