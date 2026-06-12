# ERP SaaS Schema Specification

## Purpose

This document defines the database schema direction for the ERP SaaS application's initial authorization and tenant model. It is intended for coding agents implementing the backend in NestJS with TypeORM and a relational database such as MySQL/InnoDB. The design aligns with the current project requirement that a SuperAdmin manages Companies, Users, and Groups, while group-based capabilities remain fully dynamic and database-driven rather than hardcoded.

## Design Principles

The schema is built on three core layers: user identity, group membership, and capability grants. A user belongs to a company, a user is assigned to a group, and a group is assigned a set of capabilities; authorization is then derived from those relations instead of from static role checks in code.

The tenant boundary is the company. Each user belongs to exactly one company, and application data access is scoped by company unless the authenticated actor is the platform SuperAdmin, who operates across all companies.

Groups are dynamic and company-scoped. capabilities are global capability definitions, while groups are tenant-specific collections of those capabilities, allowing different companies to maintain their own role structures even when they reuse the same capability catalog.[

## Scope of This Schema

This specification covers the following core entities for the first iteration:

- Companies
- Users
- Groups
- capabilities
- Groupcapabilities
- UserGroups

This specification assumes the current business rule is **one user belongs to exactly one company** and **one user is assigned to exactly one group at a time**, while keeping the schema flexible enough to evolve later if multiple group membership is needed.

## Domain Model Overview

The authorization graph is:

```text
companies  ←── users  ←── user_groups ←── groups ←── group_capabilities ←── capabilities
    ↑                                          ↑
    └────── parentCompanyId (self-reference)   companyId
```

capability resolution follows this chain:

```text
user → user_groups → group → group_capabilities → capabilities
```

This model allows a single source of truth for authorization and keeps CRUD management of groups and capabilities inside the product UI rather than in application code.

## Table Specifications

### 1. companies

The `companies` table is the tenant root. Each row represents one tenant organization in the ERP. A self-referencing parent relationship supports parent-child company visibility rules required by the project.

| Column            | Type            | Null | Key | Notes                               |
| ----------------- | --------------- | ---: | --- | ----------------------------------- |
| id                | BIGINT UNSIGNED |   No | PK  | Surrogate primary key               |
| uuid              | CHAR(36)        |   No | UQ  | Public-safe identifier for APIs/UI  |
| name              | VARCHAR(150)    |   No |     | Company display name                |
| code              | VARCHAR(50)     |  Yes | UQ  | Optional human-readable tenant code |
| parent_company_id | BIGINT UNSIGNED |  Yes | FK  | Self-reference to `companies.id`    |
| status            | TINYINT(1)      |   No |     | 1 active, 0 inactive                |
| created_by        | BIGINT UNSIGNED |  Yes | FK  | User that created the row           |
| updated_by        | BIGINT UNSIGNED |  Yes | FK  | Last updater                        |
| created_at        | DATETIME        |   No |     | Audit timestamp                     |
| updated_at        | DATETIME        |   No |     | Audit timestamp                     |
| deleted_at        | DATETIME        |  Yes |     | Optional soft delete                |

#### Constraints

- `PRIMARY KEY (id)`
- `UNIQUE (uuid)`
- `UNIQUE (code)` when code is used
- `FOREIGN KEY (parent_company_id) REFERENCES companies(id)`
- `CHECK`-style application validation to prevent a company from referencing itself as parent

#### Notes

- Parent-child visibility should be enforced in backend authorization logic and repository query construction, not only in the UI.
- Company deletion should generally be soft delete or blocked when dependent users/groups exist.

### 2. users

The `users` table stores platform and tenant users. Every user belongs to exactly one company, which defines the tenant boundary for normal access checks.

| Column         | Type            | Null | Key | Notes                                |
| -------------- | --------------- | ---: | --- | ------------------------------------ |
| id             | BIGINT UNSIGNED |   No | PK  | Surrogate primary key                |
| uuid           | CHAR(36)        |   No | UQ  | Public-safe identifier               |
| company_id     | BIGINT UNSIGNED |   No | FK  | Tenant ownership                     |
| name           | VARCHAR(150)    |   No |     | Full name                            |
| email          | VARCHAR(255)    |   No | UQ  | Login/contact email                  |
| username       | VARCHAR(100)    |   No | UQ  | Login username                       |
| phone          | VARCHAR(30)     |  Yes |     | Optional contact number              |
| password_hash  | VARCHAR(255)    |   No |     | Password hash only, never plain text |
| status         | TINYINT(1)      |   No |     | 1 active, 0 inactive                 |
| is_super_admin | TINYINT(1)      |   No | IDX | Platform-level override flag         |
| dob            | DATE            |  Yes |     | Optional DOB                         |
| last_access_at | DATETIME        |  Yes |     | Last successful access               |
| created_by     | BIGINT UNSIGNED |  Yes | FK  | Audit                                |
| updated_by     | BIGINT UNSIGNED |  Yes | FK  | Audit                                |
| created_at     | DATETIME        |   No |     | Audit timestamp                      |
| updated_at     | DATETIME        |   No |     | Audit timestamp                      |
| deleted_at     | DATETIME        |  Yes |     | Optional soft delete                 |

#### Constraints

- `PRIMARY KEY (id)`
- `UNIQUE (uuid)`
- `UNIQUE (email)`
- `UNIQUE (username)`
- `FOREIGN KEY (company_id) REFERENCES companies(id)`

#### Notes

- `is_super_admin` is the only intended platform-level exception field in this version. It should be used sparingly for the developer/platform operator account and should not replace the regular group-capability mechanism for tenant administration.
- Even when `is_super_admin = 1`, assigning the user to a SuperAdmin group with full capabilities keeps the model operationally consistent.

### 3. groups

The `groups` table represents dynamic roles. Groups belong to a company so each tenant can maintain its own role names and role definitions independently.

| Column          | Type            | Null | Key | Notes                                          |
| --------------- | --------------- | ---: | --- | ---------------------------------------------- |
| id              | BIGINT UNSIGNED |   No | PK  | Surrogate primary key                          |
| uuid            | CHAR(36)        |   No | UQ  | Public-safe identifier                         |
| company_id      | BIGINT UNSIGNED |   No | FK  | Tenant owner of this group                     |
| name            | VARCHAR(120)    |   No |     | Group/role name                                |
| description     | VARCHAR(255)    |  Yes |     | Optional description                           |
| status          | TINYINT(1)      |   No |     | 1 active, 0 inactive                           |
| is_system_group | TINYINT(1)      |   No | IDX | Protect seeded groups like platform SuperAdmin |
| created_by      | BIGINT UNSIGNED |  Yes | FK  | Audit                                          |
| updated_by      | BIGINT UNSIGNED |  Yes | FK  | Audit                                          |
| created_at      | DATETIME        |   No |     | Audit timestamp                                |
| updated_at      | DATETIME        |   No |     | Audit timestamp                                |
| deleted_at      | DATETIME        |  Yes |     | Optional soft delete                           |

#### Constraints

- `PRIMARY KEY (id)`
- `UNIQUE (uuid)`
- `UNIQUE (company_id, name)` so duplicate group names are allowed across companies but not within the same company
- `FOREIGN KEY (company_id) REFERENCES companies(id)`

#### Notes

- `is_system_group` is recommended for groups that should not be deleted casually, such as the seeded SuperAdmin group.
- Tenant admins should only manage groups belonging to their own company; platform SuperAdmin can manage groups across companies.

### 4. capabilities

The `capabilities` table stores capability definitions. These are global system capabilities, not tenant-specific rows. A capability usually maps to a module-resource plus action combination.[web:24][web:36]

| Column       | Type            | Null | Key | Notes                                       |
| ------------ | --------------- | ---: | --- | ------------------------------------------- |
| id           | BIGINT UNSIGNED |   No | PK  | Surrogate primary key                       |
| code         | VARCHAR(150)    |   No | UQ  | Stable capability code, e.g. `users.create` |
| module       | VARCHAR(100)    |   No | IDX | Module name, e.g. `users`                   |
| action       | VARCHAR(50)     |   No | IDX | Action, e.g. `create`                       |
| display_name | VARCHAR(150)    |   No |     | Admin-friendly label                        |
| description  | VARCHAR(255)    |  Yes |     | Optional description                        |
| status       | TINYINT(1)      |   No |     | Allows controlled deprecation               |
| created_at   | DATETIME        |   No |     | Audit timestamp                             |
| updated_at   | DATETIME        |   No |     | Audit timestamp                             |

#### Constraints

- `PRIMARY KEY (id)`
- `UNIQUE (code)`
- `UNIQUE (module, action)`

#### Notes

- The recommended canonical identifier is `code`, for example `users.create`, `users.read`, `groups.update`, `companies.delete`.
- capabilities should be seeded through migrations whenever new modules are introduced, while still being visible and assignable in the UI.
- Avoid storing capabilities as JSON blobs inside groups; normalized rows make querying and change tracking cleaner.

### 5. group_capabilities

The `group_capabilities` table is the junction table connecting groups and capabilities. It defines what a group can do.

| Column        | Type            | Null | Key   | Notes                        |
| ------------- | --------------- | ---: | ----- | ---------------------------- |
| group_id      | BIGINT UNSIGNED |   No | PK/FK | References `groups.id`       |
| capability_id | BIGINT UNSIGNED |   No | PK/FK | References `capabilities.id` |
| created_at    | DATETIME        |   No |       | Audit timestamp              |
| created_by    | BIGINT UNSIGNED |  Yes | FK    | Who granted the capability   |

#### Constraints

- `PRIMARY KEY (group_id, capability_id)`
- `FOREIGN KEY (group_id) REFERENCES groups(id)`
- `FOREIGN KEY (capability_id) REFERENCES capabilities(id)`

#### Notes

- This table should be treated as the authoritative capability assignment table for all groups.
- Bulk replace behavior is usually easier than row-by-row patching when editing a group's capability set.

### 6. user_groups

The `user_groups` table links users to groups. Even though the current business rule is one user to one group, using a junction table preserves a cleaner path for future expansion while keeping the present rule enforceable via an additional unique constraint.web:26]

| Column      | Type            | Null | Key   | Notes                  |
| ----------- | --------------- | ---: | ----- | ---------------------- |
| user_id     | BIGINT UNSIGNED |   No | PK/FK | References `users.id`  |
| group_id    | BIGINT UNSIGNED |   No | FK    | References `groups.id` |
| assigned_at | DATETIME        |   No |       | Assignment timestamp   |
| assigned_by | BIGINT UNSIGNED |  Yes | FK    | Who assigned the group |

#### Constraints

- `PRIMARY KEY (user_id, group_id)`
- `UNIQUE (user_id)` to enforce one active group per user in v1
- `FOREIGN KEY (user_id) REFERENCES users(id)`
- `FOREIGN KEY (group_id) REFERENCES groups(id)`

#### Notes

- If future requirements allow multiple groups per user, drop `UNIQUE (user_id)` and keep the composite primary key.
- Service-level validation should ensure the assigned group belongs to the same company as the user, unless the business model is explicitly changed later.

## Recommended Seed Data

### Platform bootstrap data

The initial deployment should seed:

- One platform company for the ERP owner/operator
- One SuperAdmin user attached to that company
- One protected SuperAdmin group under that company
- Core capabilities for initial modules: users, groups, companies, currency, activity master
- Group-capability assignments granting all seeded capabilities to the SuperAdmin group

### Example capability codes

| Module       | Actions                            | Example Codes                                                                                                 |
| ------------ | ---------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| users        | list, read, create, update, delete | `users.list`, `users.read`, `users.create`, `users.update`, `users.delete`                                    |
| groups       | list, read, create, update, delete | `groups.list`, `groups.read`, `groups.create`, `groups.update`, `groups.delete`                               |
| companies    | list, read, create, update, delete | `companies.list`, `companies.read`, `companies.create`, `companies.update`, `companies.delete`                |
| capabilities | list, read, create, update, delete | `capabilities.list`, `capabilities.read`, `capabilities.create`, `capabilities.update`, `capabilities.delete` |

Using `list` separately from `read` is useful because listing pages and detail pages may eventually be governed independently.

## Authorization Semantics

### Standard tenant user

A normal authenticated user:

1. Belongs to one company.
2. Has one assigned group in v1.
3. Inherits capabilities through that group.
4. Can only access records within the allowed company boundary unless explicit parent-child visibility rules apply.

### SuperAdmin

The platform SuperAdmin is modeled as a regular user row plus elevated platform behavior. The recommended implementation is:

- `users.is_super_admin = 1`
- user belongs to platform company
- user is assigned to protected SuperAdmin group
- SuperAdmin group holds all capabilities

This dual approach provides operational consistency in the group-capability model while giving the backend an explicit and efficient bypass signal for company-scoped filtering where needed.

## Repository and Service Rules

The following implementation rules should be treated as mandatory for coding agents:

1. All tenant-owned queries must include company scoping by default.
2. Company scoping must be enforced in backend repository/data-access logic, not only in controllers or frontend code.
3. `is_super_admin` may bypass tenant filters only where the platform truly requires cross-company access.
4. Group assignment must validate that `users.company_id = groups.company_id` before insert/update into `user_groups`.
5. Group deletion must be blocked or soft-protected for rows where `is_system_group = 1`.
6. capability checks in guards should operate on capability codes such as `users.create` rather than on raw group names.
7. Parent-child company visibility should be modeled as an authorization rule, not by duplicating rows across tenants.

## Indexing Recommendations

The schema should include indexes that support common ERP admin operations and authorization checks.

Recommended indexes:

- `users(company_id, status)`
- `users(email)`
- `users(username)`
- `groups(company_id, status)`
- `groups(company_id, name)` unique index
- `capabilities(module, action)` unique index
- `group_capabilities(capability_id)`
- `user_groups(group_id)`
- `companies(parent_company_id)`
- `users(is_super_admin)`

These indexes support tenant listings, login lookups, capability resolution, and hierarchy traversal.

## TypeORM Mapping Guidance

The expected entity relations are:

- `Company` has many `User`
- `Company` has many `Group`
- `Company` may belong to one parent `Company`
- `Company` may have many child `Company`
- `User` belongs to one `Company`
- `User` has one `UserGroup` row in v1
- `Group` belongs to one `Company`
- `Group` has many `UserGroup`
- `Group` has many `Groupcapability`
- `capability` has many `Groupcapability`

For cleaner audit modeling, `created_by` and `updated_by` can remain scalar foreign key columns in v1 rather than full bidirectional TypeORM relations if that reduces circular dependency complexity.

## SQL DDL Reference Shape

The following is a concise structural example for implementation planning only. It is not the final migration script.

```sql
CREATE TABLE companies (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  uuid CHAR(36) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  code VARCHAR(50) NULL UNIQUE,
  parent_company_id BIGINT UNSIGNED NULL,
  status TINYINT(1) NOT NULL DEFAULT 1,
  created_by BIGINT UNSIGNED NULL,
  updated_by BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  CONSTRAINT fk_companies_parent FOREIGN KEY (parent_company_id) REFERENCES companies(id)
);

CREATE TABLE users (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  uuid CHAR(36) NOT NULL UNIQUE,
  company_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(30) NULL,
  password_hash VARCHAR(255) NOT NULL,
  status TINYINT(1) NOT NULL DEFAULT 1,
  is_super_admin TINYINT(1) NOT NULL DEFAULT 0,
  dob DATE NULL,
  last_access_at DATETIME NULL,
  refresh_token_hash VARCHAR(255) NULL,
  created_by BIGINT UNSIGNED NULL,
  updated_by BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  CONSTRAINT fk_users_company FOREIGN KEY (company_id) REFERENCES companies(id)
);

CREATE TABLE `groups` (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  uuid CHAR(36) NOT NULL UNIQUE,
  company_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(120) NOT NULL,
  description VARCHAR(255) NULL,
  status TINYINT(1) NOT NULL DEFAULT 1,
  is_system_group TINYINT(1) NOT NULL DEFAULT 0,
  created_by BIGINT UNSIGNED NULL,
  updated_by BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  CONSTRAINT uq_groups_company_name UNIQUE (company_id, name),
  CONSTRAINT fk_groups_company FOREIGN KEY (company_id) REFERENCES companies(id)
);

CREATE TABLE capabilities (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(150) NOT NULL UNIQUE,
  module VARCHAR(100) NOT NULL,
  action VARCHAR(50) NOT NULL,
  display_name VARCHAR(150) NOT NULL,
  description VARCHAR(255) NULL,
  status TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_capabilities_module_action UNIQUE (module, action)
);

CREATE TABLE group_capabilities (
  group_id BIGINT UNSIGNED NOT NULL,
  capability_id BIGINT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by BIGINT UNSIGNED NULL,
  PRIMARY KEY (group_id, capability_id),
  CONSTRAINT fk_group_capabilities_group FOREIGN KEY (group_id) REFERENCES `groups`(id),
  CONSTRAINT fk_group_capabilities_capability FOREIGN KEY (capability_id) REFERENCES capabilities(id)
);

CREATE TABLE user_groups (
  user_id BIGINT UNSIGNED NOT NULL,
  group_id BIGINT UNSIGNED NOT NULL,
  assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  assigned_by BIGINT UNSIGNED NULL,
  PRIMARY KEY (user_id, group_id),
  UNIQUE KEY uq_user_groups_user (user_id),
  CONSTRAINT fk_user_groups_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_user_groups_group FOREIGN KEY (group_id) REFERENCES `groups`(id)
);
```

## Non-Goals for This Iteration

The following are intentionally excluded from this v1 schema and should not be mixed in prematurely:

- Attribute-based access control (ABAC)
- Resource-instance sharing rules beyond company and parent-child logic
- Multi-company membership per user
- Multiple active groups per user
- Fine-grained row-level capability overrides per user
- External identity provider mapping tables

These can be added later once the core RBAC and tenant foundation is stable.

## Final Implementation Decisions for Coding Agents

Coding agents should proceed with the following assumptions:

- Use normalized RBAC tables: `groups`, `capabilities`, `group_capabilities`, `user_groups`.
- Keep `capabilities` global and `groups` tenant-scoped.
- Keep `users.company_id` mandatory.
- Enforce one user to one group in v1 using `UNIQUE (user_id)` on `user_groups`.
- Include `users.is_super_admin` as a platform-level flag.
- Also assign SuperAdmin to a protected SuperAdmin group with all capabilities.
- Enforce tenant scoping in repository/data-access code, not in frontend code alone.
- Seed capabilities and protected bootstrap data via migrations.

## Open Questions

These items should be confirmed before generating the final migration set:

1. Whether company `code` is required or optional in v1.
   -Answer:company code is required for v1
2. Whether soft delete is needed on all six tables or only tenant-owned master tables.
   -Answer:Soft delete for only tenant-owned master tables
3. Whether capability master CRUD should be exposed in the UI immediately or remain developer-seeded first.
   -Anser:Yes capabilities master should be exposed in UI
4. Whether `status` should remain boolean-like (`TINYINT(1)`) or move to a normalized status master later.
   -Answer:For v1 TINYINT(1) is enough .
5. Whether parent-company access should include only direct children or full descendant trees.
   -Answer:For V1 should include only direct children
