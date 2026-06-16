import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { JwtSignOptions } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';
import { GeneralUtilities } from 'src/packages/utilities/general.utility';
import { UserEntity } from 'src/user/entities/user.entity';
import { loginDto } from './dto/login.dto';
import { UserService } from 'src/user/services/user.service';
import { TokenService } from './token.service';
import { RefreshSessionsRepository } from './repositories/refreshSessions.repository';

/**
 * Stateless JWT authentication service with refresh‑token support.
 *
 * Cookie management is handled by the Next.js BFF layer.
 * This service only issues / verifies tokens and returns plain data.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,

    private readonly tokenService: TokenService,
    private readonly refreshRepo: RefreshSessionsRepository,
  ) {}

  // ───────────────────────── Private helpers ─────────────────────────

  /** Validate credentials and generate access & refresh tokens */
  private async validateUser(
    username: string,
    password: string,
    rememberMe?: boolean,
  ) {
    try {
      const user = await this.userService.findOneByUsername(username);
      if (!user) {
        return { success: 0, message: 'User not found' };
      }

      const passwordMatches = await bcrypt.compare(password, user.passwordHash);
      if (!passwordMatches) {
        return { success: 0, message: 'Invalid credentials' };
      }

      return {
        success: 1,
        message: 'Login validated',
        data: { user },
      };
    } catch (err: any) {
      return { success: 0, message: err.message };
    }
  }

  // ───────────────────────── Login ─────────────────────────

  /**
   * Validate credentials and return tokens + user data.
   * No cookies are set here – the Next.js BFF layer handles that.
   */
  async login(body: loginDto) {
    if (!body.username || !body.password) {
      return { success: 0, message: 'username and password are required' };
    }

    const result = await this.validateUser(
      body.username,
      body.password,
      body.rememberMe,
    );

    if (result.success) {
      const { user } = result.data as { user: UserEntity };

      const refreshSessionId = crypto.randomUUID();

      const access = this.tokenService.signAccessToken({
        sub: user.id,
        email: user.email,
        role: user.role,
        isSuperAdmin: user.isSuperAdmin,
        companyId: user.companyId,
      });

      const refresh = this.tokenService.signRefreshToken({
        sub: user.id,
        sid: refreshSessionId,
      });

      await this.refreshRepo.create({
        id: refreshSessionId,
        userId: user.id,
        tokenHash: this.tokenService.hashToken(refresh.token),
        expiresAt: refresh.expiresAt,
      });

      return {
        success: 1,
        message: 'Logged in successfully',
        data: {
          user,
          accessToken: access.token,
          refreshToken: refresh.token,
          accessTokenExpiresAt: access.expiresAt,
          refreshTokenExpiresAt: refresh.expiresAt,
        },
      };
    }

    throw new UnauthorizedException('Invalid credentials');
  }

  // ───────────────────────── Refresh ─────────────────────────

  /**
   * Verify the given refresh token and issue new access + refresh tokens.
   * The caller (controller) extracts the token from the request.
   */
  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    try {
      const payload = this.tokenService.verifyRefreshToken(refreshToken);
      const tokenHash = this.tokenService.hashToken(refreshToken);

      const current = await this.refreshRepo.findActiveByIdAndHash(
        payload.sid,
        tokenHash,
      );
      if (!current) throw new UnauthorizedException('Invalid refresh token');

      const user = await this.userService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const newSessionId = crypto.randomUUID();
      const access = this.tokenService.signAccessToken({
        sub: user.id,
        email: user.email,
        companyId: user.companyId,
        isSuperAdmin: user.isSuperAdmin,
        role: user.role,
      });

      const nextRefresh = this.tokenService.signRefreshToken({
        sub: user.id,
        sid: newSessionId,
      });

      await this.refreshRepo.rotate(current.id, {
        id: newSessionId,
        userId: user.id,
        tokenHash: this.tokenService.hashToken(nextRefresh.token),
        expiresAt: nextRefresh.expiresAt,
      });

      return {
        success: 1,
        message: 'Token refreshed',
        data: {
          accessToken: access.token,
          accessTokenExpiresAt: access.expiresAt,
          refreshToken: nextRefresh.token,
          refreshTokenExpiresAt: nextRefresh.expiresAt,
        },
      };
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException(
          'Your session has expired. Please log in again.',
        );
      }

      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // ───────────────────────── Logout ─────────────────────────

  /** Return a success response. Cookie clearing is handled by Next.js. */
  // no db managed sessions for now
  async logout(refreshToken: string) {
    if (refreshToken) {
      try {
        const payload = this.tokenService.verifyRefreshToken(refreshToken);
        await this.refreshRepo.revokeById(payload.sid);
      } catch (err) {
        // Ignored. If token is invalid or expired, just proceed with logout.
      }
    }

    return {
      success: 1,
      message: 'Logged out successfully',
    };
  }

  async loginAsUser(body: { adminUsername: string; targetUserId: number }) {
    const { adminUsername, targetUserId } = body;
    try {
      const admin = await this.userService.findOneByUsername(adminUsername);
      if (!admin) {
        return { settings: { success: 0, message: 'Admin not found' } };
      }

      const target = await this.userService.findById(targetUserId);
      if (!target) {
        return { settings: { success: 0, message: 'Target user not found' } };
      }
      return {
        message: 'Login as user successful',
        data: { adminUser: admin, targetUser: target },
      };
    } catch (err: any) {
      throw new UnauthorizedException(err.message ?? err);
    }
  }
}
