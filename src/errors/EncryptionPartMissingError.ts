export class EncryptionPartMissingError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "EncryptionPartMissingError";
        Object.setPrototypeOf(this, EncryptionPartMissingError.prototype);
    }
}
