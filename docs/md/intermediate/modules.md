# Modules & Imports

TypeScript's module system lets you organise code across files with full type safety. Understanding how modules work is critical for large applications.

---

## ES Modules

```typescript
// math.ts — Named exports
export function add(a: number, b: number): number {
  return a + b;
}

export function subtract(a: number, b: number): number {
  return a - b;
}

export const PI = 3.14159;

// Default export
export default class Calculator {
  add = add;
  subtract = subtract;
}
```

```typescript
// main.ts — Importing
import Calculator, { add, subtract, PI } from "./math";

console.log(add(2, 3));       // 5
console.log(PI);               // 3.14159
const calc = new Calculator();
```

---

## Re-Exports

```typescript
// services/index.ts — barrel file
export { UserService } from "./user.service";
export { AuthService } from "./auth.service";
export { EmailService } from "./email.service";
export type { ServiceConfig } from "./types";
```

```typescript
// Now import from the barrel
import { UserService, AuthService } from "./services";
```

---

## Type-Only Imports/Exports

```typescript
// Only imports the type — erased at runtime (TypeScript 3.8+)
import type { User } from "./types";
export type { User };

// Useful for avoiding circular deps and reducing bundle size
```

---

## Path Aliases

Configure in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@services/*": ["src/services/*"],
      "@models/*": ["src/models/*"]
    }
  }
}
```

```typescript
// Before aliases
import { UserService } from "../../../services/user.service";

// After aliases
import { UserService } from "@services/user.service";
```

---

## Module Augmentation

Extend an existing module's types:

```typescript
// Express request augmentation
import "express";

declare module "express" {
  interface Request {
    user?: {
      id: string;
      email: string;
      role: "admin" | "user";
    };
    requestId?: string;
  }
}

// Now TypeScript knows req.user exists
app.use((req, res, next) => {
  req.user = { id: "1", email: "a@x.com", role: "user" };
  next();
});
```

---

## Ambient Modules

Declare types for modules without TypeScript support:

```typescript
// @types/my-module/index.d.ts or in a .d.ts file
declare module "legacy-lib" {
  export function doLegacyThing(input: string): number;
  export const version: string;
}

// wildcard module — for CSS/image imports
declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}

declare module "*.svg" {
  const src: string;
  export default src;
}
```

---

## Namespace (Legacy)

```typescript
// Still useful for organising global types in .d.ts files
namespace API {
  export interface User {
    id: string;
    name: string;
  }

  export interface Response<T> {
    data: T;
    status: number;
  }

  export namespace Auth {
    export interface Token {
      accessToken: string;
      expiresIn: number;
    }
  }
}

const user: API.User = { id: "1", name: "Alice" };
const token: API.Auth.Token = { accessToken: "...", expiresIn: 3600 };
```

> :ToCPrevNext
