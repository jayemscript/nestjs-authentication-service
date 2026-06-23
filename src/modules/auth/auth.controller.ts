import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Res,
  Req,
} from '@nestjs/common';
import type { Response, Request } from 'express';
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
import { Private } from 'src/common/decorators/private.decorator';
import { AuthVerifyResponseDto } from './dtos/auth-verify-response.dto';
import { AUTH_CONSTANTS } from 'src/common/constants/auth.constants';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @UseGuards(AppIdGuard)
  async register(
    @Req() req: Request,
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(registerDto, req);

    CookieUtil.setAccessTokenCookie(
      res,
      result.accessToken,
      AUTH_CONSTANTS.ACCESS_TOKEN_EXPIRATION * 1000,
    );
    CookieUtil.setRefreshTokenCookie(
      res,
      result.refreshToken,
      AUTH_CONSTANTS.COOKIE_EXPIRATION_MS,
    );
    if ((result as any).sessionId) {
      CookieUtil.setSessionCookie(
        res,
        (result as any).sessionId,
        AUTH_CONSTANTS.COOKIE_EXPIRATION_MS,
      );
    }

    return result;
  }

  @Private()
  @UseGuards(AppIdGuard, AuthGuard)
  @Post('register-admin')
  async registerAdmin(@Req() req: Request, @Body() registerDto: RegisterDto) {
    // Uses the same logic as register but requires an authenticated user.
    // We don't set cookies here so we don't overwrite the admin's current session.
    return this.authService.register(registerDto, req);
  }

  @Public()
  @Post('login')
  @UseGuards(AppIdGuard)
  async login(
    @Req() req: Request,
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(loginDto, req);

    CookieUtil.setAccessTokenCookie(
      res,
      result.accessToken,
      AUTH_CONSTANTS.ACCESS_TOKEN_EXPIRATION * 1000,
    );
    CookieUtil.setRefreshTokenCookie(
      res,
      result.refreshToken,
      AUTH_CONSTANTS.COOKIE_EXPIRATION_MS,
    );
    if ((result as any).sessionId) {
      CookieUtil.setSessionCookie(
        res,
        (result as any).sessionId,
        AUTH_CONSTANTS.COOKIE_EXPIRATION_MS,
      );
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
    const refreshToken = req.cookies[AUTH_CONSTANTS.COOKIE_NAMES.REFRESH_TOKEN];
    const result = await this.authService.refreshToken(
      refreshToken,
      req.application,
    );

    CookieUtil.setAccessTokenCookie(
      res,
      result.accessToken,
      AUTH_CONSTANTS.ACCESS_TOKEN_EXPIRATION * 1000,
    );

    return result;
  }

  @Private()
  @Post('logout')
  @UseGuards(AppIdGuard, AuthGuard)
  async logout(
    @CurrentSession() sessionId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.logout(
      sessionId,
      res.req['user']?.id,
    );
    CookieUtil.clearAllCookies(res);
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
