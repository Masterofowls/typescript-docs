# Your First index.ts

The entry point of most TypeScript applications is `index.ts`. Let's walk through creating one from scratch.

---

## Minimal index.ts

```typescript
// index.ts
console.log("Hello, TypeScript!");
```

Run it:
```bash
ts-node index.ts
# Output: Hello, TypeScript!
```

---

## A Real-World index.ts

In production apps, `index.ts` typically bootstraps the application — it wires together your modules, starts a server, or runs the main program logic.

```typescript
// index.ts
import { createApp } from "./app";
import { connectDatabase } from "./database";
import { config } from "./config";

async function main(): Promise<void> {
  try {
    // 1. Connect to database
    await connectDatabase(config.db.uri);
    console.log("✅ Database connected");

    // 2. Create and configure Express app
    const app = createApp();

    // 3. Start listening
    app.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port}`);
    });
  } catch (error) {
    console.error("❌ Failed to start application:", error);
    process.exit(1);
  }
}

main();
```

---

## Understanding the Structure

### Imports
```typescript
import { something } from "./module";    // Named import
import defaultExport from "./module";    // Default import
import * as everything from "./module";  // Namespace import
```

### Async Entry Point
```typescript
// Top-level await (Node 16+, ESM)
const data = await fetch("https://api.example.com/data");

// Or wrap in async function (CommonJS)
async function main() {
  const data = await fetch("https://api.example.com/data");
}
main();
```

### Error Handling
```typescript
process.on("unhandledRejection", (reason: unknown) => {
  console.error("Unhandled rejection:", reason);
  process.exit(1);
});

process.on("uncaughtException", (error: Error) => {
  console.error("Uncaught exception:", error);
  process.exit(1);
});
```

---

## tsconfig.json Essentials

```json
{
  "compilerOptions": {
    "target": "ES2022",           // JavaScript version to compile to
    "module": "commonjs",         // Module system
    "lib": ["ES2022"],            // Type definitions included
    "outDir": "./dist",           // Output directory
    "rootDir": "./src",           // Source directory
    "strict": true,               // Enable all strict checks
    "esModuleInterop": true,      // Allow default imports from CJS modules
    "skipLibCheck": true,         // Skip type-checking .d.ts files
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,    // Import JSON files
    "declaration": true,          // Generate .d.ts files
    "sourceMap": true             // Generate source maps for debugging
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

### Strict Mode Options
```json
{
  "compilerOptions": {
    "strict": true,               // Enables all the below:
    "noImplicitAny": true,        // Error on implicit 'any' types
    "strictNullChecks": true,     // null/undefined are distinct types
    "strictFunctionTypes": true,  // Function parameter variance
    "strictBindCallApply": true,  // Type-check bind/call/apply
    "noImplicitThis": true,       // Error on 'this' with implicit any
    "alwaysStrict": true          // Emit 'use strict' in output
  }
}
```

> :ToCPrevNext
