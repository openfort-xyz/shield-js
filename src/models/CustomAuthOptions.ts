import type { ShieldAuthProvider } from '../enums/ShieldAuthProvider'
import type { ShieldAuthOptions } from './ShieldAuthOptions'

export interface CustomAuthOptions extends ShieldAuthOptions {
  authProvider: ShieldAuthProvider.CUSTOM
  customToken: string
}
