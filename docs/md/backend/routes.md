# Express Routes with TypeScript

Build fully type-safe Express routes with proper request/response typing, validation, and error handling.

---

## Setup

```bash
npm install express
npm install --save-dev @types/express typescript ts-node
```

---

## Basic Typed Route

```typescript
// src/routes/user.routes.ts
import { Router, Request, Response, NextFunction } from "express";

const router = Router();

// GET /users
router.get("/", async (req: Request, res: Response) => {
  const users = await UserService.findAll();
  res.json({ data: users, status: 200 });
});

// GET /users/:id
router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params; // string
  const user = await UserService.findById(id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json({ data: user });
});

export default router;
```

---

## Typed Request Params, Body, Query

```typescript
import { Request, Response } from "express";

// Type-safe request shapes
interface CreateUserBody {
  name: string;
  email: string;
  password: string;
  role?: "admin" | "user";
}

interface UserParams {
  id: string;
}

interface UserQuery {
  page?: string;
  limit?: string;
  search?: string;
}

// TypeScript knows exact types for each part of the request
router.post(
  "/",
  async (
    req: Request<{}, {}, CreateUserBody>,   // params, response, body
    res: Response
  ) => {
    const { name, email, password, role = "user" } = req.body;

    // TypeScript knows: name is string, role is "admin" | "user" | undefined
    const user = await UserService.create({ name, email, password, role });
    res.status(201).json({ data: user });
  }
);

router.get(
  "/",
  async (
    req: Request<{}, {}, {}, UserQuery>,    // 4th generic = query
    res: Response
  ) => {
    const page = parseInt(req.query.page ?? "1", 10);
    const limit = parseInt(req.query.limit ?? "20", 10);
    const search = req.query.search;

    const result = await UserService.findAll({ page, limit, search });
    res.json(result);
  }
);
```

---

## Middleware

```typescript
// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from "express";

// Extend Request with custom fields
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      requestId?: string;
    }
  }
}

interface JwtPayload {
  id: string;
  email: string;
  role: "admin" | "user";
}

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    res.status(401).json({ error: "No token provided" });
    return;
  }

  try {
    const payload = verifyToken(token) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthenticated" });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: "Insufficient permissions" });
      return;
    }

    next();
  };
}

// Attach unique request ID
export function requestId(req: Request, res: Response, next: NextFunction): void {
  req.requestId = crypto.randomUUID();
  res.setHeader("X-Request-ID", req.requestId);
  next();
}
```

---

## Validation Middleware

```typescript
// src/middleware/validate.middleware.ts
import { Request, Response, NextFunction } from "express";
import { z, ZodSchema } from "zod";

export function validate<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      res.status(400).json({ error: "Validation failed", details: errors });
      return;
    }

    req.body = result.data; // replace with parsed & typed data
    next();
  };
}

// Usage with Zod schemas
const CreateUserSchema = z.object({
  name:     z.string().min(2).max(100),
  email:    z.string().email(),
  password: z.string().min(8),
  role:     z.enum(["admin", "user"]).optional().default("user"),
});

router.post("/users", validate(CreateUserSchema), async (req, res) => {
  const user = await UserService.create(req.body);
  res.status(201).json({ data: user });
});
```

---

## Error Handling

```typescript
// src/middleware/error.middleware.ts
import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true,
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message);
  }
}

// Global error handler — MUST have 4 params
export function errorHandler(
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction,   // Must include even if unused
): void {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: error.message,
      ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    });
    return;
  }

  console.error("Unhandled error:", error);
  res.status(500).json({ error: "Internal server error" });
}

// Async error wrapper — catches async errors and passes to next()
export function asyncHandler<P, ResBody, ReqBody, ReqQuery>(
  fn: (req: Request<P, ResBody, ReqBody, ReqQuery>, res: Response, next: NextFunction) => Promise<void>
) {
  return (
    req: Request<P, ResBody, ReqBody, ReqQuery>,
    res: Response,
    next: NextFunction
  ) => {
    fn(req, res, next).catch(next);
  };
}
```

---

## Complete Router Example

```typescript
// src/routes/user.routes.ts
import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { asyncHandler } from "../middleware/error.middleware";
import { UserController } from "../controllers/user.controller";
import { CreateUserSchema, UpdateUserSchema } from "../schemas/user.schema";

const router = Router();
const controller = new UserController();

router.get(    "/",     authenticate, asyncHandler(controller.getAll));
router.get(    "/:id",  authenticate, asyncHandler(controller.getOne));
router.post(   "/",     authenticate, authorize("admin"), validate(CreateUserSchema), asyncHandler(controller.create));
router.put(    "/:id",  authenticate, validate(UpdateUserSchema), asyncHandler(controller.update));
router.delete( "/:id",  authenticate, authorize("admin"), asyncHandler(controller.delete));

export default router;
```

> :ToCPrevNext
