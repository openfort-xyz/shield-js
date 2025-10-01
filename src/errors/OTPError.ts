export class OTPRequiredError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'OTPRequiredError'
    Object.setPrototypeOf(this, OTPRequiredError.prototype)
  }
}
