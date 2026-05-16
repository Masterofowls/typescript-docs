# Classes & Constructors

TypeScript enhances JavaScript classes with access modifiers, abstract classes, and full type safety — enabling object-oriented design patterns that are reliable and self-documenting.

---

## Basic Class

```typescript
class Person {
  name: string;
  age: number;

  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }

  greet(): string {
    return `Hi, I'm ${this.name}, ${this.age} years old.`;
  }
}

const alice = new Person("Alice", 30);
console.log(alice.greet()); // Hi, I'm Alice, 30 years old.
```

---

## Constructor Shorthand

TypeScript lets you declare and initialise properties directly in the constructor parameter list:

```typescript
class Person {
  constructor(
    public name: string,         // public: readable & writable from outside
    private age: number,         // private: only inside this class
    protected email: string,     // protected: this class + subclasses
    readonly id: string = "abc", // readonly: set once, never again
  ) {}

  getAge(): number {
    return this.age; // OK: inside the class
  }
}

const p = new Person("Alice", 30, "a@x.com");
console.log(p.name);  // OK
// p.age;             // Error: 'age' is private
// p.email;           // Error: 'email' is protected
// p.id = "xyz";      // Error: 'id' is readonly
```

---

## Access Modifiers

| Modifier    | Class | Subclass | Outside |
|-------------|-------|----------|---------|
| `public`    | ✅    | ✅       | ✅      |
| `protected` | ✅    | ✅       | ❌      |
| `private`   | ✅    | ❌       | ❌      |
| `readonly`  | ✅    | ✅       | read ✅  |

---

## Getters and Setters

```typescript
class BankAccount {
  private _balance: number = 0;

  get balance(): number {
    return this._balance;
  }

  set balance(amount: number) {
    if (amount < 0) {
      throw new RangeError("Balance cannot be negative");
    }
    this._balance = amount;
  }

  deposit(amount: number): void {
    if (amount <= 0) throw new RangeError("Deposit must be positive");
    this._balance += amount;
  }

  withdraw(amount: number): void {
    if (amount > this._balance) throw new Error("Insufficient funds");
    this._balance -= amount;
  }
}

const account = new BankAccount();
account.deposit(100);
console.log(account.balance); // 100
account.balance = 200;        // Uses setter
```

---

## Static Members

```typescript
class MathHelper {
  static readonly PI = 3.14159265358979;

  static circleArea(radius: number): number {
    return MathHelper.PI * radius ** 2;
  }

  static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }
}

console.log(MathHelper.circleArea(5)); // 78.53...
console.log(MathHelper.clamp(15, 0, 10)); // 10
```

---

## Inheritance

```typescript
abstract class Animal {
  constructor(protected name: string) {}

  abstract makeSound(): string; // Must be implemented by subclasses

  move(distance: number = 0): void {
    console.log(`${this.name} moved ${distance}m`);
  }

  toString(): string {
    return `${this.constructor.name}(${this.name})`;
  }
}

class Dog extends Animal {
  constructor(name: string, private breed: string) {
    super(name); // Must call super() in constructor
  }

  makeSound(): string {
    return "Woof!";
  }

  fetch(item: string): void {
    console.log(`${this.name} fetches the ${item}`);
  }
}

class Cat extends Animal {
  makeSound(): string {
    return "Meow!";
  }
}

const dog = new Dog("Rex", "Labrador");
dog.move(10);           // Rex moved 10m
console.log(dog.makeSound()); // Woof!
```

---

## Implementing Interfaces

```typescript
interface Serializable {
  serialize(): string;
  deserialize(data: string): void;
}

interface Loggable {
  log(): void;
}

class User implements Serializable, Loggable {
  constructor(
    public id: string,
    public name: string,
    public email: string,
  ) {}

  serialize(): string {
    return JSON.stringify({ id: this.id, name: this.name, email: this.email });
  }

  deserialize(data: string): void {
    const obj = JSON.parse(data);
    this.id = obj.id;
    this.name = obj.name;
    this.email = obj.email;
  }

  log(): void {
    console.log(`User: ${this.name} (${this.email})`);
  }
}
```

---

## Abstract Classes

```typescript
abstract class BaseRepository<T extends { id: string }> {
  protected items: Map<string, T> = new Map();

  abstract validate(item: T): boolean;

  save(item: T): T {
    if (!this.validate(item)) {
      throw new Error("Validation failed");
    }
    this.items.set(item.id, item);
    return item;
  }

  findById(id: string): T | undefined {
    return this.items.get(id);
  }

  findAll(): T[] {
    return Array.from(this.items.values());
  }

  delete(id: string): boolean {
    return this.items.delete(id);
  }
}

interface Product {
  id: string;
  name: string;
  price: number;
}

class ProductRepository extends BaseRepository<Product> {
  validate(product: Product): boolean {
    return product.name.length > 0 && product.price >= 0;
  }
}

const repo = new ProductRepository();
repo.save({ id: "1", name: "Widget", price: 9.99 });
console.log(repo.findAll()); // [{ id: "1", name: "Widget", price: 9.99 }]
```

---

## Mixins

Combine multiple behaviors without deep inheritance:

```typescript
type Constructor<T = {}> = new (...args: any[]) => T;

function Timestamped<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    createdAt = new Date();
    updatedAt = new Date();

    touch() {
      this.updatedAt = new Date();
    }
  };
}

function Activatable<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    isActive = false;

    activate() {
      this.isActive = true;
    }

    deactivate() {
      this.isActive = false;
    }
  };
}

class User {
  constructor(public name: string) {}
}

const TimestampedActivatableUser = Activatable(Timestamped(User));

const user = new TimestampedActivatableUser("Alice");
user.activate();
console.log(user.isActive);   // true
console.log(user.createdAt);  // Date object
```

> :ToCPrevNext
