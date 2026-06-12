import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './typeOrm.config';
import { UserModule } from './user/user.module';
import { GroupModule } from './group/group.module';
import { CompanyModule } from './company/comapny.module';
import { CapabilityModule } from './capability/capability.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    UserModule,
    GroupModule,
    CompanyModule,
    CapabilityModule,
    AuthModule,
  ],
})
export class AppModule {}
