# tsconfig.json Deep Dive

The `tsconfig.json` file controls every aspect of how TypeScript compiles your code.

---

## Creating tsconfig.json

```bash
npx tsc --init
```

---

## Full Reference

```json
{
  "compilerOptions": {
    // ─── Output ───────────────────────────────────
    "target": "ES2022",          // Compile to this JS version
    "module": "commonjs",        // Module format: commonjs | ESNext | AMD
    "outDir": "./dist",          // Where to put compiled files
    "rootDir": "./src",          // Root of source files
    "declaration": true,         // Generate .d.ts type files
    "declarationDir": "./types", // Where to put .d.ts files
    "sourceMap": true,           // .js.map for debugging

    // ─── Type Checking ────────────────────────────
    "strict": true,              // All strict checks (recommended)
    "noImplicitAny": true,       // Disallow implicit any
    "strictNullChecks": true,    // null ≠ undefined ≠ string
    "noUnusedLocals": true,      // Error on unused variables
    "noUnusedParameters": true,  // Error on unused function params
    "noImplicitReturns": true,   // All code paths must return
    "noFallthroughCasesInSwitch": true,

    // ─── Module Resolution ────────────────────────
    "moduleResolution": "node",  // How to resolve modules
    "esModuleInterop": true,     // Better CJS/ESM interop
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,   // import data from './data.json'
    "baseUrl": ".",              // Base for non-relative imports
    "paths": {
      "@/*": ["src/*"],          // Path aliases
      "@services/*": ["src/services/*"]
    },

    // ─── Library ──────────────────────────────────
    "lib": ["ES2022", "DOM"],    // Built-in type definitions
    "types": ["node", "jest"],   // Only include these @types

    // ─── Misc ─────────────────────────────────────
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "experimentalDecorators": true,  // Enable decorators
    "emitDecoratorMetadata": true    // For reflect-metadata
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "coverage", "**/*.spec.ts"]
}
```

---

## Common tsconfig Presets

### Node.js API
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

### Frontend (React)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true
  }
}
```

### Monorepo Package
```json
{
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

> :ToCPrevNext
