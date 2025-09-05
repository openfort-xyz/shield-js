export interface Share {
    secret: string;
    entropy: entropy;
    encryptionParameters?: EncryptionParameters;
    keychainId?: string;
    reference?: string;
    passkeyReference?: PasskeyReference;
}

export interface PasskeyReference {
    passkeyId?: string;
    passkeyEnv?: string;
}

export enum entropy {
    none = "none",
    user = "user",
    project = "project",
    passkey = "passkey",
}

export interface EncryptionParameters {
    salt: string;
    iterations: number;
    length: number;
    digest: string;
}
