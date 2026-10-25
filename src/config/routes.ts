/**
 * Path prefixes whose next segment is a secret (a token that grants access).
 * Used to redact logs (src/lib/csp-report.ts). Keep in sync with the
 * privateHeaders entries in next.config.ts.
 *
 * /p/<slug> is not a credential (the guest password is), but slugs are built
 * from party titles, so they are redacted like secrets to keep user content
 * out of logs and analytics.
 */
export const secretPathPrefixes = ["/h/", "/p/", "/api/parties/"] as const;
