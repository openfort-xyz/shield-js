---
'@openfort/shield-js': patch
---

Add project-provider admin methods: `getProviders` (lists a project's providers) and `updateProviderPublishableKey` (updates a provider's stored Openfort publishable key). Both authenticate with the project's `x-api-key` / `x-api-secret` and let callers keep Shield's stored publishable key in sync after an API-side key rotation.
