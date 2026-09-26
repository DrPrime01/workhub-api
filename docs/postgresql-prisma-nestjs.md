# PostgreSQL + Prisma ORM in a NestJS App

A reference for what these tools are, how they fit together, and how to set them up from scratch. Written against **Prisma 7**, **NestJS 12**, and an **ESM** TypeScript project (`"type": "module"`).

---

## 1. What each piece is

### PostgreSQL: the database
PostgreSQL (often called "Postgres") is a relational database server. It **stores your data** in tables made of rows and columns, enforces rules on it (types, unique constraints, foreign keys), and answers SQL queries. It runs as a separate process, either on your machine (e.g. via Homebrew or Docker) or hosted in the cloud (e.g. Prisma Postgres, Neon, Supabase, RDS). Your app never "contains" the database. It connects to it over the network.

### Prisma ORM: the bridge between your code and the database
An ORM (Object-Relational Mapper) lets you work with database rows as typed objects in your programming language instead of writing raw SQL strings. Prisma has three parts:

| Part | What it does |
|---|---|
| **Prisma schema** (`prisma/schema.prisma`) | The single source of truth for your data model. You describe your tables as `model`s. |
| **Prisma Migrate** (the `prisma` CLI) | Compares your schema to the database and generates and applies SQL migration files, so the database structure matches your models. |
| **Prisma Client** (`@prisma/client` + generated code) | A fully typed query builder generated *from your schema*. You call `prisma.user.findMany()` and get autocompletion and type safety. |

### NestJS: the application framework
NestJS organizes your backend into **modules**, **controllers** (HTTP routes) and **providers/services** (business logic), wired together with **dependency injection (DI)**. Prisma plugs into Nest as an ordinary injectable service.

---

## 2. How they connect

```
 HTTP request
      │
      ▼
┌─────────────────┐   injects    ┌──────────────────┐
│  Controller     │─────────────▶│  UsersService    │
└─────────────────┘              └────────┬─────────┘
                                          │ injects
                                          ▼
                                 ┌──────────────────┐
                                 │  PrismaService   │  extends the generated PrismaClient
                                 │  (typed queries) │
                                 └────────┬─────────┘
                                          │ uses
                                          ▼
                                 ┌──────────────────┐
                                 │ @prisma/adapter-pg│  driver adapter (wraps `pg`)
                                 └────────┬─────────┘
                                          │ TCP connection using DATABASE_URL
                                          ▼
                                 ┌──────────────────┐
                                 │   PostgreSQL     │
                                 └──────────────────┘
```

The chain in words:

1. **`DATABASE_URL`** (in `.env`) says *where* Postgres is and how to log in.
2. **`prisma.config.ts`** tells the Prisma **CLI** where the schema and migrations live and which database URL to use for migrations.
3. **`schema.prisma`** describes the models. `prisma migrate dev` turns changes into SQL and applies them to Postgres. `prisma generate` produces the typed client.
4. At runtime, **`PrismaService`** (your own class extending the generated `PrismaClient`) opens a connection through the **`pg` driver adapter**.
5. Nest **injects `PrismaService`** into your services, which run queries and return results to controllers.

> **Prisma 7 notes:** The Prisma client no longer includes its own database engine. You must pass a *driver adapter* (`@prisma/adapter-pg` for Postgres). Prisma also no longer loads `.env` by itself, so you load it with `dotenv`.

---

## 3. What they do inside the NestJS app

- **PostgreSQL** holds the persistent state: users, workspaces, tasks, and so on. It survives app restarts and deployments.
- **Prisma Client** is the *only* way your Nest code talks to that data. It replaces hand-written SQL with typed calls such as `create`, `findUnique`, `update`, `delete` and `$transaction`.
- **PrismaService** makes the client a Nest provider. That means:
  - it is created **once** (a singleton, so one connection pool for the whole app),
  - it connects when the module starts (`onModuleInit`) and disconnects on shutdown (`onModuleDestroy`),
  - any service can receive it through its constructor.
- **PrismaModule** (marked `@Global()`) exports `PrismaService` so every feature module can use it without importing the module again.
- **Migrations** (`prisma/migrations/*`) are committed to git so every environment (your laptop, CI, production) ends up with the same table structure.

---

## 4. Setup, step by step

### 4.1 Install packages

```bash
# runtime
pnpm add @prisma/client @prisma/adapter-pg dotenv

# development only
pnpm add -D prisma @types/pg tsx
```

| Package | Why |
|---|---|
| `@prisma/client` | Runtime library the generated client depends on |
| `@prisma/adapter-pg` | Postgres driver adapter (brings in `pg`) |
| `dotenv` | Loads `.env` into `process.env`. This is a **runtime** dependency because `main.ts` imports it. |
| `prisma` | The CLI (`migrate`, `generate`, `studio`, …), needed only in development |

### 4.2 Get a PostgreSQL database

Pick one:

- **Local (Homebrew, macOS)**
  ```bash
  brew install postgresql@15
  brew services start postgresql@15
  createdb workhub
  # URL: postgresql://<mac-username>@localhost:5432/workhub?schema=public
  ```
- **Local (Docker)**
  ```bash
  docker run -d --name pg -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:16
  # URL: postgresql://postgres:postgres@localhost:5432/postgres?schema=public
  ```
- **Hosted**, e.g. Prisma Postgres, Neon, Supabase: copy the connection string they give you. Use `sslmode=verify-full` in the URL.

### 4.3 Environment variables

`.env` (git-ignored, never commit it):
```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DBNAME?schema=public"
```

`.env.example` (committed, placeholder values only):
```
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/workhub?schema=public"
```

> Put the URL in `.env`, not in your shell profile (`~/.zshrc`). `dotenv` never overrides an existing shell variable, so a value exported in the shell silently wins over `.env` and leaks into every other project.

### 4.4 `prisma.config.ts` (project root)

```ts
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: env('DATABASE_URL') },
});
```

The function is `defineConfig`. The paths are relative to the project root.

### 4.5 `prisma/schema.prisma`

```prisma
generator client {
  provider            = "prisma-client"
  output              = "../src/generated/prisma"   // relative to THIS file
  moduleFormat        = "esm"                        // project is "type": "module"
  importFileExtension = "js"                         // matches nodenext imports
}

datasource db {
  provider = "postgresql"
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
}
```

Add the generated folder to `.gitignore`, because it is rebuilt from the schema:
```
/src/generated/prisma
*.tsbuildinfo
```

> Keep `prisma/` at the **project root**. If you move the schema, `output` (relative to the schema file) and the paths in `prisma.config.ts` must all change together.

### 4.6 Create tables and generate the client

```bash
pnpm prisma migrate dev --name init   # writes SQL to prisma/migrations and applies it
pnpm prisma generate                  # (re)builds src/generated/prisma
```

### 4.7 `src/prisma/prisma.service.ts`

```ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
    });
  }
  async onModuleInit() {
    await this.$connect();
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

### 4.8 `src/prisma/prisma.module.ts`

```ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';

@Global()
@Module({ providers: [PrismaService], exports: [PrismaService] })
export class PrismaModule {}
```

### 4.9 Register it and load `.env`

`src/app.module.ts`:
```ts
import { PrismaModule } from './prisma/prisma.module.js';

@Module({
  imports: [PrismaModule /*, ...other modules */],
})
export class AppModule {}
```

`src/main.ts` needs this as its **first line**, so `DATABASE_URL` is set before anything reads it:
```ts
import 'dotenv/config';
```

(The alternative is `@nestjs/config` with `ConfigModule.forRoot()`.)

### 4.10 Use it in a feature service

```ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  create(email: string, name?: string) {
    return this.prisma.user.create({ data: { email, name } });
  }

  findAll() {
    return this.prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }
}
```

---

## 5. Everyday workflow

| When you… | Run |
|---|---|
| Change `schema.prisma` in development | `pnpm prisma migrate dev --name <what-changed>` |
| Only need fresh types (e.g. after cloning) | `pnpm prisma generate` |
| Check the schema is valid | `pnpm prisma validate` |
| See whether the DB is behind the migrations | `pnpm prisma migrate status` |
| Deploy to production / CI | `pnpm prisma migrate deploy` (applies migrations only, never creates them) |
| Browse data in a GUI | `pnpm prisma studio` |
| Wipe the dev DB and reapply everything | `pnpm prisma migrate reset` (**destroys data**) |

Commit `schema.prisma` **and** `prisma/migrations/` together.

---

## 6. Verification checklist

- [ ] `pnpm prisma validate` prints "schema … is valid"
- [ ] `pnpm prisma migrate status` prints "Database schema is up to date!"
- [ ] `pnpm build` succeeds
- [ ] `pnpm start:dev` logs `PrismaModule dependencies initialized` and `Nest application successfully started`

---

## 7. Pitfalls we hit (and fixes)

| Symptom | Cause | Fix |
|---|---|---|
| `definePrismaConfig is not a function` | Wrong import name | Use `defineConfig` from `prisma/config` |
| `Could not load schema from …/prisma/schema.prisma` | Schema folder moved but config not updated | Keep `prisma/` at the root, or update `prisma.config.ts` paths **and** the generator `output` |
| `process.env.DATABASE_URL` is `undefined` at runtime | Only the CLI loads `.env` (via the config file) | `import 'dotenv/config'` first in `main.ts` |
| `Nest can't resolve dependencies … PrismaService` | `PrismaModule` not imported | Add it to `AppModule.imports` |
| App crashes after `pnpm install --prod` | `dotenv` in `devDependencies` | Move it to `dependencies` |
| `pg` warning about `sslmode=require` | Its meaning will change in future `pg` versions | Use `sslmode=verify-full` |
| Editing `.env` seems to do nothing | Same variable also exported in the shell, and the shell wins | Remove it from `~/.zshrc`, then `unset DATABASE_URL` |
| `Unknown command "skills"` in `postinstall` | Leftover script from AI-tooling setup | Delete the `postinstall` script |
