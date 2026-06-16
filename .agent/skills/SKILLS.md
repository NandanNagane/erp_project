# Agent Skills Map

## Overview

This document catalogs the available **Agent Skills** in the repository and maps them to the Product Requirements Document (PRD) for the ERP Trainee Project.

---

## Available Skills

### Backend Development

- **backend-development** – Backend API design, GraphQL architecture, workflow orchestration with Temporal, and test-driven backend development.
  - Path: `.agent/skills/backend-development`
  - Version: `1.3.2`
  - Agents:
    - `backend-development-backend-architect`
    - `event-sourcing-architect`
    - `backend-development-graphql-architect`
    - `backend-development-performance-engineer`
    - `backend-development-security-auditor`
    - `backend-development-tdd-orchestrator`
    - `temporal-python-pro`
    - `backend-development-test-automator`
  - Commands:
    - `feature-development` – Orchestrates end-to-end feature development from requirements to deployment.
  - Sub-skills:
    - `api-design-principles`
    - `architecture-patterns`
    - `cqrs-implementation`
    - `event-store-design`
    - `microservices-patterns`
    - `projection-patterns`
    - `saga-orchestration`
    - `temporal-python-testing`
    - `workflow-orchestration-patterns`

### Backend API Security

- **backend-api-security** – API security hardening, authentication implementation, authorization patterns, rate limiting, and input validation.
  - Path: `.agent/skills/backend-api-security`
  - Version: `1.2.1`
  - Agents:
    - `backend-api-security-backend-architect`
    - `backend-api-security-backend-security-coder`

### Code Refactoring

- **code-refactoring** – Code cleanup, refactoring automation, and technical debt management with context restoration.
  - Path: `.agent/skills/code-refactoring`
  - Version: `1.2.1`
  - Agents:
    - `code-refactoring-code-reviewer`
    - `code-refactoring-legacy-modernizer`
  - Commands:
    - `context-restore` – Restores semantic context for safer refactoring.
    - `refactor-clean` – Applies refactor and cleanup patterns.
    - `tech-debt` – Analyzes and remediates technical debt.

### Code Documentation

- **code-documentation** – Documentation generation, code explanation, and technical writing with automated doc generation and tutorial creation.
  - Path: `.agent/skills/code-documentation`
  - Version: `1.2.1`
  - Agents:
    - `code-documentation-code-reviewer`
    - `code-documentation-docs-architect`
    - `code-documentation-tutorial-engineer`
  - Commands:
    - `code-explain` – Explains and analyzes code.
    - `doc-generate` – Generates project or API documentation.

### Database Design

- **database-design** – Database architecture, schema design, and SQL optimization for production systems.
  - Path: `.agent/skills/database-design`
  - Version: `1.2.1`
  - Agents:
    - `database-design-database-architect`
    - `sql-pro`
  - Sub-skills:
    - `postgresql-table-design` – PostgreSQL-specific schema design, indexing, constraints, and performance patterns.

### Debugging Toolkit

- **debugging-toolkit** – Interactive debugging, developer experience optimization, and smart debugging workflows.
  - Path: `.agent/skills/debugging-toolkit`
  - Version: `1.2.1`
  - Agents:
    - `debugging-toolkit-debugger`
    - `debugging-toolkit-dx-optimizer`
  - Commands:
    - `smart-debug` – Runs guided debugging workflows.

### Frontend Design

- **frontend-design** – Creates distinctive, production-grade frontend interfaces with high design quality. Use for web components, pages, dashboards, HTML/CSS layouts, and styling work.
  - Path: `.agent/skills/frontend-design`
  - Focus:
    - UI aesthetic direction
    - Typography, color, motion, spatial composition
    - Avoiding generic AI-generated UI patterns

### JavaScript / TypeScript

- **javascript-typescript** – JavaScript and TypeScript development with ES6+, Node.js, React, and modern web frameworks.
  - Path: `.agent/skills/javascript-typescript`
  - Version: `1.2.3`
  - Agents:
    - `javascript-pro`
    - `typescript-pro`
  - Commands:
    - `typescript-scaffold` – TypeScript project scaffolding.
  - Sub-skills:
    - `javascript-testing-patterns`
    - `modern-javascript-patterns`
    - `nodejs-backend-patterns`
    - `typescript-advanced-types`

### MySQL

- **mysql** – MySQL/InnoDB schema, indexing, query tuning, transactions, migrations, and operations.
  - Path: `.agent/skills/mysql`
  - Use when creating or modifying MySQL tables, indexes, queries, transactions, or diagnosing slow/locking behavior.

### NestJS Expert

- **nestjs-expert** – Creates and configures NestJS modules, controllers, services, DTOs, guards, interceptors, validation, authentication, TypeORM integration, Swagger documentation, and tests.
  - Path: `.agent/skills/nestjs-expert`
  - Version: `1.1.0`
  - Use for NestJS REST APIs, dependency injection, module wiring, guards, interceptors, pipes, and backend tests.

### Screenshot to Code

- **screenshot-to-code** – Converts UI screenshots into working HTML/CSS/React/Vue code.
  - Path: `.agent/skills/screenshot-to-code`
  - Use when the user provides screenshots or visual UI designs and wants an implementation.

### Shadcn-ui

- **shadcn-ui** – shadcn/ui component patterns for Next.js applications, including component customization, composition, forms, data tables, accessibility, and Tailwind integration.
  - Path: `.agent/skills/shadcn-ui`
  - Use when adding or customizing shadcn/ui components, forms, dialogs, sheets, tables, dropdowns, toasts, and other primitives.

### Skill Creator

- **skill-creator** – Creates, evaluates, improves, and optimizes custom Claude skills.
  - Path: `.agent/skills/skill-creator`
  - Agents:
    - `analyzer` – Post-hoc analyzer agent.
    - `comparator` – Blind comparator agent.
    - `grader` – Grader agent.

### TypeORM

- **typeorm** – TypeORM development guidelines for entities, relationships, migrations, TypeScript decorator configuration, and database integration.
  - Path: `.agent/skills/typeorm`
  - Use when adding or reviewing TypeORM entities, repositories, relations, columns, indexes, and migrations.

---

## Alignment with PRD

The **nestjs-expert**, **backend-development**, and **javascript-typescript** skill sets directly support the PRD’s backend requirements for CRUD API endpoints, modular NestJS architecture, validation, pagination, filtering, and role-based access control.

The **typeorm**, **mysql**, and **database-design** skill sets support the PRD’s data-model requirements, including company/user/group/capability entities, relationships, indexes, and production-safe database design.

The **backend-api-security** skill set addresses authentication, authorization, API hardening, input validation, and tenant/company-wise SaaS isolation requirements.

The **frontend-design**, **screenshot-to-code**, **shadcn-ui**, and **javascript-typescript** skills enable implementation of reusable UI components listed in the PRD, including grids, lists, tables, search, filters, pagination, detail pages, forms, dialogs, and dashboards.

The **code-refactoring** and **code-documentation** skill sets help maintain code quality, explain existing modules, generate documentation, and manage technical debt as the ERP codebase grows.

The **debugging-toolkit** and **javascript-testing-patterns** sub-skill provide workflows for troubleshooting, test setup, unit/integration testing, and quality verification.
