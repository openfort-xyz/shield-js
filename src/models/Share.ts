export interface Share {
    secret: string;
    entropy: entropy;
    encryptionParameters?: EncryptionParameters;
    keychainId?: string
    reference?: string;
}

export enum entropy {
    none = "none",
    user = "user",
    project = "project",
}

export interface EncryptionParameters {
    salt: string;
    iterations: number;
    length: number;
    digest: string;
}
