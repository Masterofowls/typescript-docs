# Getting Started with TypeScript

TypeScript is a **strongly typed superset of JavaScript** maintained by Microsoft. It compiles to plain JavaScript and runs anywhere JavaScript runs.

---

## Why TypeScript?

```typescript
// ❌ JavaScript — no safety
function add(a, b) {
  return a + b;
}
add(1, "2"); // Returns "12" silently!

// ✅ TypeScript — caught at compile time
function add(a: number, b: number): number {
  return a + b;
}
add(1, "2"); // Error: Argument of type 'string' is not assignable to parameter of type 'number'
```

TypeScript gives you:
- **Static type checking** — catch bugs before runtime
- **IntelliSense** — rich auto-complete in your editor
- **Refactoring safety** — rename symbols across your whole project
- **Self-documenting code** — types serve as inline documentation

---

## Installation

```bash
# Install TypeScript globally
npm install -g typescript

# Check version
tsc --version
```

For a project:
```bash
npm init -y
npm install --save-dev typescript @types/node ts-node
```

---

## Your First TypeScript Project

```bash
mkdir my-ts-app
cd my-ts-app
npm init -y
npm install --save-dev typescript ts-node @types/node
npx tsc --init
```

This creates a `tsconfig.json` configuration file.

---

## Running TypeScript

```bash
# Compile to JavaScript
tsc index.ts

# Run directly (development)
ts-node index.ts

# Or using npx
npx ts-node index.ts
```

> :ToCPrevNext
