export interface PasskeyEnv {
  name?: string
  os?: string
  osVersion?: string
  device?: string
}

export interface RecoveryMethodDetails {
  passkeyId: string
  passkeyEnv?: PasskeyEnv
}

export interface RecoveryMethod {
  method: string
  details?: RecoveryMethodDetails
}
