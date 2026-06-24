// src/modules/auth/auth.controller.ts
import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RefreshGuard } from 'src/common/guards/refresh.guard';
import { AppIdGuard } from 'src/common/guards/app-id.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CurrentSession } from 'src/common/decorators/current-session.decorator';
import { AppId } from 'src/common/decorators/app-id.decorator';
import { Private } from 'src/common/decorators/private.decorator';
import { AuthVerifyResponseDto } from './dtos/auth-verify-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @UseGuards(AppIdGuard)
  async register(@Req() req: Request, @Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto, req);
  }

  @Private()
  @UseGuards(AppIdGuard, AuthGuard)
  @Post('register-admin')
  async registerAdmin(@Req() req: Request, @Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto, req);
  }

  @Public()
  @Post('login')
  @UseGuards(AppIdGuard)
  async login(@Req() req: Request, @Body() loginDto: LoginDto) {
    return this.authService.login(loginDto, req);
  }

  @Public()
  @Post('refresh')
  @UseGuards(AppIdGuard, RefreshGuard)
  async refresh(@Req() req: Request) {
    const refreshToken = req.body.refreshToken;
    return this.authService.refreshToken(refreshToken, req.application);
  }

  @Private()
  @Post('logout')
  @UseGuards(AppIdGuard, AuthGuard)
  async logout(@CurrentSession() sessionId: string, @CurrentUser() user: any) {
    return this.authService.logout(sessionId, user?.id);
  }

  @Get('verify')
  @UseGuards(AppIdGuard, AuthGuard)
  async verify(
    @CurrentUser() user: any,
    @AppId() appId: string,
    @CurrentSession() sessionId: string,
  ): Promise<AuthVerifyResponseDto> {
    return this.authService.verify(user.id, appId, sessionId);
  }
}
