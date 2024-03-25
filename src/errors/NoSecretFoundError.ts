export class NoSecretFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "NoSecretFoundError";
        Object.setPrototypeOf(this, NoSecretFoundError.prototype);
    }
}
