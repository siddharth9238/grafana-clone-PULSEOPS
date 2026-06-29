# Security Audit Checklist

## Input Validation
- [x] Query parameter length limits (logs/search endpoint)
- [x] Request body validation (dashboard generator prompt)
- [x] Route parameter validation (predictive alert ID)
- [ ] SQL injection prevention (database queries)

## Authentication & Authorization
- [x] Routes protected with `reqSignedIn` middleware
- [ ] RBAC permissions for each feature
- [ ] Admin-only endpoints for sensitive operations

## API Security
- [x] JSON responses with proper content-type
- [x] Error responses use `JsonApiErr` helper
- [x] No secrets exposed in responses

## Dependencies
- [ ] Run `go list -u -m -json all` for vulnerability scan
- [ ] Run `yarn audit` for frontend vulnerabilities

## Headers & CSP
- [ ] Add security headers in production
- [ ] Content Security Policy configuration

## Recommendations
1. Add rate limiting for `/api/ai/*` endpoints
2. Implement request logging for audit trails
3. Add CORS configuration for API access
4. Enable HTTPS in production