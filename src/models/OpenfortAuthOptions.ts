import type { OpenfortOAuthProvider } from '../enums/OpenfortOAuthProvider'
import type { OpenfortOAuthTokenType } from '../enums/OpenfortOAuthTokenType'
import type { ShieldAuthProvider } from '../enums/ShieldAuthProvider'
import type { ShieldAuthOptions } from './ShieldAuthOptions'

export interface OpenfortAuthOptions extends ShieldAuthOptions {
  authProvider: ShieldAuthProvider.OPENFORT
  openfortOAuthProvider?: OpenfortOAuthProvider
  openfortOAuthToken: string
  openfortOAuthTokenType?: OpenfortOAuthTokenType
}
