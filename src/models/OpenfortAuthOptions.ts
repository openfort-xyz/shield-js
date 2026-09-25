import type { OpenfortOAuthProvider } from '../enums/OpenfortOAuthProvider'
import type { OpenfortOAuthTokenType } from '../enums/OpenfortOAuthTokenType'
import type { ShieldAuthProvider } from '../enums/ShieldAuthProvider'
import type { ShieldAuthOptions } from './ShieldAuthOptions'

export interface OpenfortAuthOptions extends ShieldAuthOptions {
  authProvider: ShieldAuthProvider.OPENFORT
  openfortOAuthProvider?: OpenfortOAuthProvider
  /**
   * The Openfort session or identity token. Omit it for cookie-session projects,
   * where Shield is called same-origin and authenticates the session cookie.
   */
  openfortOAuthToken?: string
  openfortOAuthTokenType?: OpenfortOAuthTokenType
}
