# Interfaces

Interfaces define **contracts** — they describe the shape an object must conform to. Mastering interfaces is essential for writing maintainable TypeScript.

---

## Basic Interface

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

// Object must match the interface exactly
const alice: User = {
  id: 1,
  name: "Alice",
  email: "alice@example.com",
};
```

---

## Optional Properties

```typescript
interface Config {
  host: string;
  port: number;
  timeout?: number;   // Optional — may be undefined
  retries?: number;
}

const cfg: Config = { host: "localhost", port: 3000 };
// timeout and retries are not required
```

---

## Readonly Properties

```typescript
interface Point {
  readonly x: number;
  readonly y: number;
}

const p: Point = { x: 10, y: 20 };
// p.x = 5; // Error: Cannot assign to 'x' because it is a read-only property
```

---

## Index Signatures

When you don't know all property names ahead of time:

```typescript
interface StringMap {
  [key: string]: string;
}

interface NumberMap {
  [key: string]: number;
}

const headers: StringMap = {
  "Content-Type": "application/json",
  Authorization: "Bearer abc123",
};

// Mixed: known + dynamic
interface Settings {
  id: number;                  // Known property
  [key: string]: unknown;      // Any other key
}
```

---

## Method Signatures

```typescript
interface Logger {
  log(message: string): void;
  warn(message: string): void;
  error(message: string, error?: Error): void;
}

// Method shorthand vs property function
interface Formatter {
  format(value: unknown): string;  // Method signature
  transform: (value: string) => string; // Property with function type
}
```

---

## Extending Interfaces

Interfaces can extend one or multiple other interfaces:

```typescript
interface Animal {
  name: string;
  sound(): string;
}

interface Pet extends Animal {
  owner: string;
  vaccinated: boolean;
}

interface ServiceDog extends Pet {
  certificationId: string;
  task: string;
}

const guide: ServiceDog = {
  name: "Rex",
  sound: () => "Woof",
  owner: "John",
  vaccinated: true,
  certificationId: "SD-2024-001",
  task: "Guide for visually impaired",
};
```

---

## Interface Merging (Declaration Merging)

TypeScript merges multiple declarations of the same interface:

```typescript
interface Window {
  title: string;
}

interface Window {
  history: History;
}

// Merged: Window has BOTH title and history
const w: Window; // { title: string; history: History }
```

This is how `@types` packages extend browser globals.

---

## Interface vs Type Alias

```typescript
// Interface — extendable, declaration-mergeable
interface Animal {
  name: string;
}
interface Animal {
  legs: number; // OK: merges
}

// Type alias — more flexible but can't merge
type Vehicle = {
  brand: string;
};
// type Vehicle = { model: string }; // Error: duplicate

// Prefer interface for object shapes used as contracts
// Prefer type for unions, intersections, and primitives
```

---

## Functional Interfaces

```typescript
// Call signature
interface Transformer<T, U> {
  (input: T): U;
}

const toNumber: Transformer<string, number> = (s) => parseInt(s, 10);

// Constructor signature
interface ClockConstructor {
  new (hour: number, minute: number): ClockInterface;
}

interface ClockInterface {
  tick(): void;
}
```

---

## Generic Interfaces

```typescript
interface Repository<T> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(entity: Omit<T, "id">): Promise<T>;
  update(id: string, entity: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}

interface User {
  id: string;
  name: string;
  email: string;
}

class UserRepository implements Repository<User> {
  async findById(id: string) { /* ... */ return null; }
  async findAll() { return []; }
  async create(user: Omit<User, "id">) { return { id: "1", ...user }; }
  async update(id: string, user: Partial<User>) { return null; }
  async delete(id: string) { return true; }
}
```

---

## Real-World Interface Example

```typescript
// API response shapes
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
  timestamp: string;
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Service contract
interface UserService {
  getUser(id: string): Promise<ApiResponse<User>>;
  getUsers(page: number, limit: number): Promise<PaginatedResponse<User>>;
  createUser(data: CreateUserDto): Promise<ApiResponse<User>>;
  updateUser(id: string, data: UpdateUserDto): Promise<ApiResponse<User>>;
  deleteUser(id: string): Promise<ApiResponse<null>>;
}

// DTOs (Data Transfer Objects)
interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role?: "admin" | "user";
}

interface UpdateUserDto extends Partial<Omit<CreateUserDto, "password">> {
  currentPassword?: string;
  newPassword?: string;
}
```

> :ToCPrevNext
