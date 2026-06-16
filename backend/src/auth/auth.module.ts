import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { TokenService } from './token.service';
import { RefreshSessionEntity } from './entities/refreshSessions.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshSessionsRepository } from './repositories/refreshSessions.repository';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([RefreshSessionEntity]),

    JwtModule.register({
      global: true,
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    ConfigService,
    RefreshSessionsRepository,
    TokenService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [AuthService, TokenService],
})
export class AuthModule {}
