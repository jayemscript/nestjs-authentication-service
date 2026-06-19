import { Controller, Post, Get, Body, UseGuards, Res, Req } from '@nestjs/common';
import type { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RefreshGuard } from 'src/common/guards/refresh.guard';
import { AppIdGuard } from 'src/common/guards/app-id.guard';
import { CookieUtil } from 'src/common/utils/cookie.util';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CurrentSession } from 'src/common/decorators/current-session.decorator';
import { AppId } from 'src/common/decorators/app-id.decorator';
import { Throttle } from '@nestjs/throttler';
import { Private } from 'src/common/decorators/private.decorator';
import { User } from '../users/entities/user.entity';
import { AuthVerifyResponseDto } from './dtos/auth-verify-response.dto';
import { AUTH_CONSTANTS } from 'src/common/constants/auth.constants';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post('register')
  @UseGuards(AppIdGuard)
  // @Throttle({ auth: { ttl: 60000, limit: 10 } })
  async register(
    @Req() req: Request,
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(registerDto, req);

    const cookieExpiration =
      this.configService.get<number>('COOKIE_EXPIRATION') || 2592000000;

    CookieUtil.setAccessTokenCookie(res, result.accessToken, cookieExpiration);
    CookieUtil.setRefreshTokenCookie(
      res,
      result.refreshToken,
      cookieExpiration,
    );
    if ((result as any).sessionId) {
       res.cookie(AUTH_CONSTANTS.COOKIE_NAMES.SESSION, (result as any).sessionId, {
         httpOnly: true,
         secure: this.configService.get<string>('COOKIE_SECURE') === 'true',
         sameSite: this.configService.get<string>('COOKIE_SAMESITE') as any || 'lax',
         maxAge: cookieExpiration,
       });
    }

    return result;
  }

  @Private()
  @UseGuards(AppIdGuard, AuthGuard)
  @Post('register-admin')
  async registerAdmin(
    @Req() req: Request,
    @Body() registerDto: RegisterDto,
  ) {
    // Uses the same logic as register but requires an authenticated user.
    // We don't set cookies here so we don't overwrite the admin's current session.
    const result = await this.authService.register(registerDto, req);
    return result;
  }

  @Public()
  @Post('login')
  @UseGuards(AppIdGuard)
  // @Throttle({ auth: { ttl: 60000, limit: 10 } })
  async login(
    @Req() req: Request,
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(loginDto, req);

    const cookieExpiration =
      this.configService.get<number>('COOKIE_EXPIRATION') || 2592000000;

    CookieUtil.setAccessTokenCookie(res, result.accessToken, cookieExpiration);
    CookieUtil.setRefreshTokenCookie(
      res,
      result.refreshToken,
      cookieExpiration,
    );
    if ((result as any).sessionId) {
       res.cookie(AUTH_CONSTANTS.COOKIE_NAMES.SESSION, (result as any).sessionId, {
         httpOnly: true,
         secure: this.configService.get<string>('COOKIE_SECURE') === 'true',
         sameSite: this.configService.get<string>('COOKIE_SAMESITE') as any || 'lax',
         maxAge: cookieExpiration,
       });
    }

    return result;
  }

  @Private()
  @Post('refresh')
  @UseGuards(AppIdGuard, RefreshGuard)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies['refresh_token'];
    const result = await this.authService.refreshToken(
      refreshToken,
      req.application,
    );

    const cookieExpiration =
      this.configService.get<number>('COOKIE_EXPIRATION') || 2592000000;

    CookieUtil.setAccessTokenCookie(res, result.accessToken, cookieExpiration);

    return result;
  }

  @Private()
  @Post('logout')
  @UseGuards(AppIdGuard, AuthGuard)
  async logout(
    @CurrentSession() sessionId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.logout(sessionId, res.req['user']?.id);
    CookieUtil.clearAllCookies(res);
    res.clearCookie(AUTH_CONSTANTS.COOKIE_NAMES.SESSION);
    return result;
  }

  @Get('verify')
  @UseGuards(AppIdGuard, AuthGuard)
  async verify(
    @CurrentUser() user: any,
    @AppId() appId: string,
  ): Promise<AuthVerifyResponseDto> {
    return this.authService.verify(user.id, appId);
  }
}
