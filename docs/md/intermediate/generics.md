# Generics

Generics let you write **reusable, type-safe code** that works with any type. They're the key to building robust libraries and utilities.

---

## Why Generics?

```typescript
// ❌ Without generics — loses type info
function identity(value: any): any {
  return value;
}
const n = identity(42); // type: any — useless!

// ✅ With generics — type preserved
function identity<T>(value: T): T {
  return value;
}
const n = identity(42);       // type: number
const s = identity("hello");  // type: string
const b = identity(true);     // type: boolean
```

---

## Generic Functions

```typescript
// Swap tuple elements
function swap<T, U>(pair: [T, U]): [U, T] {
  return [pair[1], pair[0]];
}

const result = swap([1, "hello"]); // type: [string, number]

// First element of an array
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

// Map with type safety
function mapArray<T, U>(arr: T[], transform: (item: T) => U): U[] {
  return arr.map(transform);
}

const lengths = mapArray(["hello", "world"], (s) => s.length);
// type: number[]
```

---

## Generic Constraints

```typescript
// T must have a 'length' property
function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}

longest("hello", "world");      // OK
longest([1, 2, 3], [1, 2]);    // OK
longest({ length: 5 }, { length: 3 }); // OK
// longest(1, 2); // Error: number doesn't have 'length'

// T must be a key of U
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { id: 1, name: "Alice", email: "a@x.com" };
const name = getProperty(user, "name"); // type: string
// getProperty(user, "missing");        // Error!
```

---

## Generic Classes

```typescript
class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  get size(): number {
    return this.items.length;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }
}

const numStack = new Stack<number>();
numStack.push(1);
numStack.push(2);
console.log(numStack.pop()); // 2

const strStack = new Stack<string>();
strStack.push("hello");
```

---

## Generic Interfaces

```typescript
interface Pair<T, U> {
  first: T;
  second: U;
}

interface Result<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

function wrap<T>(value: T): Result<T> {
  return { data: value, error: null, success: true };
}

function fail<T>(message: string): Result<T> {
  return { data: null, error: message, success: false };
}
```

---

## Default Type Parameters

```typescript
interface RequestConfig<TBody = unknown, TParams = Record<string, string>> {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  body?: TBody;
  params?: TParams;
  headers?: Record<string, string>;
}

// Use without specifying types — defaults apply
const config: RequestConfig = { url: "/api/users", method: "GET" };

// Or specify
const postConfig: RequestConfig<{ name: string }> = {
  url: "/api/users",
  method: "POST",
  body: { name: "Alice" },
};
```

---

## Conditional Types

```typescript
// T extends U ? X : Y
type IsString<T> = T extends string ? true : false;

type A = IsString<string>;  // true
type B = IsString<number>;  // false
type C = IsString<"hello">; // true (string literal extends string)

// Practical: unwrap arrays
type Flatten<T> = T extends Array<infer U> ? U : T;

type Str = Flatten<string[]>;   // string
type Num = Flatten<number>;     // number (not an array, returns as-is)

// Distributive conditional types
type ToArray<T> = T extends any ? T[] : never;
type Result = ToArray<string | number>; // string[] | number[]
```

---

## Infer Keyword

Extract types from other types:

```typescript
// Extract return type of a function
type ReturnType<T extends (...args: any) => any> =
  T extends (...args: any) => infer R ? R : never;

// Extract first parameter type
type FirstParam<T extends (...args: any) => any> =
  T extends (first: infer F, ...rest: any) => any ? F : never;

// Unwrap Promise
type Awaited<T> = T extends Promise<infer U> ? Awaited<U> : T;

// Usage
async function fetchUser() {
  return { id: 1, name: "Alice" };
}

type UserType = Awaited<ReturnType<typeof fetchUser>>;
// { id: number; name: string }
```

---

## Mapped Types

Transform all properties of a type:

```typescript
// Make all properties optional (like built-in Partial<T>)
type MyPartial<T> = {
  [K in keyof T]?: T[K];
};

// Make all properties required
type MyRequired<T> = {
  [K in keyof T]-?: T[K];
};

// Make all properties readonly
type MyReadonly<T> = {
  readonly [K in keyof T]: T[K];
};

// Transform values
type Stringify<T> = {
  [K in keyof T]: string;
};

// Remap keys
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

interface User { name: string; age: number; }
type UserGetters = Getters<User>;
// { getName: () => string; getAge: () => number }
```

> :ToCPrevNext
