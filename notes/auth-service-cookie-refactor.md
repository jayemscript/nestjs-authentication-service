# Auth Service Cookie Refactor

## Context

This auth-service is a **pure identity microservice** that supports multiple apps via an `applications` table. It is consumed by:

- API Gateways (NestJS, handles web browser clients via httpOnly cookies)
- Mobile apps (React Native / Flutter, uses SecureStore / Keychain)
- Desktop apps (Electron / Tauri, uses safeStorage)
- Other microservices (Bearer token via Authorization header)

Because it is consumed by multiple platforms, the auth-service must **never handle cookies**. Cookie strategy is the consumer's responsibility. The auth-service only generates and validates tokens, then returns everything in the response body.

---

## Goal

Remove all cookie handling from the auth-service. Every endpoint must return tokens and user data in the response body only. No `Set-Cookie` headers, no `res.clearCookie()`, no `@Res` decorator usage for cookie purposes.

---

## Architecture Rule

```
Auth-service responsibility:
  ✅ Generate JWT access token
  ✅ Generate JWT refresh token
  ✅ Validate JWT tokens
  ✅ Manage users table
  ✅ Manage sessions table
  ✅ Manage applications table
  ✅ Return tokens + user info in response body

  ❌ Set cookies
  ❌ Clear cookies
  ❌ Read cookies from request
  ❌ Any reference to res.cookie() or res.clearCookie()
  ❌ CookieUtil usage anywhere

Consumer responsibility (API Gateway / Mobile / Desktop):
  ✅ Read tokens from auth-service response body
  ✅ Store tokens in appropriate storage (cookie / SecureStore / safeStorage)
  ✅ Forward tokens to auth-service on subsequent requests
  ✅ Clear tokens on logout
```

---

## Files to Refactor

### 1. `src/common/utils/cookie.util.ts`

**Action: DELETE this file entirely.**

It will no longer be used anywhere in the auth-service. If the gateway needs it, it lives there instead.

---

### 2. `src/common/guards/refresh.guard.ts`

**Action: Remove cookie reading. Read refresh token from request body instead.**

Current behavior:
```typescript
private extractRefreshToken(request: Request): string | null {
  const cookies = request.cookies;
  return cookies?.[AUTH_CONSTANTS.COOKIE_NAMES.REFRESH_TOKEN] || null;
}
```

New behavior:
```typescript
private extractRefreshToken(request: Request): string | null {
  return request.body?.refreshToken || null;
}
```

Also remove:
- `import { CookieUtil } from '../utils/cookie.util'`
- `CookieUtil.clearAllCookies(response)` calls
- `Response` import from express if no longer used
- The `response` variable from `canActivate` if no longer used

Final guard should only:
- Read `req.body.refreshToken`
- Verify JWT
- Check appId matches
- Set `req['user'] = payload`
- Throw `UnauthorizedException` on failure (no cookie clearing)

---

### 3. `src/common/guards/auth.guard.ts`

**Action: Remove all `CookieUtil` references. Just throw errors, do not clear cookies.**

Remove:
- `import { CookieUtil } from '../utils/cookie.util'`
- Every `CookieUtil.clearAllCookies(response)` call
- `Response` import from express if no longer used
- The `response` variable from `canActivate` if no longer used

The guard should only:
- Extract Bearer token from `Authorization` header
- Verify JWT
- Check appId matches
- Validate session if `FEATURE_SESSION_TRACKING` is enabled
- Set `req['user']`, `req['session']`, `req.appId`
- Throw `UnauthorizedException` on any failure (no cookie side effects)

---

### 4. `src/modules/auth/auth.controller.ts`

**Action: Remove `@Res`, `CookieUtil`, and all cookie setting/clearing. Return service results directly.**

Remove these imports:
```typescript
import { Res } from '@nestjs/common';
import type { Response } from 'express';
import { CookieUtil } from 'src/common/utils/cookie.util';
import { AUTH_CONSTANTS } from 'src/common/constants/auth.constants';
```

#### `register` endpoint
Before:
```typescript
@Public()
@Post('register')
@UseGuards(AppIdGuard)
async register(
  @Req() req: Request,
  @Body() registerDto: RegisterDto,
  @Res({ passthrough: true }) res: Response,
) {
  const result = await this.authService.register(registerDto, req);
  CookieUtil.setAccessTokenCookie(res, result.accessToken, ...);
  CookieUtil.setRefreshTokenCookie(res, result.refreshToken, ...);
  if ((result as any).sessionId) {
    CookieUtil.setSessionCookie(res, (result as any).sessionId, ...);
  }
  return result;
}
```

After:
```typescript
@Public()
@Post('register')
@UseGuards(AppIdGuard)
async register(@Req() req: Request, @Body() registerDto: RegisterDto) {
  return this.authService.register(registerDto, req);
}
```

#### `register-admin` endpoint
No changes needed — already returns directly with no cookie handling.

#### `login` endpoint
Before:
```typescript
@Public()
@Post('login')
@UseGuards(AppIdGuard)
async login(
  @Req() req: Request,
  @Body() loginDto: LoginDto,
  @Res({ passthrough: true }) res: Response,
) {
  const result = await this.authService.login(loginDto, req);
  CookieUtil.setAccessTokenCookie(res, result.accessToken, ...);
  CookieUtil.setRefreshTokenCookie(res, result.refreshToken, ...);
  if ((result as any).sessionId) {
    CookieUtil.setSessionCookie(res, (result as any).sessionId, ...);
  }
  return result;
}
```

After:
```typescript
@Public()
@Post('login')
@UseGuards(AppIdGuard)
async login(@Req() req: Request, @Body() loginDto: LoginDto) {
  return this.authService.login(loginDto, req);
}
```

#### `refresh` endpoint
Before:
```typescript
@Private()
@Post('refresh')
@UseGuards(AppIdGuard, RefreshGuard)
async refresh(
  @Req() req: Request,
  @Res({ passthrough: true }) res: Response,
) {
  const refreshToken = req.cookies[AUTH_CONSTANTS.COOKIE_NAMES.REFRESH_TOKEN];
  const result = await this.authService.refreshToken(refreshToken, req.application);
  CookieUtil.setAccessTokenCookie(res, result.accessToken, ...);
  return result;
}
```

After:
```typescript
@Public()
@Post('refresh')
@UseGuards(AppIdGuard, RefreshGuard)
async refresh(@Req() req: Request) {
  const refreshToken = req.body.refreshToken;
  return this.authService.refreshToken(refreshToken, req.application);
}
```

Note: decorator changed from `@Private()` to `@Public()` because the refresh endpoint must be accessible without a valid access token — `RefreshGuard` handles its own validation via the refresh token in the body.

#### `logout` endpoint
Before:
```typescript
@Private()
@Post('logout')
@UseGuards(AppIdGuard, AuthGuard)
async logout(
  @CurrentSession() sessionId: string,
  @Res({ passthrough: true }) res: Response,
) {
  const result = await this.authService.logout(sessionId, res.req['user']?.id);
  CookieUtil.clearAllCookies(res);
  return result;
}
```

After:
```typescript
@Private()
@Post('logout')
@UseGuards(AppIdGuard, AuthGuard)
async logout(
  @CurrentSession() sessionId: string,
  @CurrentUser() user: any,
) {
  return this.authService.logout(sessionId, user?.id);
}
```

#### `verify` endpoint
No changes needed — already has no cookie handling.

---

### 5. `src/modules/auth/auth.service.ts`

**Action: No changes needed.**

The service layer already has no cookie handling. It only generates tokens and interacts with the database. Keep as-is.

---

## Response Contract After Refactor

All endpoints return tokens in the body. Consumers handle storage.

### POST /auth/login and POST /auth/register
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "sessionId": "019e...",
  "expiresIn": 900,
  "user": {
    "id": "019e...",
    "email": "user@email.com",
    "username": "@username"
  },
  "appId": "your-app-id",
  "message": "Login successful"
}
```

### POST /auth/refresh
Request body:
```json
{
  "refreshToken": "eyJ..."
}
```
Response:
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "expiresIn": 900,
  "user": { ... },
  "appId": "your-app-id",
  "message": "Login successful"
}
```

### POST /auth/logout
```json
{
  "message": "Logout successful"
}
```

### GET /auth/verify
```json
{
  "status": 200,
  "message": "Token is valid",
  "data": {
    "id": "019e...",
    "email": "user@email.com",
    "username": "@username",
    "appId": "your-app-id",
    "lastLoginAt": "2026-06-23T06:14:09.715Z",
    "session": {
      "id": "019e...",
      "deviceType": "desktop",
      "deviceName": "Unknown Device",
      "ipAddress": "192.168.1.1",
      "lastActivityAt": "2026-06-23T06:14:09.747Z",
      "createdAt": "2026-06-22T06:08:37.749Z"
    }
  }
}
```

---

## What Consumers Must Do

### API Gateway (NestJS — web browser clients)
```typescript
// On login/register — read body, set cookies
async login(loginDto: LoginDto, req: Request, res: Response) {
  const { data } = await this.post('/auth/login', loginDto, req);
  res.cookie('access_token', data.accessToken, { httpOnly: true, ... });
  res.cookie('refresh_token', data.refreshToken, { httpOnly: true, ... });
  res.cookie('session_id', data.sessionId, { httpOnly: true, ... });
  return data;
}

// On refresh — read cookie, send as body, set new access token cookie
async refresh(req: Request, res: Response) {
  const refreshToken = req.cookies['refresh_token'];
  const { data } = await this.post('/auth/refresh', { refreshToken }, req);
  res.cookie('access_token', data.accessToken, { httpOnly: true, ... });
  return data;
}

// On logout — clear all cookies
async logout(req: Request, res: Response) {
  const { data } = await this.post('/auth/logout', {}, req);
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
  res.clearCookie('session_id');
  return data;
}
```

### Mobile (React Native with Expo)
```typescript
// On login — store in SecureStore
const result = await authApi.login(credentials);
await SecureStore.setItemAsync('access_token', result.accessToken);
await SecureStore.setItemAsync('refresh_token', result.refreshToken);

// On refresh — read from SecureStore, send as body
const refreshToken = await SecureStore.getItemAsync('refresh_token');
const result = await authApi.refresh({ refreshToken });
await SecureStore.setItemAsync('access_token', result.accessToken);
```

---

## Checklist

- [ ] Delete `src/common/utils/cookie.util.ts`
- [ ] Remove all `CookieUtil` imports from all files
- [ ] `refresh.guard.ts` — read from `req.body.refreshToken` not cookies
- [ ] `refresh.guard.ts` — remove `Response` import and cookie clearing
- [ ] `auth.guard.ts` — remove `CookieUtil.clearAllCookies()` calls
- [ ] `auth.guard.ts` — remove `Response` import if unused
- [ ] `auth.controller.ts` — remove `@Res` from register, login, refresh, logout
- [ ] `auth.controller.ts` — remove `Response` import
- [ ] `auth.controller.ts` — remove `CookieUtil` import
- [ ] `auth.controller.ts` — remove `AUTH_CONSTANTS` import if only used for cookie names
- [ ] `auth.controller.ts` — refresh reads `req.body.refreshToken` not `req.cookies`
- [ ] `auth.controller.ts` — logout uses `@CurrentUser()` not `res.req['user']`
- [ ] `auth.controller.ts` — refresh decorator changed to `@Public()`
- [ ] Verify no other files import `CookieUtil`
- [ ] Test all endpoints return tokens in body only
- [ ] Confirm no `Set-Cookie` headers appear in auth-service responses