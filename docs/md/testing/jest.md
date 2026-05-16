# Jest Testing with TypeScript

Complete guide to testing TypeScript code with Jest — unit tests, integration tests, mocking, and coverage.

---

## Setup

```bash
npm install --save-dev jest ts-jest @types/jest
```

### jest.config.ts
```typescript
import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.ts", "**/*.spec.ts", "**/*.test.ts"],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "tsconfig.json" }],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@services/(.*)$": "<rootDir>/src/services/$1",
  },
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/**/index.ts",
    "!src/**/*.spec.ts",
  ],
  coverageThresholds: {
    global: { branches: 80, functions: 80, lines: 80, statements: 80 },
  },
  setupFilesAfterEach: ["<rootDir>/src/test/setup.ts"],
};

export default config;
```

### package.json scripts
```json
{
  "scripts": {
    "test":            "jest",
    "test:watch":      "jest --watch",
    "test:coverage":   "jest --coverage",
    "test:ci":         "jest --ci --coverage --forceExit"
  }
}
```

---

## Unit Testing

### Testing a Pure Function

```typescript
// src/utils/math.ts
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}
```

```typescript
// src/utils/__tests__/math.test.ts
import { clamp, formatCurrency } from "../math";

describe("clamp", () => {
  it("returns the value when within range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it("returns min when value is below range", () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it("returns max when value is above range", () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it("handles equal min and max", () => {
    expect(clamp(5, 7, 7)).toBe(7);
  });
});

describe("formatCurrency", () => {
  it("formats USD by default", () => {
    expect(formatCurrency(1234.56)).toBe("$1,234.56");
  });

  it("formats EUR currency", () => {
    expect(formatCurrency(1000, "EUR")).toContain("1,000");
  });
});
```

---

### Testing a Class

```typescript
// src/services/__tests__/user.service.test.ts
import { UserService } from "../user.service";
import { UserRepository } from "../../repositories/user.repository";
import { AppError } from "../../middleware/error.middleware";

// Mock the entire module
jest.mock("../../repositories/user.repository");

const MockUserRepository = UserRepository as jest.MockedClass<typeof UserRepository>;

describe("UserService", () => {
  let service: UserService;
  let mockRepo: jest.Mocked<UserRepository>;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Create a fresh mock instance
    mockRepo = new MockUserRepository() as jest.Mocked<UserRepository>;
    service = new UserService(mockRepo);
  });

  describe("findById", () => {
    it("returns sanitized user when found", async () => {
      const rawUser = {
        id: "1",
        name: "Alice",
        email: "alice@example.com",
        password: "hashed",
        role: "user" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepo.findOne.mockResolvedValueOnce(rawUser);

      const user = await service.findById("1");

      expect(user).not.toBeNull();
      expect(user!.name).toBe("Alice");
      expect(user).not.toHaveProperty("password"); // sanitized
      expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { id: "1" } });
    });

    it("returns null when user not found", async () => {
      mockRepo.findOne.mockResolvedValueOnce(null);
      const user = await service.findById("999");
      expect(user).toBeNull();
    });
  });

  describe("create", () => {
    it("throws 409 if email already exists", async () => {
      mockRepo.findOne.mockResolvedValueOnce({ id: "1", email: "a@b.com" } as any);

      await expect(
        service.create({ name: "Bob", email: "a@b.com", password: "pass123!" })
      ).rejects.toThrow(AppError);

      await expect(
        service.create({ name: "Bob", email: "a@b.com", password: "pass123!" })
      ).rejects.toMatchObject({ statusCode: 409 });
    });

    it("hashes the password before saving", async () => {
      mockRepo.findOne.mockResolvedValueOnce(null);
      mockRepo.create.mockResolvedValueOnce({
        id: "2",
        name: "Carol",
        email: "carol@example.com",
        password: "$2b$...",
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await service.create({ name: "Carol", email: "carol@example.com", password: "mypassword" });

      const savedData = mockRepo.create.mock.calls[0][0];
      expect(savedData.password).not.toBe("mypassword");
      expect(savedData.password).toMatch(/^\$2[aby]\$/); // bcrypt hash
    });
  });
});
```

---

## Mocking

### Manual Mocks

```typescript
// Inline mock
const mockEmailService = {
  sendWelcome: jest.fn().mockResolvedValue(undefined),
  sendPasswordReset: jest.fn().mockResolvedValue(undefined),
};

// Spy on a method
const spy = jest.spyOn(UserService.prototype, "findById");
spy.mockResolvedValueOnce({ id: "1", name: "Alice" } as any);
```

### Mock with Types

```typescript
import type { UserRepository } from "../../repositories/user.repository";

// Fully typed mock — all methods are jest.fn()
function createMockRepo(): jest.Mocked<UserRepository> {
  return {
    findOne:       jest.fn(),
    findAndCount:  jest.fn(),
    create:        jest.fn(),
    update:        jest.fn(),
    delete:        jest.fn(),
  } as unknown as jest.Mocked<UserRepository>;
}
```

### Mocking Modules

```typescript
// Mock entire module
jest.mock("bcryptjs", () => ({
  hash:    jest.fn().mockResolvedValue("$2b$12$hashed"),
  compare: jest.fn().mockResolvedValue(true),
}));

// Mock with factory for complex setups
jest.mock("../../config", () => ({
  config: {
    port: 3000,
    jwtSecret: "test-secret",
    nodeEnv: "test",
  },
}));

// Partial mock — keep some real implementations
jest.mock("../../utils/logger", () => ({
  ...jest.requireActual("../../utils/logger"),
  error: jest.fn(), // Override only error
}));
```

---

## Integration Tests

```typescript
// src/__tests__/user.routes.test.ts
import request from "supertest"; // npm i -D supertest @types/supertest
import { createApp } from "../../app";
import { prisma } from "../../database"; // your ORM client

const app = createApp();

describe("User Routes — Integration", () => {
  let authToken: string;

  beforeAll(async () => {
    // Seed test data
    await prisma.user.create({
      data: { name: "Admin", email: "admin@test.com", password: "hashed", role: "admin" },
    });

    // Login and get token
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "admin@test.com", password: "plaintext" });

    authToken = res.body.data.accessToken;
  });

  afterAll(async () => {
    // Clean up
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe("GET /api/v1/users", () => {
    it("returns paginated users", async () => {
      const res = await request(app)
        .get("/api/v1/users")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(res.body).toMatchObject({
        data: expect.arrayContaining([
          expect.objectContaining({ name: expect.any(String) }),
        ]),
        pagination: expect.objectContaining({
          page: expect.any(Number),
          total: expect.any(Number),
        }),
      });
    });

    it("returns 401 without token", async () => {
      await request(app).get("/api/v1/users").expect(401);
    });
  });

  describe("POST /api/v1/users", () => {
    it("creates a user and returns 201", async () => {
      const res = await request(app)
        .post("/api/v1/users")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ name: "New User", email: "new@test.com", password: "Password1!" })
        .expect(201);

      expect(res.body.data).toMatchObject({
        name: "New User",
        email: "new@test.com",
      });
      expect(res.body.data).not.toHaveProperty("password");
    });

    it("returns 400 for invalid data", async () => {
      const res = await request(app)
        .post("/api/v1/users")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ name: "X", email: "not-an-email" })
        .expect(400);

      expect(res.body.error).toBe("Validation failed");
      expect(res.body.details).toBeInstanceOf(Array);
    });
  });
});
```

---

## Custom Matchers

```typescript
// src/test/matchers.ts
expect.extend({
  toBeValidEmail(received: string) {
    const pass = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(received);
    return {
      pass,
      message: () => pass
        ? `Expected ${received} NOT to be a valid email`
        : `Expected ${received} to be a valid email`,
    };
  },

  toHaveStatusCode(received: Response, expected: number) {
    const pass = received.status === expected;
    return {
      pass,
      message: () => `Expected status ${expected}, got ${received.status}`,
    };
  },
});

// Type augmentation for custom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidEmail(): R;
      toHaveStatusCode(code: number): R;
    }
  }
}
```

---

## Test Coverage

```bash
# Run with coverage
npm run test:coverage

# Output
# ------------------|---------|----------|---------|---------|
# File              | % Stmts | % Branch | % Funcs | % Lines |
# ------------------|---------|----------|---------|---------|
# services/         |   94.3  |   88.7   |   100   |   94.1  |
#  user.service.ts  |   94.3  |   88.7   |   100   |   94.1  |
# controllers/      |   98.1  |   91.2   |   100   |   98.0  |
# ------------------|---------|----------|---------|---------|
```

> :ToCPrevNext
