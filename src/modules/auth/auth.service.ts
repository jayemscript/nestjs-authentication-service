import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { UserRepository } from 'src/modules/users/repositories/user.repository';
import { SessionsService } from 'src/modules/sessions/sessions.service';
import { HashUtil } from 'src/common/utils/hash.util';
import { ValidatorsUtil } from 'src/common/utils/validators.util';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { AuthResponseDto } from 'src/common/dtos/auth-response.dto';
import { MESSAGES } from 'src/common/constants/messages.constants';
import { UserStatus } from 'src/common/enums/user-status.enum';
import { AuthVerifyResponseDto } from './dtos/auth-verify-response.dto';
import { AppContextService } from '../app-context/app-context.service';
import { APP_CONTEXT_CONSTANTS } from 'src/common/constants/app-context.constants';
import { ApplicationContext } from 'src/common/types/application-context.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly sessionsService: SessionsService,
    private readonly appContextService: AppContextService,
  ) {}

  async register(registerDto: RegisterDto, req: Request): Promise<AuthResponseDto> {
    const { email, username, password, passwordConfirm } = registerDto;

    if (password !== passwordConfirm) {
      throw new BadRequestException(MESSAGES.VALIDATION.PASSWORD_MISMATCH);
    }

    const validatePassword = ValidatorsUtil.validatePassword(
      password,
      parseInt(
        this.configService.get<string>('PASSWORD_MIN_LENGTH') || '8',
        10,
      ),
    );

    if (!validatePassword.valid) {
      throw new BadRequestException(validatePassword.message);
    }

    const existingEmail = await this.userRepository.findByEmail(email);
    if (existingEmail) {
      throw new ConflictException(MESSAGES.USER.ALREADY_EXISTS);
    }

    const existingUsername = await this.userRepository.findByUsername(username);
    if (existingUsername) {
      throw new ConflictException(MESSAGES.USER.ALREADY_EXISTS);
    }

    const hashedPassword = await HashUtil.hashPassword(
      password,
      parseInt(
        this.configService.get<string>('PASSWORD_HASH_ROUNDS') || '10',
        10,
      ),
    );

    const user = await this.userRepository.createUser({
      email,
      username,
      password: hashedPassword,
      status: UserStatus.ACTIVE,
    });

    const applicationContext =
      await this.appContextService.resolveApplicationContext(req.appId);
    const session = await this.sessionsService.createSession(
      user.id,
      req,
      applicationContext,
    );

    return this.generateAuthResponse(user, session.id, applicationContext);
  }

  async login(loginDto: LoginDto, req: Request): Promise<AuthResponseDto> {
    const { emailOrUsername, password } = loginDto;

    const user =
      await this.userRepository.findByEmailOrUsername(emailOrUsername);

    if (!user) {
      throw new UnauthorizedException(MESSAGES.AUTH.LOGIN_FAILED);
    }

    if (user.status === UserStatus.DEACTIVATED) {
      throw new UnauthorizedException(MESSAGES.USER.ACCOUNT_DEACTIVATED);
    }

    if (user.status === UserStatus.LOCKED) {
      throw new UnauthorizedException(MESSAGES.USER.ACCOUNT_LOCKED);
    }

    const isPasswordValid = await HashUtil.comparePassword(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      user.failedLoginAttempts += 1;

      if (
        this.configService.get<string>('FEATURE_ACCOUNT_LOCKING') === 'true'
      ) {
        if (
          user.failedLoginAttempts >=
          parseInt(
            this.configService.get<string>('MAX_LOGIN_ATTEMPTS') || '5',
            10,
          )
        ) {
          const lockTimeMinutes = parseInt(
            this.configService.get<string>('LOCK_TIME_MINUTES') || '15',
            10,
          );
          user.lockedUntil = new Date(Date.now() + lockTimeMinutes * 60 * 1000);
          user.status = UserStatus.LOCKED;
        }
      }

      await this.userRepository.updateUser(user.id, {
        failedLoginAttempts: user.failedLoginAttempts,
        lockedUntil: user.lockedUntil,
        status: user.status,
      });

      throw new UnauthorizedException(MESSAGES.AUTH.LOGIN_FAILED);
    }

    user.failedLoginAttempts = 0;
    user.lockedUntil = undefined;
    user.lastLoginAt = new Date();

    await this.userRepository.updateUser(user.id, {
      failedLoginAttempts: 0,
      lockedUntil: undefined,
      lastLoginAt: user.lastLoginAt,
    });

    const applicationContext = await this.appContextService.validateUserAccess(
      user.id,
      req.appId,
    );
    const session = await this.sessionsService.createSession(
      user.id,
      req,
      applicationContext,
    );

    return this.generateAuthResponse(user, session.id, applicationContext);
  }

  async refreshToken(
    token: string,
    applicationContext?: ApplicationContext,
  ): Promise<AuthResponseDto> {
    try {
      const payload = this.jwtService.verify(token);
      const appContext =
        applicationContext ||
        (await this.appContextService.resolveApplicationContext(payload.appId));
      const payloadAppId = payload.appId || APP_CONTEXT_CONSTANTS.DEFAULT_APP_ID;

      if (payloadAppId !== appContext.appId) {
        throw new UnauthorizedException(MESSAGES.ERROR.INVALID_TOKEN);
      }

      const user = await this.userRepository.findById(payload.id);

      if (!user) {
        throw new UnauthorizedException(MESSAGES.ERROR.INVALID_TOKEN);
      }

      if (user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException(MESSAGES.USER.ACCOUNT_DEACTIVATED);
      }

      if (payload.sessionId) {
        const isSessionValid = await this.sessionsService.validateSessionForApp(
          payload.sessionId,
          appContext.appId,
        );
        if (!isSessionValid) {
          throw new UnauthorizedException(MESSAGES.ERROR.INVALID_TOKEN);
        }
        await this.sessionsService.updateLastActivity(payload.sessionId);
      }

      return this.generateAuthResponse(user, payload.sessionId, appContext);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException(MESSAGES.AUTH.REFRESH_FAILED);
    }
  }

  async logout(sessionId?: string, userId?: string): Promise<{ message: string }> {
    if (sessionId && userId) {
      await this.sessionsService.revokeSession(sessionId, userId).catch(() => {
        // Ignore if session not found during logout
      });
    }
    return { message: MESSAGES.AUTH.LOGOUT_SUCCESS };
  }

  async verify(
    userId: string,
    appId?: string,
  ): Promise<AuthVerifyResponseDto> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UnauthorizedException(MESSAGES.ERROR.INVALID_TOKEN);
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException(MESSAGES.USER.ACCOUNT_DEACTIVATED);
    }

    const applicationContext = await this.appContextService.validateUserAccess(
      user.id,
      appId,
    );

    return {
      status: 200,
      message: 'Token is valid',
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
        appId: applicationContext.appId,
      },
    };
  }

  private generateAuthResponse(
    user: any,
    sessionId?: string,
    applicationContext?: ApplicationContext,
  ): AuthResponseDto {
    const accessTokenExpiration = parseInt(
      this.configService.get<string>('JWT_ACCESS_EXPIRATION') || '900',
      10,
    );
    const appId =
      applicationContext?.appId || APP_CONTEXT_CONSTANTS.DEFAULT_APP_ID;
    const refreshTokenExpiration =
      applicationContext?.refreshTokenExpirationSeconds ??
      parseInt(
        this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '2592000',
        10,
      );

    const accessToken = this.jwtService.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        appId,
        sessionId,
      },
      { expiresIn: accessTokenExpiration },
    );

    const refreshToken = this.jwtService.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        appId,
        sessionId,
      },
      { expiresIn: refreshTokenExpiration },
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: accessTokenExpiration,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      appId,
      message: MESSAGES.AUTH.LOGIN_SUCCESS,
      ...(sessionId ? { sessionId } : {}),
    };
  }
}
