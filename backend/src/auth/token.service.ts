import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'node:crypto';

@Injectable()
export class TokenService {
  private readonly accessSecret = process.env.JWT_ACCESS_SECRET!;
  private readonly refreshSecret = process.env.JWT_REFRESH_SECRET!;
  private readonly accessExpires = process.env.JWT_ACCESS_EXPIRES || '2d';
  private readonly refreshExpires = process.env.JWT_REFRESH_EXPIRES || '7d';

  constructor(private readonly jwtService: JwtService) {}

  private parseDurationToMs(duration: string): number {
    const match = duration.match(/^(\d+)([dhms])$/);
    if (!match) return 24 * 60 * 60 * 1000; // default 1 day
    const value = parseInt(match[1], 10);
    const unit = match[2];
    switch (unit) {
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'm':
        return value * 60 * 1000;
      case 's':
        return value * 1000;
      default:
        return 0;
    }
  }

  signAccessToken(payload: {
    sub: number;
    email: string;
    role: string;
    isSuperAdmin: number;
    companyId: number;
  }) {
    const token = this.jwtService.sign(payload, {
      secret: this.accessSecret,
      expiresIn: this.accessExpires as any,
    });

    const expiresAt = new Date(
      Date.now() + this.parseDurationToMs(this.accessExpires),
    );

    return {
      token,
      expiresAt,
    };
  }

  signRefreshToken(payload: { sub: number; sid: string }) {
    const token = this.jwtService.sign(payload, {
      secret: this.refreshSecret,
      expiresIn: this.refreshExpires as any,
    });

    const expiresAt = new Date(
      Date.now() + this.parseDurationToMs(this.refreshExpires),
    );

    return {
      token,
      expiresAt,
    };
  }

  verifyAccessToken(token: string) {
    return this.jwtService.verify(token, {
      secret: this.accessSecret,
    }) as {
      sub: number;
      email: string;
      role: string;
      isSuperAdmin: number;
      companyId: number;
      exp: number;
      iat: number;
    };
  }

  verifyRefreshToken(token: string) {
    return this.jwtService.verify(token, {
      secret: this.refreshSecret,
    }) as {
      sub: number;
      sid: string;
      exp: number;
      iat: number;
    };
  }

  hashToken(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
