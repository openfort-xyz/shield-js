# ShieldJS
[![Version](https://img.shields.io/npm/v/@openfort/shield-js.svg)](https://www.npmjs.org/package/@openfort/shield-js)

ShieldJS is a TypeScript library for interacting with the Openfort Shield API. It provides easy-to-use methods for retrieving and storing secrets.

## Features
- Easy authentication with Openfort and custom authentication options.
- Methods for storing and retrieving secrets securely.

## Installation

To use ShieldJS in your project, install it via npm or pnpm:
```bash
pnpm add @openfort/shield-js
```

## Usage
Here's a quick example to get you started:
### Importing the SDK

```typescript
import { 
  ShieldSDK, 
  ShieldOptions, 
  ShieldAuthProvider,
  OpenfortAuthOptions,
  CustomAuthOptions,
  OpenfortOAuthProvider,
  OpenfortOAuthTokenType 
} from '@openfort/shield-js';
```

### Initializing the SDK
```typescript
const shieldOptions: ShieldOptions = {
apiKey: 'your-api-key',
// Optional: Specify a custom base URL
baseURL: 'https://shield.openfort.io'
};

const shieldSDK = new ShieldSDK(shieldOptions);
```

### Storing a Secret
```typescript
import { Share } from '@openfort/shield-js';

const share: Share = {
  secret: "your-secret-data",
  entropy: "optional-entropy",
  encryptionParameters: {
    salt: "salt-value",
    iterations: 10000,
    length: 32,
    digest: "SHA-256"
  }
};

const authOptions: ShieldAuthOptions = {
  // ... authentication options
};

await shieldSDK.storeSecret(share, authOptions);
```

### Deleting a Secret
```typescript
// Delete all secrets for the authenticated user
await shieldSDK.deleteSecret(authOptions);

// Delete a specific secret by reference
await shieldSDK.deleteSecret(authOptions, undefined, "reference-id");
```

### Retrieving a Secret
```typescript
const share = await shieldSDK.getSecret(authOptions);
console.log(share.secret);

// Retrieve by specific reference
const shareByRef = await shieldSDK.getSecretByReference(authOptions, "reference-id");
console.log(shareByRef.secret);
```

### Get Encryption Methods from Signer References
```typescript
const encryptionMethods = await shieldSDK.getEncryptionMethodsBySignerReferences(
  authOptions, 
  ["ref1", "ref2"]
);
// Returns Map<string, string> with reference as key and method as value

// Get detailed information including passkey details
const detailedMethods = await shieldSDK.getEncryptionMethodsBySignerReferencesDetailed(
  authOptions,
  ["ref1", "ref2"]
);
// Returns Map<string, RecoveryMethod> with additional details
```

### Get Encryption Methods from Owner IDs
```typescript
const encryptionMethods = await shieldSDK.getEncryptionMethodsByOwnerId(
  authOptions, 
  ["user1", "user2"]
);
// Returns Map<string, string> with userId as key and method as value

// Get detailed information including passkey details
const detailedMethods = await shieldSDK.getEncryptionMethodsByOwnerIdDetailed(
  authOptions,
  ["user1", "user2"]
);
// Returns Map<string, RecoveryMethod> with additional details
```

### Additional Methods

#### Update a Secret
```typescript
const updatedShare: Share = {
  secret: "updated-secret-data",
  // ... other share properties
};

await shieldSDK.updateSecret(authOptions, updatedShare);
```

#### Get Keychain (List of Shares)
```typescript
// Get all shares for the authenticated user
const shares = await shieldSDK.keychain(authOptions);

// Get shares filtered by reference
const shares = await shieldSDK.keychain(authOptions, "reference-filter");
```

#### Pre-register a Secret (Admin)
```typescript
await shieldSDK.preRegister(share, authOptions);
```

## API Reference

### Core Methods
- `storeSecret(share: Share, auth: ShieldAuthOptions, requestId?: string): Promise<void>`
- `getSecret(auth: ShieldAuthOptions, requestId?: string): Promise<Share>`
- `getSecretByReference(auth: ShieldAuthOptions, reference: string, requestId?: string): Promise<Share>`
- `updateSecret(auth: ShieldAuthOptions, share: Share, requestId?: string): Promise<void>`
- `deleteSecret(auth: ShieldAuthOptions, requestId?: string, reference?: string): Promise<void>`
- `keychain(auth: ShieldAuthOptions, reference?: string, requestId?: string): Promise<Share[]>`
- `getEncryptionMethodsBySignerReferences(auth: ShieldAuthOptions, signers: string[], requestId?: string): Promise<Map<string, string>>`
- `getEncryptionMethodsBySignerReferencesDetailed(auth: ShieldAuthOptions, signers: string[], requestId?: string): Promise<Map<string, RecoveryMethod>>`
- `getEncryptionMethodsByOwnerId(auth: ShieldAuthOptions, users: string[], requestId?: string): Promise<Map<string, string>>`
- `getEncryptionMethodsByOwnerIdDetailed(auth: ShieldAuthOptions, users: string[], requestId?: string): Promise<Map<string, RecoveryMethod>>`
- `preRegister(share: Share, auth: ShieldAuthOptions, requestId?: string): Promise<void>`

## Authentication
ShieldSDK supports two types of authentication: Openfort and Custom. The type of authentication you use depends on the configuration set in your Shield Dashboard.

### Openfort Authentication
When you configure your Shield Dashboard to use Openfort, you should use OpenfortAuthOptions for authentication. You must also set the `authProvider` to `ShieldAuthProvider.OPENFORT`.

Depending on your setup, the way you use OpenfortAuthOptions can vary:

- **Using an Openfort Token:** If you are using a token generated by Openfort, simply provide the token in openfortOAuthToken.
```typescript
const authOptions: OpenfortAuthOptions = {
    authProvider: ShieldAuthProvider.OPENFORT,
    openfortOAuthToken: "your-openfort-token",
};
```

- **Using Third-Party OAuth Tokens:** If you are using a third-party authentication provider, you need to provide the identity token, the provider type, and the token type:
```typescript
const authOptions: OpenfortAuthOptions = {
    authProvider: ShieldAuthProvider.OPENFORT,
    openfortOAuthToken: "your-identity-token",
    openfortOAuthProvider: OpenfortOAuthProvider.FIREBASE,
    openfortOAuthTokenType: OpenfortOAuthTokenType.ID_TOKEN
};
```

The Provider and Token Type enums are defined as follows:
```typescript
export enum OpenfortOAuthProvider {
    ACCELBYTE = "accelbyte",
    FIREBASE = "firebase",
    LOOTLOCKER = "lootlocker",
    SUPABASE = "supabase",
    PLAYFAB = "playfab",
    CUSTOM = "custom",
    OIDC = "oidc",
}

export enum OpenfortOAuthTokenType {
    ID_TOKEN = "idToken",
    CUSTOM_TOKEN = "customToken",
}
```

### Custom Authentication
If your Shield Dashboard is configured for Custom Authentication, use CustomAuthOptions. You will need to provide your custom token in the customToken field and set the `authProvider` to `ShieldAuthProvider.CUSTOM`.

```typescript
const authOptions: CustomAuthOptions = {
    authProvider: ShieldAuthProvider.CUSTOM,
    customToken: "your-custom-token",
};
```

## Error Handling

The SDK throws specific error types for common scenarios:

- `NoSecretFoundError`: Thrown when no secret is found for the given authentication options
- `SecretAlreadyExistsError`: Thrown when attempting to store a secret that already exists
- `EncryptionPartMissingError`: Thrown when encryption part is missing from the request
- `OTPRequiredError`: Thrown when OTP (One-Time Password) is required for the operation

```typescript
import { 
  NoSecretFoundError, 
  SecretAlreadyExistsError 
} from '@openfort/shield-js';

try {
  const share = await shieldSDK.getSecret(authOptions);
} catch (error) {
  if (error instanceof NoSecretFoundError) {
    console.log('No secret found');
  } else if (error instanceof SecretAlreadyExistsError) {
    console.log('Secret already exists');
  }
}
```

## Types

### Share
```typescript
interface Share {
  secret: string;
  entropy?: entropy;
  encryptionParameters?: EncryptionParameters;
  keychainId?: string;
  reference?: string;
  passkeyReference?: PasskeyReference;
}
```

### ShieldOptions
```typescript
interface ShieldOptions {
  apiKey: string;
  baseURL?: string; // Defaults to 'https://shield.openfort.io'
}
```
