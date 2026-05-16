# TypeScript Types

TypeScript's type system is its superpower. Understanding types at every level — from primitives to advanced utility types — is what separates TypeScript beginners from pros.

---

## Primitive Types

```typescript
// The 8 primitive types in TypeScript
let isDone: boolean = false;
let age: number = 25;
let bigNumber: bigint = 9007199254740991n;
let name: string = "Alice";
let nothing: null = null;
let notDefined: undefined = undefined;
let unique: symbol = Symbol("id");

// 'object' — any non-primitive value
let obj: object = { a: 1 };
```

---

## Type Inference

TypeScript infers types when you don't annotate them:

```typescript
let count = 0;          // inferred: number
let greeting = "Hello"; // inferred: string
let active = true;      // inferred: boolean

// Inference in functions
function double(x: number) {
  return x * 2; // return type inferred as 'number'
}
```

---

## Arrays

```typescript
let numbers: number[] = [1, 2, 3];
let strings: Array<string> = ["a", "b", "c"];

// Readonly array
const ids: ReadonlyArray<number> = [1, 2, 3];
// ids.push(4); // Error!
```

---

## Tuples

A tuple is an array with a **fixed number of elements** and **known types**:

```typescript
let pair: [string, number] = ["Alice", 30];
let rgb: [number, number, number] = [255, 128, 0];

// Named tuples (TypeScript 4.0+)
let user: [name: string, age: number] = ["Bob", 25];
console.log(user[0]); // Bob

// Optional tuple elements
type StringNumber = [string, number?];
const a: StringNumber = ["hello"];
const b: StringNumber = ["hello", 42];
```

---

## Union Types

A value can be **one of several types**:

```typescript
type ID = string | number;

function printId(id: ID): void {
  if (typeof id === "string") {
    console.log(id.toUpperCase()); // TypeScript knows id is string here
  } else {
    console.log(id.toFixed(2));    // TypeScript knows id is number here
  }
}

// Union with literals
type Direction = "north" | "south" | "east" | "west";
type Status = "pending" | "active" | "inactive";

function move(dir: Direction): void {
  console.log(`Moving ${dir}`);
}
```

---

## Intersection Types

Combine **multiple types into one**:

```typescript
type HasName = { name: string };
type HasAge  = { age: number };

type Person = HasName & HasAge;

const person: Person = { name: "Alice", age: 30 }; // Must have BOTH

// Practical use: Middleware + Request
type AuthRequest = Request & { user: { id: string; role: string } };
```

---

## Type Aliases

```typescript
// Alias a primitive
type UserID = string;

// Alias an object shape
type Point = {
  x: number;
  y: number;
};

// Alias a function signature
type Callback<T> = (error: Error | null, result: T | null) => void;

// Recursive type alias
type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };
```

---

## Literal Types

A type that accepts **only one specific value**:

```typescript
type Yes = "yes";
type One = 1;
type True = true;

// Useful in discriminated unions
type Shape =
  | { kind: "circle";    radius: number }
  | { kind: "rectangle"; width: number; height: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":    return Math.PI * shape.radius ** 2;
    case "rectangle": return shape.width * shape.height;
  }
}
```

---

## The `any`, `unknown`, and `never` Types

```typescript
// any — disables type checking (avoid!)
let anything: any = 42;
anything = "now a string"; // No error
anything.someMethod();     // No error — dangerous!

// unknown — type-safe any (use this instead)
let value: unknown = fetchData();
// value.toString();           // Error: must narrow first
if (typeof value === "string") {
  console.log(value.toUpperCase()); // OK after narrowing
}

// never — a value that never occurs
function throwError(message: string): never {
  throw new Error(message);
}

// Exhaustiveness check with never
function assertNever(x: never): never {
  throw new Error("Unexpected value: " + x);
}
```

---

## Utility Types

TypeScript ships with powerful built-in utility types:

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: "admin" | "user";
}

// Partial — all properties optional
type UpdateUser = Partial<User>;

// Required — all properties required
type RequiredUser = Required<User>;

// Readonly — prevent mutation
type FrozenUser = Readonly<User>;

// Pick — select a subset of properties
type PublicUser = Pick<User, "id" | "name" | "email">;

// Omit — exclude properties
type SafeUser = Omit<User, "password">;

// Record — key-value map
type RoleMap = Record<string, User[]>;

// Exclude — from union
type NonAdmin = Exclude<User["role"], "admin">; // "user"

// Extract — from union
type AdminOnly = Extract<User["role"], "admin">; // "admin"

// NonNullable — remove null/undefined
type DefinedString = NonNullable<string | null | undefined>; // string

// ReturnType — extract return type of function
function getUser() { return { id: 1, name: "Alice" }; }
type UserShape = ReturnType<typeof getUser>; // { id: number; name: string }

// Parameters — extract parameter types
type GetUserParams = Parameters<typeof getUser>; // []

// Awaited — unwrap Promise
type ResolvedUser = Awaited<Promise<User>>; // User
```

> :ToCPrevNext
