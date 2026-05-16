# Advanced Types

TypeScript's type system goes far beyond simple annotations. These advanced features let you model complex domains with precision.

---

## Template Literal Types

Construct new string types from existing ones:

```typescript
type EventName = "click" | "focus" | "blur";
type Handler = `on${Capitalize<EventName>}`; // "onClick" | "onFocus" | "onBlur"

// CSS property types
type CSSProperty = "margin" | "padding" | "border";
type CSSDirection = "top" | "right" | "bottom" | "left";
type CSSLonghand = `${CSSProperty}-${CSSDirection}`;
// "margin-top" | "margin-right" | ... | "border-left"

// URL builder
type Endpoint = `/api/${"users" | "products" | "orders"}`;
// "/api/users" | "/api/products" | "/api/orders"

// Route parameters
type RouteParams<T extends string> =
  T extends `${infer _Start}:${infer Param}/${infer Rest}`
    ? { [K in Param | keyof RouteParams<Rest>]: string }
    : T extends `${infer _Start}:${infer Param}`
    ? { [K in Param]: string }
    : {};

type Params = RouteParams<"/users/:id/posts/:postId">;
// { id: string; postId: string }
```

---

## Discriminated Unions

A pattern for type-safe variant types:

```typescript
// Each variant has a unique discriminant field
type Shape =
  | { kind: "circle";    radius: number }
  | { kind: "square";    side: number }
  | { kind: "rectangle"; width: number; height: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":    return Math.PI * shape.radius ** 2;
    case "square":    return shape.side ** 2;
    case "rectangle": return shape.width * shape.height;
    // TypeScript knows all cases are handled — no default needed
  }
}

// Result type (like Rust's Result<T, E>)
type Result<T, E = Error> =
  | { success: true;  value: T }
  | { success: false; error: E };

function parseJSON<T>(text: string): Result<T> {
  try {
    return { success: true, value: JSON.parse(text) };
  } catch (e) {
    return { success: false, error: e as Error };
  }
}

const result = parseJSON<{ name: string }>('{"name":"Alice"}');
if (result.success) {
  console.log(result.value.name); // TypeScript knows .value exists
} else {
  console.error(result.error.message); // TypeScript knows .error exists
}
```

---

## Branded / Nominal Types

Prevent mixing up values with the same underlying type:

```typescript
// Brand helper
type Brand<T, B extends string> = T & { readonly __brand: B };

type UserId    = Brand<string, "UserId">;
type OrderId   = Brand<string, "OrderId">;
type ProductId = Brand<string, "ProductId">;
type Email     = Brand<string, "Email">;

// Constructor functions
function createUserId(id: string): UserId {
  return id as UserId;
}
function createEmail(email: string): Email {
  if (!email.includes("@")) throw new Error("Invalid email");
  return email as Email;
}

function getUser(id: UserId): void { /* ... */ }
function getOrder(id: OrderId): void { /* ... */ }

const userId = createUserId("user-123");
const orderId = "order-456" as OrderId;

getUser(userId);    // OK
// getUser(orderId); // Error: OrderId ≠ UserId
```

---

## Recursive Types

```typescript
// Recursive tree
type TreeNode<T> = {
  value: T;
  children: TreeNode<T>[];
};

// Recursive readonly
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

// Deep partial
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

// Flatten nested object to dot-notation keys
type DotNotation<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends object
    ? DotNotation<T[K], `${Prefix}${K}.`>
    : `${Prefix}${K}`;
}[keyof T & string];

interface Config {
  server: { host: string; port: number };
  db: { uri: string };
}

type ConfigKeys = DotNotation<Config>;
// "server.host" | "server.port" | "db.uri"
```

---

## Type Guards

Narrow types at runtime:

```typescript
// typeof guard
function processInput(value: string | number | boolean) {
  if (typeof value === "string") {
    return value.toUpperCase(); // string
  } else if (typeof value === "number") {
    return value.toFixed(2);    // number
  }
  return String(value);         // boolean
}

// instanceof guard
class HttpError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
  }
}

function handleError(error: unknown) {
  if (error instanceof HttpError) {
    console.log(`HTTP ${error.statusCode}: ${error.message}`);
  } else if (error instanceof Error) {
    console.log(`Error: ${error.message}`);
  } else {
    console.log("Unknown error:", error);
  }
}

// Custom type guard (predicate)
interface Cat { meow(): void }
interface Dog { bark(): void }

function isCat(animal: Cat | Dog): animal is Cat {
  return "meow" in animal;
}

function makeNoise(animal: Cat | Dog) {
  if (isCat(animal)) {
    animal.meow(); // TypeScript knows it's Cat
  } else {
    animal.bark(); // TypeScript knows it's Dog
  }
}

// Assertion function
function assertDefined<T>(value: T | null | undefined, message: string): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(message);
  }
}
```

---

## Satisfies Operator (TypeScript 4.9+)

```typescript
type Color = "red" | "green" | "blue";

// 'satisfies' validates the type without widening
const palette = {
  red:   [255, 0, 0],
  green: "#00ff00",
  blue:  [0, 0, 255],
} satisfies Record<Color, string | number[]>;

// palette.red is number[], not string | number[]
const r = palette.red;   // type: number[]
const g = palette.green; // type: string
```

> :ToCPrevNext
