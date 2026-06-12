import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CapabilityEntity } from './entities/capability.entity';
import { GroupCapabilityEntity } from './entities/group-capability.entity';
import { CapabilitiesRepository } from './repositories/capabilities.repository';
import { GroupCapabilitiesRepository } from './repositories/group-capabilities.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CapabilityEntity, GroupCapabilityEntity])],
  controllers: [],
  providers: [CapabilitiesRepository, GroupCapabilitiesRepository],
  exports: [TypeOrmModule, CapabilitiesRepository, GroupCapabilitiesRepository],
})
export class CapabilityModule {}
