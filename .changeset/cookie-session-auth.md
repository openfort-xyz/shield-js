---
'@openfort/shield-js': minor
---

Made `openfortOAuthToken` optional: when it is omitted no `Authorization` header is sent, so cookie-session projects can authenticate with the browser's session cookie.
