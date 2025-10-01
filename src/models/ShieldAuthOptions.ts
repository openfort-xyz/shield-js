import type { ShieldAuthProvider } from '../enums/ShieldAuthProvider'

export interface ShieldAuthOptions {
  authProvider: ShieldAuthProvider
  encryptionPart?: string
  encryptionSession?: string
  externalUserId?: string
  apiKey?: string
  apiSecret?: string
}
