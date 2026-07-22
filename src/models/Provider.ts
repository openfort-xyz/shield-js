/**
 * A provider registered on a Shield project, as returned by
 * `GET /project/providers`.
 *
 * `type` is Shield's provider kind (for example `OPENFORT` or `CUSTOM`).
 */
export interface Provider {
  providerId: string
  type: string
}
