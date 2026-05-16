# Decorators

Decorators are a powerful metaprogramming feature that let you annotate and modify classes, methods, properties, and parameters. They're widely used in frameworks like NestJS, TypeORM, and Angular.

> Enable decorators in `tsconfig.json`:
> ```json
> { "compilerOptions": { "experimentalDecorators": true, "emitDecoratorMetadata": true } }
> ```

---

## Class Decorators

```typescript
// A decorator is a function applied with @
function Sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}

function Singleton<T extends new (...args: any[]) => {}>(Base: T) {
  let instance: InstanceType<T>;
  return class extends Base {
    constructor(...args: any[]) {
      super(...args);
      if (!instance) {
        instance = this as unknown as InstanceType<T>;
      }
      return instance;
    }
  } as T;
}

@Sealed
@Singleton
class AppConfig {
  port = 3000;
  db = "mongodb://localhost/app";
}

const a = new AppConfig();
const b = new AppConfig();
console.log(a === b); // true — singleton
```

---

## Method Decorators

```typescript
function Log(target: any, key: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value;

  descriptor.value = function (...args: any[]) {
    console.log(`▶ ${key}(${args.join(", ")})`);
    const result = original.apply(this, args);
    console.log(`◀ ${key} → ${result}`);
    return result;
  };

  return descriptor;
}

function Memoize(target: any, key: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value;
  const cache = new Map<string, any>();

  descriptor.value = function (...args: any[]) {
    const cacheKey = JSON.stringify(args);
    if (cache.has(cacheKey)) return cache.get(cacheKey);
    const result = original.apply(this, args);
    cache.set(cacheKey, result);
    return result;
  };

  return descriptor;
}

class MathService {
  @Log
  add(a: number, b: number): number {
    return a + b;
  }

  @Memoize
  fibonacci(n: number): number {
    if (n <= 1) return n;
    return this.fibonacci(n - 1) + this.fibonacci(n - 2);
  }
}
```

---

## Property Decorators

```typescript
function Required(target: any, propertyKey: string) {
  let value: any;

  Object.defineProperty(target, propertyKey, {
    get() { return value; },
    set(newValue: any) {
      if (newValue === null || newValue === undefined || newValue === "") {
        throw new Error(`${propertyKey} is required`);
      }
      value = newValue;
    },
  });
}

function Range(min: number, max: number) {
  return function (target: any, propertyKey: string) {
    let value: number;

    Object.defineProperty(target, propertyKey, {
      get() { return value; },
      set(newValue: number) {
        if (newValue < min || newValue > max) {
          throw new RangeError(`${propertyKey} must be between ${min} and ${max}`);
        }
        value = newValue;
      },
    });
  };
}

class User {
  @Required
  name!: string;

  @Range(0, 150)
  age!: number;
}

const user = new User();
user.name = "Alice"; // OK
user.age = 200;       // Error: age must be between 0 and 150
```

---

## Parameter Decorators

```typescript
import "reflect-metadata";

const REQUIRED_KEY = Symbol("required");

function RequiredParam(target: any, methodName: string, paramIndex: number) {
  const existingRequired: number[] =
    Reflect.getMetadata(REQUIRED_KEY, target, methodName) ?? [];
  existingRequired.push(paramIndex);
  Reflect.defineMetadata(REQUIRED_KEY, existingRequired, target, methodName);
}

function ValidateRequired(target: any, methodName: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value;

  descriptor.value = function (...args: any[]) {
    const requiredParams: number[] =
      Reflect.getMetadata(REQUIRED_KEY, target, methodName) ?? [];

    requiredParams.forEach((index) => {
      if (args[index] === undefined || args[index] === null) {
        throw new Error(`Parameter ${index} of ${methodName} is required`);
      }
    });

    return original.apply(this, args);
  };
}

class UserService {
  @ValidateRequired
  createUser(@RequiredParam name: string, @RequiredParam email: string) {
    return { name, email };
  }
}
```

---

## Decorator Factories

```typescript
// Decorator factory: returns a decorator
function Retry(times: number, delayMs: number = 0) {
  return function (target: any, key: string, descriptor: PropertyDescriptor) {
    const original = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      let lastError: Error;
      for (let attempt = 1; attempt <= times; attempt++) {
        try {
          return await original.apply(this, args);
        } catch (error) {
          lastError = error as Error;
          console.warn(`Attempt ${attempt}/${times} failed: ${lastError.message}`);
          if (attempt < times && delayMs > 0) {
            await new Promise((resolve) => setTimeout(resolve, delayMs));
          }
        }
      }
      throw lastError!;
    };

    return descriptor;
  };
}

class ApiClient {
  @Retry(3, 1000)
  async fetchData(url: string): Promise<unknown> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }
}
```

> :ToCPrevNext
