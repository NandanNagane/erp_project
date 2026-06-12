require('dotenv').config({
  path: '../.env',
});
require('reflect-metadata');
require('ts-node/register');
require('tsconfig-paths/register');

const bcrypt = require('bcrypt');
const { DataSource } = require('typeorm');

const { typeOrmConfig } = require('./typeOrm.config');
const { CompanyEntity } = require('./company/entities/company.entity');
const { UserEntity } = require('./user/entities/user.entity');
const { UserGroupEntity } = require('./user/entities/user-group.entity');
const { GroupEntity } = require('./group/entities/group.entity');
const { CapabilityEntity } = require('./capability/entities/capability.entity');
const {
  GroupCapabilityEntity,
} = require('./capability/entities/group-capability.entity');

const ACTIVE = 1;
const SUPER_ADMIN_COMPANY_CODE = 'PLATFORM';
const SUPER_ADMIN_USERNAME = 'superadmin';
const SUPER_ADMIN_EMAIL = 'superadmin@example.com';
const SUPER_ADMIN_GROUP = 'SuperAdmin';
const DEFAULT_SUPER_ADMIN_PASSWORD = 'Admin@12345';

const capabilities = [
  ['users'],
  ['groups'],
  ['companies'],
  ['capabilities'],
  ['currency'],
  ['activity-master'],
].flatMap(([module]) =>
  ['list', 'read', 'create', 'update', 'delete'].map((action) => ({
    code: `${module}.${action}`,
    module,
    action,
    displayName: `${action} - ${module}`,
    description: `Allow ${action} access for ${module}`,
    status: ACTIVE,
  })),
);

async function upsertOne(repository, where, data) {
  const existing = await repository.findOneBy(where);

  if (existing) {
    return repository.save({ ...existing, ...data });
  }

  return repository.save(data);
}

async function seed(dataSource) {
  const password = process.env.SUPER_ADMIN_PASSWORD ?? '12345';

  console.log(password);

  const passwordHash = await bcrypt.hash(password, 12);

  return dataSource.transaction(async (manager) => {
    const company = await upsertOne(
      manager.getRepository(CompanyEntity),
      { code: SUPER_ADMIN_COMPANY_CODE },
      {
        name: 'Platform Company',
        code: SUPER_ADMIN_COMPANY_CODE,
        status: ACTIVE,
      },
    );

    const group = await upsertOne(
      manager.getRepository(GroupEntity),
      { companyId: company.id, name: SUPER_ADMIN_GROUP },
      {
        companyId: company.id,
        name: SUPER_ADMIN_GROUP,
        description:
          'Protected platform SuperAdmin group with all seeded capabilities',
        status: ACTIVE,
        isSystemGroup: 1,
      },
    );

    const user = await upsertOne(
      manager.getRepository(UserEntity),
      { username: SUPER_ADMIN_USERNAME },
      {
        companyId: company.id,
        name: 'Platform SuperAdmin',
        email: SUPER_ADMIN_EMAIL,
        username: SUPER_ADMIN_USERNAME,
        phone: null,
        passwordHash,
        status: ACTIVE,
        isSuperAdmin: 1,
        dob: null,
        lastAccessAt: null,
      },
    );

    const capabilityRecords = [];

    for (const capability of capabilities) {
      capabilityRecords.push(
        await upsertOne(
          manager.getRepository(CapabilityEntity),
          { code: capability.code },
          capability,
        ),
      );
    }

    await manager
      .getRepository(GroupCapabilityEntity)
      .delete({ groupId: group.id });

    const groupCapabilities = capabilityRecords.map((capability) =>
      manager.getRepository(GroupCapabilityEntity).save({
        groupId: group.id,
        capabilityId: capability.id,
        createdBy: user.id,
      }),
    );

    await Promise.all(groupCapabilities);

    await manager.getRepository(UserGroupEntity).save({
      userId: user.id,
      groupId: group.id,
      assignedBy: user.id,
    });

    return {
      company,
      group,
      user,
      capabilities: capabilityRecords.length,
    };
  });
}

(async () => {
  const dataSource = new DataSource({
    ...typeOrmConfig,
    synchronize: false,
    logging: false,
  });

  try {
    await dataSource.initialize();

    const result = await seed(dataSource);

    console.log('Seed completed successfully');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Seed failed', error);
    process.exitCode = 1;
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
})();
