//src/common/types/jwt-payload.types.ts
export interface JwtPayload {
  id: string;
  email: string;
  username: string;
  appId?: string;
  sessionId?: string;
  iat?: number;
  exp?: number;
  type?: string;
}

export interface AppScopedJwtPayload extends JwtPayload {
  appId: string;
}

export interface AccessTokenPayload extends JwtPayload {
  type: 'access';
}

export interface RefreshTokenPayload extends JwtPayload {
  type: 'refresh';
}
