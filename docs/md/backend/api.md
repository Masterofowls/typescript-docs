# REST API with TypeScript

Build a complete, production-ready REST API using TypeScript, Express, and best practices.

---

## Project Structure

```
src/
├── index.ts              # Entry point
├── app.ts                # Express app factory
├── config.ts             # Environment configuration
├── controllers/          # Route handlers
│   └── user.controller.ts
├── services/             # Business logic
│   └── user.service.ts
├── repositories/         # Data access layer
│   └── user.repository.ts
├── models/               # Data models/schemas
│   └── user.model.ts
├── middleware/           # Express middleware
│   ├── auth.middleware.ts
│   ├── validate.middleware.ts
│   └── error.middleware.ts
├── routes/               # Route definitions
│   ├── index.ts
│   └── user.routes.ts
├── schemas/              # Zod validation schemas
│   └── user.schema.ts
└── types/                # Shared TypeScript types
    └── index.ts
```

---

## app.ts — Express App Factory

```typescript
// src/app.ts
import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { json, urlencoded } from "express";
import routes from "./routes";
import { errorHandler, notFound } from "./middleware/error.middleware";
import { requestId, requestLogger } from "./middleware/logging.middleware";

export function createApp(): Express {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(cors({ origin: process.env.CORS_ORIGIN ?? "*" }));

  // Body parsing
  app.use(json({ limit: "10mb" }));
  app.use(urlencoded({ extended: true }));

  // Compression
  app.use(compression());

  // Logging & tracing
  app.use(requestId);
  app.use(requestLogger);

  // Health check
  app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // API routes
  app.use("/api/v1", routes);

  // 404 handler
  app.use(notFound);

  // Global error handler (MUST be last)
  app.use(errorHandler);

  return app;
}
```

---

## Controller Layer

```typescript
// src/controllers/user.controller.ts
import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.service";
import { NotFoundError } from "../middleware/error.middleware";
import type { CreateUserDto, UpdateUserDto, UserQuery } from "../types";

export class UserController {
  constructor(private userService = new UserService()) {}

  getAll = async (
    req: Request<{}, {}, {}, UserQuery>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { page = "1", limit = "20", search, role } = req.query;
    const result = await this.userService.findAll({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      search,
      role,
    });
    res.json(result);
  };

  getOne = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const user = await this.userService.findById(req.params.id);
    if (!user) throw new NotFoundError("User");
    res.json({ data: user });
  };

  create = async (
    req: Request<{}, {}, CreateUserDto>,
    res: Response,
  ): Promise<void> => {
    const user = await this.userService.create(req.body);
    res.status(201).json({ data: user });
  };

  update = async (
    req: Request<{ id: string }, {}, UpdateUserDto>,
    res: Response,
  ): Promise<void> => {
    const user = await this.userService.update(req.params.id, req.body);
    if (!user) throw new NotFoundError("User");
    res.json({ data: user });
  };

  delete = async (
    req: Request<{ id: string }>,
    res: Response,
  ): Promise<void> => {
    await this.userService.delete(req.params.id);
    res.status(204).send();
  };
}
```

---

## Service Layer

```typescript
// src/services/user.service.ts
import bcrypt from "bcryptjs";
import { UserRepository } from "../repositories/user.repository";
import { AppError } from "../middleware/error.middleware";
import type {
  User, CreateUserDto, UpdateUserDto,
  PaginatedResult, UserQuery
} from "../types";

export class UserService {
  constructor(private userRepo = new UserRepository()) {}

  async findAll(query: UserQuery): Promise<PaginatedResult<User>> {
    const { page = 1, limit = 20, search, role } = query;
    const offset = (page - 1) * limit;

    const [users, total] = await this.userRepo.findAndCount({
      offset,
      limit,
      where: { search, role },
    });

    return {
      data: users.map(this.sanitize),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.userRepo.findOne({ where: { id } });
    return user ? this.sanitize(user) : null;
  }

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new AppError(409, "Email already registered");

    const hashed = await bcrypt.hash(dto.password, 12);
    const user = await this.userRepo.create({ ...dto, password: hashed });
    return this.sanitize(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<User | null> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) return null;

    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 12);
    }

    const updated = await this.userRepo.update(id, dto);
    return updated ? this.sanitize(updated) : null;
  }

  async delete(id: string): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new AppError(404, "User not found");
    await this.userRepo.delete(id);
  }

  // Remove sensitive fields before returning
  private sanitize(user: any): User {
    const { password, __v, ...safe } = user;
    return safe;
  }
}
```

---

## Shared Types

```typescript
// src/types/index.ts

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role?: "admin" | "user";
}

export type UpdateUserDto = Partial<Omit<CreateUserDto, "password">> & {
  password?: string;
};

export interface UserQuery {
  page?: string;
  limit?: string;
  search?: string;
  role?: "admin" | "user";
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
}
```

---

## Environment Config

```typescript
// src/config.ts
import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV:    z.enum(["development", "test", "production"]).default("development"),
  PORT:        z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET:  z.string().min(32),
  JWT_EXPIRES: z.string().default("7d"),
  CORS_ORIGIN: z.string().default("*"),
});

// Parse and validate environment — throws on invalid
const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.format());
  process.exit(1);
}

export const config = parsed.data;
export type Config = z.infer<typeof EnvSchema>;
```

> :ToCPrevNext
