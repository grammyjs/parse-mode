# Project Context: @grammyjs/parse-mode

## Overview

`@grammyjs/parse-mode` is a plugin for the [grammY](https://grammy.dev) Telegram Bot framework that simplifies message formatting. It provides a declarative, type-safe API to construct rich text messages (bold, italic, links, mentions, etc.) using:

- **Tagged template literals** via `fmt` function
- **Fluent builder pattern** via `FormattedString` class

The project follows the **Deno-first** development model used across grammY plugins, with Node.js compatibility achieved through [deno2node](https://github.com/wojpawlik/deno2node) transpilation.

## Architecture

### Source Structure

```
src/
├── mod.ts          # Public entry point (re-exports only)
├── format.ts       # Core API: FormattedString class, fmt, formatters
├── util.ts         # Internal: entity consolidation, comparison utilities
├── deps.deno.ts    # Deno dependencies → grammy types from deno.land
└── deps.node.ts    # Node dependencies → grammy types from npm
```

### Key Design Patterns

**1. Dual Dependencies Pattern (deno2node convention)**

```typescript
// deps.deno.ts - Used during Deno development
export type { MessageEntity } from "https://lib.deno.dev/x/grammy@^1.36/types.ts";

// deps.node.ts - Used after deno2node transpilation
export type { MessageEntity } from "grammy/types";
```

**2. Re-export Entry Point**

```typescript
// mod.ts - Clean public API surface
export * from "./format.ts";
```

**3. FormattedString Fluent API**

```typescript
// Chainable formatting methods
FormattedString.bold("Hello").italic(" World").code("!");
```

## Development Environment

### Prerequisites

- **Deno v2.x** - Primary runtime and toolchain
- **Node.js ≥14.13.1** - For building/verifying npm distribution

### Essential Commands

```bash
# Full validation (equivalent to CI)
deno task ok

# Individual operations
deno task test    # Run test suite
deno task check   # Type-check source
deno task build   # Generate Node.js dist/

# Cleanup
deno task clean   # Remove generated artifacts
```

### Configuration Files

| File            | Purpose                                      |
| --------------- | -------------------------------------------- |
| `deno.jsonc`    | Deno tasks, formatting, linting, exclusions  |
| `tsconfig.json` | deno2node output settings (CommonJS, target) |
| `package.json`  | npm package metadata, Node.js scripts        |

## Coding Conventions

### Style Guidelines

- **Formatter**: `deno fmt` with `proseWrap: preserve`
- **Linter**: `deno lint` with default rules
- **TypeScript**: Strict mode enabled

### Import Conventions

```typescript
// ✅ Always import from deps.deno.ts in source
import type { MessageEntity } from "./deps.deno.ts";

// ✅ Use type imports for type-only imports
import type { User } from "./deps.deno.ts";

// ❌ Never import directly from URLs in non-deps files
import { something } from "https://...";

// ❌ Never use Node-specific globals without shimming
const dir = __dirname; // Won't work in Deno
```

### Entity Handling

This library's core function is managing `MessageEntity` objects. When modifying code:

- Always track `offset` and `length` carefully
- Test edge cases: empty strings, overlapping entities, boundary conditions
- Use `consolidateEntities()` when combining adjacent similar entities

## Testing Patterns

### Test Organization

```typescript
// test/format.featurename.test.ts
import { assertEquals, describe, it } from "./deps.test.ts";
import { FormattedString } from "../src/format.ts";

describe("FormattedString - Feature Name", () => {
  describe("Specific Behavior", () => {
    it("should handle specific case", () => {
      const result = FormattedString.bold("test");
      assertEquals(result.rawText, "test");
      assertEquals(result.rawEntities[0]?.offset, 0);
      assertEquals(result.rawEntities[0]?.length, 4);
    });
  });
});
```

### Critical Test Areas

1. **Entity offsets** - Must be exact after operations
2. **Entity lengths** - Must match actual text length
3. **Chaining** - Entities must accumulate correctly
4. **Slicing** - Entities must be adjusted/filtered properly
5. **Joining** - Adjacent entities may consolidate

## deno2node Best Practices

This project uses deno2node for Node.js compatibility. Key considerations:

### What deno2node Does

1. Rewrites `./deps.deno.ts` imports to `./deps.node.ts`
2. Rewrites `*.deno.ts` imports to `*.node.ts` (runtime-specific code)
3. Removes URL-based imports
4. Emits CommonJS `.js` and `.d.ts` files

### Compatibility Checklist

- [ ] Keep `deps.deno.ts` and `deps.node.ts` exports identical
- [ ] Avoid Deno-specific APIs (`Deno.*`) in shared code
- [ ] Use web-standard APIs when possible (`fetch`, `URL`, `crypto`)
- [ ] Test Node build with `deno task build`

## CI/CD Pipeline

GitHub Actions validates all PRs:

```yaml
matrix:
  testType: ["lint", "fmt", "test"]
```

Match CI locally with `deno task ok`.

## Common Tasks

### Adding a New Formatter

1. Add method to `FormattedString` class in `src/format.ts`
2. Add corresponding `fmt` helper function
3. Export from `src/mod.ts` if public
4. Add tests in `test/format.newformatter.test.ts`
5. Update README examples

### Updating grammy Dependency

1. Update version in `src/deps.deno.ts`
2. Update version in `package.json` (peerDependencies + devDependencies)
3. Sync exports between `deps.deno.ts` and `deps.node.ts`
4. Run `deno task ok` and `deno task build`

### Debugging Entity Issues

```typescript
// Log entity details for debugging
console.log(formatted.rawText);
console.log(JSON.stringify(formatted.rawEntities, null, 2));
```

## Important Notes

- **Do not edit `dist/`** - Generated by build process
- **Do not commit coverage files** - Excluded in `.gitignore`
- **Always run `deno task ok`** before committing
- **Keep README files synchronized** - `README.md` and `src/README.md`

## Related Resources

- [grammY Documentation](https://grammy.dev)
- [grammY Plugin Template](https://github.com/grammyjs/plugin-template)
- [deno2node Documentation](https://github.com/wojpawlik/deno2node)
- [Telegram Bot API - Formatting](https://core.telegram.org/bots/api#formatting-options)
