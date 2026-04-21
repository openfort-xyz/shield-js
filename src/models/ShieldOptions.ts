/**
 * Extra headers merged into every request the SDK makes.
 *
 * Provide either a static object or a function that is evaluated per request.
 * The function form is useful for headers whose value changes across calls
 * made on the same SDK instance — for example W3C `traceparent` for
 * distributed tracing, where each high-level flow wants its own trace id.
 *
 * SDK-owned headers (auth, api key, request id, CORS) always win over these,
 * so callers cannot accidentally clobber security-critical values.
 */
export type DefaultHeadersProvider =
  | Record<string, string>
  | (() => Record<string, string>)

export interface ShieldOptions {
  baseURL?: string
  apiKey: string
  defaultHeaders?: DefaultHeadersProvider
}
