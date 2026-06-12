import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import type { JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { GeneralUtilities } from 'src/packages/utilities/general.utility';
import { UserEntity } from 'src/user/entities/user.entity';
import { loginDto } from './dto/login.dto';
import { UserService } from 'src/user/services/user.service';

/**
 * Stateless JWT authentication service with refresh‑token support.
 *
 * Security tradeoff: refresh tokens are NOT stored in DB.
 * - Server cannot revoke already-issued refresh tokens before expiry.
 * - Logout is browser-side only (clears cookies).
 * - No reuse detection or per-device session management.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly general: GeneralUtilities,
  ) {}

  // ───────────────────────── Private helpers ─────────────────────────

  /** Validate credentials and generate access & refresh tokens */
  private async validateUser(
    username: string,
    password: string,
    rememberMe?: boolean,
  ) {
    try {
      const user = await this.userService.findOne(username);
      if (!user) {
        return { success: 0, message: 'User not found' };
      }

      const passwordMatches = await bcrypt.compare(password, user.passwordHash);
      if (!passwordMatches) {
        return { success: 0, message: 'Invalid credentials' };
      }

      const tokens = this.generateTokens(user, rememberMe);
      return {
        success: 1,
        message: 'Login successful',
        data: { user, ...tokens },
      };
    } catch (err: any) {
      return { success: 0, message: err.message };
    }
  }

  /** Generate tokens; refresh token is only issued when rememberMe === true */
  private generateTokens(user: UserEntity, rememberMe?: boolean) {
    const payload = {
      sub: user.id,
      email: user.email,
      companyId: user.companyId,
      isSuperAdmin: user.isSuperAdmin,
    };

    const accessExpires =
      this.config.get<JwtSignOptions['expiresIn']>('JWT_ACCESS_EXPIRES') ??
      '2d';

    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.getOrThrow<string>('JWT_SECRET'),
      expiresIn: accessExpires,
    });

    let refreshToken: string | undefined;

    if (rememberMe) {
      const refreshExpires =
        this.config.get<JwtSignOptions['expiresIn']>('JWT_REFRESH_EXPIRES') ??
        '7d';

      refreshToken = this.jwtService.sign(payload, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: refreshExpires,
      });
    }

    return { accessToken, refreshToken };
  }

  // ───────────────────────── Login ─────────────────────────

  /** Entry point used by the controller – validates payload, issues tokens */
  async login(req: Request, res: Response, body: loginDto) {
    if (!body.username || !body.password) {
      return { success: 0, message: 'username and password are required' };
    }

    const result = await this.validateUser(
      body.username,
      body.password,
      body.rememberMe,
    );

    if (result.success) {
      const { accessToken, refreshToken, user } = result.data as any;

      // Always set access token cookie
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
      });

      // Set refresh token only if rememberMe was true, otherwise clear stale cookie
      if (refreshToken) {
        res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          sameSite: 'lax',
          secure: false,
        });
      } else {
        res.clearCookie('refreshToken');
      }

      return {
        message: 'Logged in  successfully',
        data: user,
      };
    }

    throw new NotFoundException({
      message: 'User not found',
    });
  }

  // ───────────────────────── Refresh ─────────────────────────

  /** Read refresh cookie, verify, issue new access + refresh tokens */
  async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      }) as any;

      const user = await this.userService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const tokenPayload = {
        sub: user.id,
        email: user.email,
        companyId: user.companyId,
        isSuperAdmin: user.isSuperAdmin,
      };

      const newAccessToken = this.jwtService.sign(tokenPayload, {
        secret: this.config.getOrThrow<string>('JWT_SECRET'),
        expiresIn:
          this.config.get<JwtSignOptions['expiresIn']>('JWT_ACCESS_EXPIRES') ??
          '2d',
      });

      const newRefreshToken = this.jwtService.sign(tokenPayload, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn:
          this.config.get<JwtSignOptions['expiresIn']>('JWT_REFRESH_EXPIRES') ??
          '7d',
      });

      res.cookie('accessToken', newAccessToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
      });

      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
      });

      return { success: 1, message: 'Token refreshed' };
    } catch (error: any) {
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException(
          'Your session has expired. Please log in again.',
        );
      }

      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // ───────────────────────── Logout ─────────────────────────

  /** Clear both cookies */
  async logout(res: Response) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return {
      success: 1,
      message: 'Logged out successfully',
    };
  }

  async loginAsUser(body: { adminUsername: string; targetUserId: number }) {
    const { adminUsername, targetUserId } = body;
    try {
      const admin = await this.userService.findOne(adminUsername);
      if (!admin) {
        return { settings: { success: 0, message: 'Admin not found' } };
      }

      const target = await this.userService.findById(targetUserId);
      if (!target) {
        return { settings: { success: 0, message: 'Target user not found' } };
      }
      return {
        settings: {
          success: 1,
          message: 'Login as user successful',
          data: { adminUser: admin, targetUser: target },
        },
      };
    } catch (err: any) {
      return { settings: { success: 0, message: err.message } };
    }
  }
}
