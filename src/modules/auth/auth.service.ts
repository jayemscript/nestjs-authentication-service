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
import {
  AuthVerifyResponseDto,
  SessionMetaDto,
} from './dtos/auth-verify-response.dto';
import { AppContextService } from '../app-context/app-context.service';
import { APP_CONTEXT_CONSTANTS } from 'src/common/constants/app-context.constants';
import { ApplicationContext } from 'src/common/types/application-context.types';
import { AUTH_CONSTANTS } from 'src/common/constants/auth.constants';
import { RefreshTokenPayload } from 'src/common/types/jwt-payload.types';
import { User } from 'src/modules/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly sessionsService: SessionsService,
    private readonly appContextService: AppContextService,
  ) {}

  async register(
    registerDto: RegisterDto,
    req: Request,
  ): Promise<AuthResponseDto> {
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

    const [existingEmail, existingUsername] = await Promise.all([
      this.userRepository.findByEmail(email),
      this.userRepository.findByUsername(username),
    ]);

    let user: User;

    if (existingEmail || existingUsername) {
      // Users are global identities. Registration from another application
      // must reuse the same identity and create an app-scoped session instead
      // of attempting to insert a duplicate user.
      if (
        !existingEmail ||
        !existingUsername ||
        existingEmail.id !== existingUsername.id
      ) {
        throw new ConflictException(MESSAGES.USER.ALREADY_EXISTS);
      }

      user = existingEmail;

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
        throw new UnauthorizedException(MESSAGES.AUTH.LOGIN_FAILED);
      }

      user.lastLoginAt = new Date();
      await this.userRepository.updateUser(user.id, {
        lastLoginAt: user.lastLoginAt,
        failedLoginAttempts: 0,
        lockedUntil: undefined,
      });
    } else {
      const hashedPassword = await HashUtil.hashPassword(
        password,
        parseInt(
          this.configService.get<string>('PASSWORD_HASH_ROUNDS') || '10',
          10,
        ),
      );

      user = await this.userRepository.createUser({
        email,
        username,
        password: hashedPassword,
        status: UserStatus.ACTIVE,
      });
    }

    const applicationContext =
      await this.appContextService.resolveApplicationContext(req.appId);
    await this.userRepository.addApplicationMembership(
      user.id,
      applicationContext.appId,
    );
    const session = await this.sessionsService.createSession(
      user.id,
      req,
      applicationContext,
    );

    const response = this.generateAuthResponse(
      user,
      session.id,
      applicationContext,
    );
    await this.storeRefreshToken(session.id, response.refreshToken);
    return response;
  }

  async login(loginDto: LoginDto, req: Request): Promise<AuthResponseDto> {
    const { identifier, password } = loginDto;

    const user =
      await this.userRepository.findByIdentifier(identifier);

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

    const applicationContext =
      await this.appContextService.resolveApplicationContext(req.appId);
    const isMember = await this.userRepository.isMemberOfApplication(
      user.id,
      applicationContext.appId,
    );
    if (!isMember) {
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

    const session = await this.sessionsService.createSession(
      user.id,
      req,
      applicationContext,
    );

    const response = this.generateAuthResponse(
      user,
      session.id,
      applicationContext,
    );
    await this.storeRefreshToken(session.id, response.refreshToken);
    return response;
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
      const payloadAppId =
        payload.appId || APP_CONTEXT_CONSTANTS.DEFAULT_APP_ID;

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

      const isMember = await this.userRepository.isMemberOfApplication(
        user.id,
        appContext.appId,
      );
      if (!isMember) {
        throw new UnauthorizedException(MESSAGES.ERROR.INVALID_TOKEN);
      }

      if (payload.sessionId) {
        const isSessionValid = await this.sessionsService.validateSessionForApp(
          payload.sessionId,
          appContext.appId,
        );
        if (!isSessionValid) {
          throw new UnauthorizedException(MESSAGES.ERROR.INVALID_TOKEN);
        }
      }

      if (!payload.sessionId) {
        throw new UnauthorizedException(MESSAGES.ERROR.INVALID_TOKEN);
      }

      const response = this.generateAuthResponse(
        user,
        payload.sessionId,
        appContext,
      );
      const rotated = await this.sessionsService.rotateRefreshTokenHash(
        payload.sessionId,
        HashUtil.hashToken(token),
        HashUtil.hashToken(response.refreshToken),
      );
      if (!rotated) {
        throw new UnauthorizedException(MESSAGES.ERROR.INVALID_TOKEN);
      }

      return response;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException(MESSAGES.AUTH.REFRESH_FAILED);
    }
  }

  async logout(
    sessionId?: string,
    userId?: string,
  ): Promise<{ message: string }> {
    if (sessionId && userId) {
      await this.sessionsService.revokeSession(sessionId, userId).catch(() => {
        // Ignore if session not found during logout
      });
    }
    return { message: MESSAGES.AUTH.LOGOUT_SUCCESS };
  }

  // auth.service.ts

  async verify(
    userId: string,
    appId?: string,
    sessionId?: string,
    refreshToken?: string,
  ): Promise<AuthVerifyResponseDto> {
    if (!appId || !sessionId || !refreshToken) {
      throw new UnauthorizedException(MESSAGES.ERROR.UNAUTHORIZED);
    }

    const isSessionValid = await this.sessionsService.validateSessionForApp(
      sessionId,
      appId,
    );
    if (!isSessionValid) {
      throw new UnauthorizedException(MESSAGES.ERROR.INVALID_TOKEN);
    }

    let refreshPayload: RefreshTokenPayload;
    try {
      refreshPayload =
        this.jwtService.verify<RefreshTokenPayload>(refreshToken);
    } catch {
      throw new UnauthorizedException(MESSAGES.ERROR.INVALID_TOKEN);
    }

    if (
      refreshPayload.type !== AUTH_CONSTANTS.TOKEN_TYPES.REFRESH ||
      refreshPayload.id !== userId ||
      refreshPayload.appId !== appId ||
      refreshPayload.sessionId !== sessionId
    ) {
      throw new UnauthorizedException(MESSAGES.ERROR.INVALID_TOKEN);
    }

    const session = await this.sessionsService.getSessionById(sessionId);
    if (session?.refreshTokenHash !== HashUtil.hashToken(refreshToken)) {
      throw new UnauthorizedException(MESSAGES.ERROR.INVALID_TOKEN);
    }

    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UnauthorizedException(MESSAGES.ERROR.INVALID_TOKEN);
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException(MESSAGES.USER.ACCOUNT_DEACTIVATED);
    }

    const isMember = await this.userRepository.isMemberOfApplication(
      user.id,
      appId,
    );
    if (!isMember) {
      throw new UnauthorizedException(MESSAGES.ERROR.INVALID_TOKEN);
    }

    const applicationContext = await this.appContextService.validateUserAccess(
      user.id,
      appId,
    );

    // Explicit type so TypeScript does not collapse the ternary to never
    let sessionMeta: SessionMetaDto | null = null;

    if (sessionId) {
      const session = await this.sessionsService.getSessionById(sessionId);
      if (session) {
        sessionMeta = {
          id: session.id,
          deviceType: session.deviceType,
          deviceName: session.deviceName,
          ipAddress: session.ipAddress,
          lastActivityAt: session.lastActivityAt,
          createdAt: session.createdAt,
        };
      }
    }

    return {
      status: 200,
      message: 'Token is valid',
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
        appId: applicationContext.appId,
        lastLoginAt: user.lastLoginAt,
        session: sessionMeta,
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
        type: AUTH_CONSTANTS.TOKEN_TYPES.ACCESS,
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
        type: AUTH_CONSTANTS.TOKEN_TYPES.REFRESH,
        jti: HashUtil.generateRandomHash(),
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

  private async storeRefreshToken(
    sessionId: string,
    refreshToken: string,
  ): Promise<void> {
    await this.sessionsService.setRefreshTokenHash(
      sessionId,
      HashUtil.hashToken(refreshToken),
    );
  }
}
