// biome-ignore lint/performance/noBarrelFile: This is the main entry point for the library
export { ShieldSDK } from './core/ShieldSDK'
export { OpenfortOAuthProvider } from './enums/OpenfortOAuthProvider'
export { OpenfortOAuthTokenType } from './enums/OpenfortOAuthTokenType'
export { ShieldAuthProvider } from './enums/ShieldAuthProvider'
export { EncryptionPartMissingError } from './errors/EncryptionPartMissingError'
export { NoSecretFoundError } from './errors/NoSecretFoundError'
export { OTPRequiredError } from './errors/OTPError'
export { SecretAlreadyExistsError } from './errors/SecretAlreadyExistsError'
export { CustomAuthOptions } from './models/CustomAuthOptions'
export { OpenfortAuthOptions } from './models/OpenfortAuthOptions'
export {
  PasskeyEnv,
  RecoveryMethod,
  RecoveryMethodDetails,
} from './models/RecoveryMethod'
export {
  EncryptionParameters,
  entropy,
  PasskeyReference,
  Share,
} from './models/Share'
export { ShieldAuthOptions } from './models/ShieldAuthOptions'
export { ShieldOptions } from './models/ShieldOptions'
