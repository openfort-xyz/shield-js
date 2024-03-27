export interface Share {
    secret: string;
    userEntropy: boolean;
    encryptionParameters?: EncryptionParameters;
}

export interface EncryptionParameters {
    salt: string;
    iterations: number;
    length: number;
    digest: string;
}