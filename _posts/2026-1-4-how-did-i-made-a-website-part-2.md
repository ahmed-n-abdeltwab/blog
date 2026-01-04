---
layout: article
title: "I Built a Coaching platform for my brother, from scratch to deployment part 2"
date: 2026-01-04
modify_date: 2026-01-04
excerpt: "The testing, type-safety, and CI/CD journey — how I built a production-ready coaching platform with comprehensive testing, auto-generated TypeScript contracts, and automated pipelines."
tags:
  [
    "web development",
    "testing",
    "software development",
    "from scratch to deployment",
  ]
key: test-coaching-platform
author: "Compiled by Ahmed Nasser"
---

## Introduction

In Part 1, I shared [how I built the backend for my brother's coaching platform](https://ahmed-n-abdeltwab.github.io/blog/2025/11/16/how-did-i-made-a-website.html) — from database design to NestJS modules to Swagger documentation. But building features is only half the battle. The real engineering challenge? Making sure everything actually works, stays working, and can be deployed reliably.

This part covers the testing infrastructure, the type-safe API contracts system, and the CI/CD pipeline that ties everything together. These aren't just "nice to haves" — they're what separate a hobby project from production-ready software.

The impact? I can now refactor code with confidence, catch bugs before they reach production, and deploy changes automatically. My brother gets a reliable platform, and I get peace of mind.

---

## Testing Infrastructure

The testing setup isn't just "write tests and run them." I built a composable test utilities system that makes writing tests feel like assembling LEGO blocks — each piece does one thing well, and they snap together cleanly.

### The Mixin Architecture: Composable Test Capabilities

The core innovation is a **mixin-based architecture** where each capability (HTTP requests, database operations, authentication, assertions) is a separate, reusable class that can be composed into different test types.

**Why mixins instead of inheritance?**

Traditional inheritance creates rigid hierarchies. If `IntegrationTest` extends `BaseTest`, and you want to add HTTP capabilities, you either:
1. Add HTTP methods to `BaseTest` (polluting unit tests that don't need HTTP)
2. Create `HttpBaseTest` (explosion of base classes)
3. Use multiple inheritance (not supported in TypeScript)

Mixins solve this elegantly. Each test type declares which capabilities it needs:

```typescript
// IntegrationTest composes: HTTP + Database + Auth + Assertions + Factory
export class IntegrationTest<TModuleName extends string = string>
  extends BaseTest
  implements HttpCapable, DatabaseCapable
{
  readonly http: HttpMethodsMixin<TModuleName>;  // Type-safe HTTP requests
  readonly auth: AuthMixin;                       // JWT token creation
  readonly db: DatabaseMixin;                     // Database operations
  readonly assert: AssertionsMixin;               // Common assertions
  readonly factory: FactoryMixin;                 // Mock data generation

  constructor(config: IntegrationTestConfig<TModuleName>) {
    super();
    this.http = new HttpMethodsMixin<TModuleName>(this);
    this.auth = new AuthMixin();
    this.db = new DatabaseMixin(this);
    this.assert = new AssertionsMixin();
    this.factory = new FactoryMixin();
  }
}

// ServiceTest composes: Assertions + Factory (no HTTP, no database)
export class ServiceTest<TService, TMocks> extends BaseTest {
  readonly assert: AssertionsMixin;
  readonly factory: FactoryMixin;
  // No http, no db — unit tests don't need them
}

// ControllerTest composes: HTTP + Auth + Assertions + Factory (no real database)
export class ControllerTest<TController, TMocks, TModuleName>
  extends BaseTest
  implements HttpCapable
{
  readonly http: HttpMethodsMixin<TModuleName>;
  readonly auth: AuthMixin;
  readonly assert: AssertionsMixin;
  readonly factory: FactoryMixin;
  // No db — controllers use mocked services
}
```

The `HttpCapable` and `DatabaseCapable` interfaces define contracts that mixins depend on:

```typescript
// The mixin needs a host that provides these capabilities
export interface HttpCapable {
  readonly application: INestApplication;
  createAuthHeaders(token?: string): Promise<AuthHeaders>;
}

export interface DatabaseCapable {
  readonly database: PrismaService;
}
```

This creates a clean dependency graph: `HttpMethodsMixin` doesn't care if it's attached to `IntegrationTest` or `ControllerTest` — it just needs a host that implements `HttpCapable`.

### Auto-Mocking with Prototype Inspection

One of the most powerful features is **automatic deep mocking**. When you list a service as a provider, it gets fully mocked without any manual setup:

```typescript
// The magic: just list the class, get a fully mocked instance
const test = new ServiceTest({
  service: AccountsService,
  providers: [PrismaService, EmailService],  // Auto-mocked!
});

// Access mocks with full IntelliSense
test.mocks.PrismaService.account.create.mockResolvedValue(mockAccount);
test.mocks.EmailService.sendWelcome.mockResolvedValue(undefined);
```

How does this work? The `createDeepMock` function inspects the class prototype chain and creates jest mocks for every method:

```typescript
export function createDeepMock<T>(classType: Type<T>): DeepMocked<T> {
  const mock: Record<string, jest.Mock> = {};

  // Walk the prototype chain to catch inherited methods
  let proto = classType.prototype;
  while (proto && proto !== Object.prototype) {
    for (const name of Object.getOwnPropertyNames(proto)) {
      if (name === 'constructor') continue;

      const descriptor = Object.getOwnPropertyDescriptor(proto, name);
      // Only mock functions, not getters/setters
      if (descriptor && typeof descriptor.value === 'function') {
        mock[name] = jest.fn();
      }
    }
    proto = Object.getPrototypeOf(proto);
  }

  return mock as DeepMocked<T>;
}
```

The `DeepMocked<T>` type preserves full type information:

```typescript
export type DeepMocked<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R
    ? jest.MockedFunction<(...args: A) => R>  // Methods become mocks
    : T[K] extends object
      ? DeepMocked<T[K]>  // Nested objects are recursively mocked
      : T[K];
} & T;
```

This means `test.mocks.PrismaService.account.create` is typed as `jest.MockedFunction<(data: CreateAccountInput) => Promise<Account>>` — full autocomplete, full type checking.

### The Nullified Type: Bridging TypeScript and Prisma

A subtle but important problem: TypeScript uses `undefined` for optional fields, but Prisma returns `null`. This causes type mismatches when mocking database responses.

The `Nullified<T>` type solves this:

```typescript
// TypeScript interface (optional = undefined)
interface MockAccount {
  id: string;
  bio?: string;  // string | undefined
}

// Prisma returns (optional = null)
// { id: "123", bio: null }

// Nullified converts undefined to null recursively
export type Nullified<T> = T extends (infer U)[]
  ? Nullified<U>[]
  : T extends Date | Decimal
    ? T  // Preserve special types
    : T extends object
      ? {
          [K in keyof T]-?: T[K] extends undefined
            ? Exclude<T[K], undefined> | null
            : Nullified<T[K]>;
        }
      : T;
```

Factories provide both versions:

```typescript
// For unit tests (TypeScript-style)
const user = factory.account.createUser();
// user.bio is string | undefined

// For mocking Prisma responses
const user = factory.account.createUserWithNulls();
// user.bio is string | null — matches what Prisma actually returns
```

This eliminates an entire class of type errors when mocking database operations.


### Type-Safe HTTP Testing with Contract Integration

The HTTP mixin doesn't just make requests — it enforces type safety using the same contracts that power the production API client. This is where the test utilities connect to the type system described in the next section.

```typescript
export class HttpMethodsMixin<TModuleName extends string, E extends Endpoints>
  extends BaseMixin<HttpCapable>
{
  // The return type is automatically inferred from the Endpoints interface
  async request<P extends ExtractPaths<E>, M extends ExtractMethods<P, E>>(
    endpoint: P,
    method: M,
    payload?: RequestType<P, M, E>,
    options?: RequestOptions
  ): Promise<TypedResponse<ExtractResponseType<P, M, E>>> {
    return this.httpClient.request(endpoint, method, payload, options);
  }
}
```

When you call `test.http.authenticatedPost('/api/sessions', token, { body: {...} })`:

1. TypeScript validates that `/api/sessions` exists in `Endpoints`
2. TypeScript validates that `POST` is a valid method for that path
3. TypeScript validates that `body` matches the expected request shape
4. The response is typed as `TypedResponse<SessionResponse>`

If the API changes and the contracts are regenerated, tests that use incorrect types fail at compile time — not at runtime.

---

## Type-Safe API Contracts

The contracts system is the crown jewel of this architecture. It creates a **single source of truth** for API types that flows from Swagger documentation to TypeScript interfaces to both frontend and backend code.

### The Problem: API Type Drift

In a typical project, you have:
- Backend DTOs (NestJS classes with decorators)
- Swagger documentation (generated from DTOs)
- Frontend types (manually written, often outdated)
- Test mocks (manually written, often wrong)

These drift apart over time. The backend adds a field, someone forgets to update the frontend types, and you get runtime errors.

### The Solution: Generated Contracts

The `@contracts` library contains a single auto-generated file that defines every API endpoint:

```typescript
// libs/contracts/src/endpoints.generated.ts
export interface Endpoints {
  '/api/authentication/login': {
    POST: (
      params: undefined | never,
      body: { email: string; password: string }
    ) => {
      accessToken: string;
      refreshToken: string;
      account: {
        id: string;
        email: string;
        role: 'USER' | 'PREMIUM_USER' | 'ADMIN' | 'COACH';
      };
    };
  };

  '/api/accounts/{id}': {
    GET: (params: { id: string }, body: undefined | never) => {
      id: string;
      email: string;
      name: string;
      role: 'USER' | 'PREMIUM_USER' | 'ADMIN' | 'COACH';
      bio: string | null;
      // ... all fields with exact types
    };
    PATCH: (
      params: { id: string },
      body: { name?: string; bio?: string; age?: number }
    ) => { /* same response type */ };
    DELETE: (params: { id: string }, body: undefined | never) => void;
  };
}
```

Key design decisions:

1. **Function signatures, not separate types**: Each endpoint is a function type `(params, body) => response`. This makes extraction trivial with TypeScript's `infer` keyword.

2. **Inlined properties**: Instead of `response: AccountDto`, properties are inlined. This makes the file self-contained — no imports needed.

3. **Literal union types for enums**: `'USER' | 'PREMIUM_USER' | 'ADMIN' | 'COACH'` instead of referencing a Prisma enum. This works in any TypeScript environment.

### The Type Extraction System

The `@api-sdk` library provides utilities to extract types from the `Endpoints` interface:

```typescript
// Extract all valid paths
type AllPaths = ExtractPaths<Endpoints>;
// "/api/accounts" | "/api/accounts/{id}" | "/api/authentication/login" | ...

// Extract methods for a specific path
type AccountMethods = ExtractMethods<'/api/accounts/{id}', Endpoints>;
// "GET" | "PATCH" | "DELETE"

// Extract response type for a specific endpoint
type LoginResponse = ExtractResponseType<'/api/authentication/login', 'POST', Endpoints>;
// { accessToken: string; refreshToken: string; account: {...} }

// Extract request body type
type UpdateAccountBody = ExtractRequestBody<'/api/accounts/{id}', 'PATCH', Endpoints>;
// { name?: string; bio?: string; age?: number }
```

The implementation uses conditional types and `infer`:

```typescript
// Extract the response type from a function signature
export type ExtractResponseType<
  P extends string,
  M extends HttpMethod,
  E extends Record<string, any>
> = NormalizePath<P, E> extends keyof E
  ? E[NormalizePath<P, E>][M] extends (...args: any) => infer R
    ? R
    : never
  : never;
```

### Path Normalization: Flexible API Paths

A nice ergonomic feature: you can use either full paths or short paths:

```typescript
// Both work!
await api.get('/api/accounts');
await api.get('accounts');  // Automatically prefixed with /api/
```

This is implemented with a `NormalizePath` type that handles the conversion:

```typescript
type NormalizePath<P extends string, E> =
  P extends keyof E
    ? P  // Already a valid path
    : `/api/${P}` extends keyof E
      ? `/api/${P}`  // Add prefix
      : never;
```

### The Swagger Parser: From OpenAPI to TypeScript

The generator reads the Swagger JSON (produced by NestJS) and outputs TypeScript:

```typescript
export function generateEndpointsFromSwagger(
  document: OpenAPIObject,
  options: GenerationOptions = {}
): string {
  const routes = extractRoutesFromSwaggerDoc(document);
  return generateCode(routes, document, config);
}
```

The key challenge is **schema resolution**. Swagger uses `$ref` to reference shared schemas:

```json
{
  "responses": {
    "200": {
      "content": {
        "application/json": {
          "schema": { "$ref": "#/components/schemas/AccountResponseDto" }
        }
      }
    }
  }
}
```

The parser resolves these references and inlines the properties:

```typescript
function schemaToTypeScript(
  schema: SchemaObject | ReferenceObject,
  document: OpenAPIObject
): string {
  // Handle $ref - resolve and inline
  if (isReferenceObject(schema)) {
    const resolved = resolveRef(schema, document);
    return schemaToTypeScript(resolved, document);
  }

  // Handle objects with properties
  if (schema.type === 'object' || schema.properties) {
    const properties = Object.entries(schema.properties ?? {}).map(([key, propSchema]) => {
      const propType = schemaToTypeScript(propSchema, document);
      const optional = schema.required?.includes(key) ? '' : '?';
      return `${key}${optional}: ${propType}`;
    });
    return `{ ${properties.join('; ')} }`;
  }

  // Handle arrays
  if (schema.type === 'array' && schema.items) {
    return `${schemaToTypeScript(schema.items, document)}[]`;
  }

  // Handle enums
  if (schema.enum) {
    return schema.enum.map(v => `'${v}'`).join(' | ');
  }

  // Handle primitives
  const typeMap: Record<string, string> = {
    string: 'string',
    integer: 'number',
    number: 'number',
    boolean: 'boolean',
  };
  return typeMap[schema.type ?? 'unknown'] ?? 'unknown';
}
```

### The TypedResponse: Discriminated Unions for Error Handling

API responses can succeed or fail. The `TypedResponse` type uses a discriminated union to make error handling type-safe:

```typescript
export type TypedResponse<T> = SuccessResponse<T> | FailureResponse;

export interface SuccessResponse<T> {
  ok: true;
  status: SuccessStatus;
  body: T;
}

export interface FailureResponse {
  ok: false;
  status: number;
  body: ErrorResponse | ValidationErrorResponse;
}
```

This enables exhaustive checking:

```typescript
const response = await api.get('/api/accounts/123');

if (response.ok) {
  // TypeScript knows: response.body is AccountResponse
  console.log(response.body.email);
} else {
  // TypeScript knows: response.body is ErrorResponse
  console.log(response.body.message);
}
```

No more `response.data?.email` with optional chaining everywhere — the type system tells you exactly what you have.

---

## CI/CD Pipeline

The CI pipeline is designed around one principle: **fail fast, fail clearly**. Quality checks run first (seconds), then builds (minutes), then tests (minutes, parallelized).

### Nx Affected: Only Test What Changed

The most impactful optimization is `nx affected`. Instead of running all tests on every PR, Nx analyzes the dependency graph and only runs tasks for changed projects:

```yaml
# Only lint changed projects
- run: pnpm exec nx affected -t lint

# Only test changed projects
- run: pnpm exec nx affected -t test
```

If you change a file in `libs/contracts`, Nx knows that `apps/api` and `apps/web` depend on it, so it runs tests for all three. If you change a file only in `apps/web`, it only runs web tests.

This cuts CI time from 15+ minutes to 2-3 minutes for most PRs.

### Parallel Test Execution with Matrix Strategy

The three test types (unit, integration, e2e) run in parallel using GitHub Actions matrix:

```yaml
test:
  needs: build
  strategy:
    matrix:
      test-type: [unit, integration, e2e]
  services:
    postgres:
      image: postgres:15
      env:
        POSTGRES_DB: tennis_coach_test_${{ matrix.test-type }}
    redis:
      image: redis:7-alpine
  steps:
    - run: pnpm exec nx run api:test:${{ matrix.test-type }}
```

Each test type gets its own database (`tennis_coach_test_unit`, `tennis_coach_test_integration`, `tennis_coach_test_e2e`), preventing test pollution.

### Dependabot: Automated Security Updates

Dependabot keeps dependencies fresh and secure automatically:

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "sunday"
    open-pull-requests-limit: 10

  - package-ecosystem: "docker"
    directory: "/"
    schedule:
      interval: "weekly"

  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
```

Every Sunday, Dependabot opens PRs for outdated packages. The CI pipeline runs automatically, so I know immediately if an update breaks something.

---

## Project Configuration

Here's how the tooling is configured to keep the codebase consistent and maintainable.

### Nx: Monorepo Task Orchestration

Nx manages the monorepo with intelligent caching and dependency-aware task execution:

```json
// nx.json
{
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["production", "^production"],
      "cache": true
    },
    "test": {
      "inputs": ["default", "^production", "{workspaceRoot}/jest.preset.js"],
      "cache": true
    }
  },
  "namedInputs": {
    "production": [
      "default",
      "!{projectRoot}/**/*.spec.ts",
      "!{projectRoot}/jest.config.ts"
    ]
  }
}
```

**What this gives me:**
- `dependsOn: ["^build"]` — Building `apps/api` automatically builds `libs/contracts` first
- `cache: true` — Unchanged tasks are skipped entirely (locally and in CI)
- `namedInputs.production` — Test files don't invalidate build cache

### TypeScript: Strict Mode Everything

The TypeScript config catches bugs at compile time:

```jsonc
// tsconfig.base.json
{
  "compilerOptions": {
    "target": "ES2023",
    "strict": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,

    "paths": {
      "@contracts": ["libs/contracts/src/index.ts"],
      "@api-sdk": ["libs/api-sdk/src/index.ts"],
      "@api-sdk/testing": ["libs/api-sdk/src/testing.ts"]
    }
  }
}
```

**What this gives me:**
- `strictNullChecks` — No more "undefined is not an object" at runtime
- `noUncheckedIndexedAccess` — `array[0]` returns `T | undefined`, forcing null checks
- `paths` — Clean imports like `import { Endpoints } from '@contracts'`

### Jest: Test Configuration

Jest is configured per-project with a shared preset:

```javascript
// jest.preset.js
module.exports = {
  testEnvironment: 'node',
  transform: { '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }] },
  moduleFileExtensions: ['ts', 'js', 'json'],
  coverageReporters: ['text', 'lcov', 'cobertura'],
};
```

Each app extends this with specific settings:

```javascript
// apps/api/jest.config.ts
export default {
  ...nxPreset,
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  testMatch: ['**/*.spec.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.dto.ts', '!src/**/*.module.ts'],
};
```

**What this gives me:**
- Shared config across all projects
- Coverage excludes DTOs and modules (no logic to test)
- Setup file runs before each test file

### ESLint: Code Quality Rules

ESLint enforces consistency and catches common mistakes:

```javascript
// eslint.config.mjs
export default [
  ...typescriptEslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
      'import/order': ['error', {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc' },
      }],
      '@nx/enforce-module-boundaries': ['error', {
        enforceBuildableLibDependency: true,
      }],
    },
  },
  {
    files: ['**/*.spec.ts'],
    rules: { '@typescript-eslint/no-explicit-any': 'off' },
  },
];
```

**What this gives me:**
- `argsIgnorePattern: '^_'` — Unused params prefixed with `_` don't error
- `import/order` — Consistent import ordering across all files
- `enforce-module-boundaries` — Prevents `apps/api` from importing `apps/web`
- Relaxed rules for test files (mocks often need `any`)

### Prettier: Consistent Formatting

Prettier handles all formatting decisions:

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "avoid"
}
```

**What this gives me:**
- Zero formatting debates in code review
- `printWidth: 100` — Wider than default, better for modern screens
- `arrowParens: "avoid"` — `x => x` instead of `(x) => x`

### Codecov: Coverage Tracking and PR Feedback

Codecov tracks test coverage across the entire monorepo with per-component reporting:

```yaml
# codecov.yml
coverage:
  precision: 2
  round: down
  range: "60...90"

  status:
    project:
      default:
        target: 80%
        threshold: 2%
        if_ci_failed: error
    patch:
      default:
        target: 80%
        threshold: 5%

# Flags for different types
flags:
  unit:
    paths:
      - apps/api/src/
    carryforward: true
  integration:
    paths:
      - apps/api/src/
    carryforward: true
  e2e:
    paths:
      - apps/api/src/
    carryforward: true

# Per-app coverage tracking
component_management:
  default_rules:
    statuses:
      - type: project
        target: 80%
      - type: patch
        target: 80%
  individual_components:
    - component_id: api
      name: API Backend
      paths:
        - apps/api/src/**
    - component_id: web
      name: Web Frontend
      paths:
        - apps/web/src/**
    - component_id: libs
      name: Shared Libraries
      paths:
        - libs/**

# Ignore test files, configs, and generated code
ignore:
  - "**/*.spec.ts"
  - "**/*.test.ts"
  - "**/test/**"
  - "**/*.config.ts"
  - "**/migrations/**"
  - "**/*.module.ts"
  - "**/main.ts"
```

**What this gives me:**
- `target: 80%` — PRs fail if coverage drops below threshold
- `flags` — Separate coverage for unit, integration, and e2e tests with `carryforward` so partial test runs don't reset coverage
- `component_management` — Each app (API, Web, libs) has its own coverage target, visible in PR comments
- `ignore` — Test files, configs, and modules don't count against coverage (no logic to test)

Every PR gets a detailed coverage comment showing which files changed, what's covered, and what's not.

### Husky + Commitlint: Git Hooks for Quality Gates

Git hooks enforce quality before code even reaches CI. Husky manages the hooks, and commitlint enforces conventional commits.

```bash
# .husky/pre-commit
pnpm lint-staged

# Auto-regenerate API types when API files change
if git diff --cached --name-only | grep -q "^apps/api/src/"; then
  echo "🔄 API files changed, regenerating endpoint types..."
  pnpm nx run api:generate-types
  git add libs/contracts/src/endpoints.generated.ts apps/api/swagger.json
fi
```

```bash
# .husky/commit-msg
pnpm commitlint --edit $1
```

The pre-commit hook does two things:
1. **lint-staged** — Runs ESLint and Prettier only on staged files (fast)
2. **Auto-regenerate types** — If any API file changed, regenerate the TypeScript contracts and stage them automatically

This is the magic that keeps the type contracts in sync. Change a DTO, and the generated `endpoints.generated.ts` updates automatically in the same commit.

Commitlint enforces conventional commit format:

```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat',     // A new feature
      'fix',      // A bug fix
      'docs',     // Documentation only changes
   // Changes that do not affect the meaning of the code
      'refactor', // A code change that neither fixes a bug nor adds a feature
      'perf',     // A code change that improves performance
      'test',     // Adding missing tests or correcting existing tests
      'chore',    // Changes to the build process or auxiliary tools
      'ci',       // Changes to CI configuration files and scripts
      'build',    // Changes that affect the build system
      'revert',   // Reverts a previous commit
    ]],
    'type-case': [2, 'always', 'lower-case'],
    'subject-empty': [2, 'never'],
    'header-max-length': [2, 'always', 100],
    'body-max-line-length': [2, 'always', 100],
  },
};
```

**What this gives me:**
- `feat: add session booking` ✅
- `Added session booking` ❌ (rejected before commit)
- Consistent commit history that can be parsed for changelogs
- `header-max-length: 100` — Forces concise commit messages

---

## Docker: Containerized Deployment

### Multi-Stage Builds for Minimal Images

The API Dockerfile uses multi-stage builds to keep the production image small:

```dockerfile
# Dockerfile.api
FROM node:22-alpine AS base

# Stage 1: Install dependencies
FROM base AS deps
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# Stage 2: Build the application
FROM base AS builder
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build:api
RUN cd apps/api && npx prisma generate

# Stage 3: Production image (only what's needed to run)
FROM base AS runner
RUN adduser --system --uid 1001 nestjs
COPY --from=builder --chown=nestjs:nodejs /app/dist/apps/api ./
COPY --from=deps --chown=nestjs:nodejs /app/node_modules ./node_modules

USER nestjs
EXPOSE 3333
CMD ["node", "main.js"]
```

**What this gives me:**
- Final image has no dev dependencies, no source code, no build tools
- Non-root user (`nestjs`) for security
- Image size ~200MB instead of ~1GB

### Docker Compose for Local Development

Docker Compose spins up the full stack with one command:

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:15-alpine
    profiles: ["dev", "prod"]
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-password}
      POSTGRES_DB: ${POSTGRES_DB:-tennis_coach_dev}
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      retries: 15

  redis:
    image: redis:7-alpine
    profiles: ["dev", "prod"]
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]

  mailhog:
    image: mailhog/mailhog
    profiles: ["dev"]
    ports:
      - "1025:1025"   # SMTP
      - "8025:8025"   # Web UI
```

**What this gives me:**
- `profiles` — `docker compose --profile dev up` includes mailhog, `--profile prod` doesn't
- `healthcheck` — Services wait until actually ready, not just started
- Environment variables with defaults — Works out of the box, customizable via `.env`

```bash
# One command to start everything
pnpm docker:dev

# Or manually
docker compose --profile dev up -d
```

---

## See You Again

This part covered the engineering infrastructure that makes the coaching platform production-ready:

- **Mixin Architecture**: Composable test capabilities that snap together like LEGO blocks
- **Auto-Mocking**: Prototype inspection creates fully-typed mocks automatically
- **Type Contracts**: Single source of truth flowing from Swagger to TypeScript to tests
- **Discriminated Unions**: Type-safe error handling with exhaustive checking
- **Nx Affected**: Only test what changed, cutting CI time by 80%
- **Strict TypeScript**: Catch bugs at compile time, not runtime
- **Codecov**: Per-component coverage tracking with PR feedback
- **Husky + Commitlint**: Git hooks that auto-regenerate type contracts and enforce conventional commits
- **Docker Multi-Stage**: Production images under 200MB

The platform is now deployed and my brother is using it to manage his coaching sessions. The type-safe API contracts mean I can refactor with confidence, and the CI pipeline catches issues before they reach production.

Next up: deploying the backend to production — Kubernetes, cloud infrastructure, and making it all work reliably.

See you next time.

