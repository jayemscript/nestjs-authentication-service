import { Response } from 'express';
import { AUTH_CONSTANTS } from '../constants/auth.constants';

type SameSite = 'strict' | 'lax' | 'none';

export class CookieUtil {
  private static getSameSite(): SameSite {
    const sameSite = process.env.COOKIE_SAMESITE as SameSite;
    return sameSite || 'lax';
  }

  static setAccessTokenCookie(
    res: Response,
    token: string,
    expirationMs: number = AUTH_CONSTANTS.COOKIE_EXPIRATION_MS,
  ): void {
    res.cookie(AUTH_CONSTANTS.COOKIE_NAMES.ACCESS_TOKEN, token, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: this.getSameSite(),
      maxAge: expirationMs,
      path: '/',
    });
  }

  static setRefreshTokenCookie(
    res: Response,
    token: string,
    expirationMs: number = AUTH_CONSTANTS.COOKIE_EXPIRATION_MS,
  ): void {
    res.cookie(AUTH_CONSTANTS.COOKIE_NAMES.REFRESH_TOKEN, token, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: this.getSameSite(),
      maxAge: expirationMs,
      path: '/',
    });
  }

  static setSessionCookie(
    res: Response,
    sessionId: string,
    expirationMs: number = 3600000,
  ): void {
    res.cookie(AUTH_CONSTANTS.COOKIE_NAMES.SESSION, sessionId, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: this.getSameSite(),
      maxAge: expirationMs,
      path: '/',
    });
  }

  static clearAccessTokenCookie(res: Response): void {
    res.clearCookie(AUTH_CONSTANTS.COOKIE_NAMES.ACCESS_TOKEN, { path: '/' });
  }

  static clearRefreshTokenCookie(res: Response): void {
    res.clearCookie(AUTH_CONSTANTS.COOKIE_NAMES.REFRESH_TOKEN, { path: '/' });
  }

  static clearSessionCookie(res: Response): void {
    res.clearCookie(AUTH_CONSTANTS.COOKIE_NAMES.SESSION, { path: '/' });
  }

  static clearAllCookies(res: Response): void {
    this.clearAccessTokenCookie(res);
    this.clearRefreshTokenCookie(res);
    this.clearSessionCookie(res);
  }
}
