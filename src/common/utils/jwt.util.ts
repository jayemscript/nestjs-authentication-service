//src/common/utilts/jwt.util.ts
import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtUtil {
  constructor(private readonly jwtService: JwtService) {}

  generateAccessToken(payload: any, expiresIn: number): string {
    return this.jwtService.sign(payload, {
      expiresIn,
      algorithm: 'HS256',
    });
  }

  generateRefreshToken(payload: any, expiresIn: number): string {
    return this.jwtService.sign(payload, {
      expiresIn,
      algorithm: 'HS256',
    });
  }

  verifyToken(token: string): any {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      return null;
    }
  }

  decodeToken(token: string): any {
    return this.jwtService.decode(token);
  }
}