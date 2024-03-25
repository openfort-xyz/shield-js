export class SecretAlreadyExistsError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "SecretAlreadyExistsError";
        Object.setPrototypeOf(this, SecretAlreadyExistsError.prototype);
    }
}
