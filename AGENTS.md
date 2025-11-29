# Agent Guide for @grammyjs/parse-mode

This guide defines expectations for AI agents (Codex, Copilot, etc.) and maintainers contributing to this repository while respecting Deno-centric workflows and the grammY ecosystem.

## Quick Facts

| Aspect                | Details                                               |
| --------------------- | ----------------------------------------------------- |
| **Primary runtime**   | Deno (write code for Deno first)                      |
| **Secondary runtime** | Node.js (via deno2node transpilation)                 |
| **Entry point**       | `src/mod.ts` → re-exports from `src/format.ts`        |
| **Dependencies**      | `src/deps.deno.ts` (Deno) / `src/deps.node.ts` (Node) |
| **Build tool**        | [deno2node](https://github.com/wojpawlik/deno2node)   |
| **Output directory**  | `dist/` (CommonJS for npm)                            |
| **Task runner**       | `deno task` commands in `deno.jsonc`                  |

## Project Structure

```
src/
├── mod.ts          # Public entry point (re-exports format.ts)
├── format.ts       # Core formatting logic, FormattedString class
├── util.ts         # Internal utilities (entity consolidation, etc.)
├── deps.deno.ts    # Deno dependencies (grammy types from deno.land)
└── deps.node.ts    # Node dependencies (grammy types from npm)
test/
├── deps.test.ts    # Test dependencies
├── format.*.test.ts # Format function tests
└── util.*.test.ts   # Utility function tests
```

## deno2node Compatibility Patterns

This project uses **deno2node** to transpile Deno code for Node.js. Follow these patterns used across grammY plugins:

### Dependency Files Pattern

```typescript
// src/deps.deno.ts - Deno imports (URL-based)
export type {
  MessageEntity,
  User,
} from "https://lib.deno.dev/x/grammy@^1.36/types.ts";

// src/deps.node.ts - Node imports (npm package)
export type { MessageEntity, User } from "grammy/types";
```

**Key rules:**

- Always import from `./deps.deno.ts` in source files (deno2node rewrites to `.node.ts`)
- Keep both files in sync with identical exports
- Use `type` imports when only importing types

### Runtime-Specific Code Pattern

When you need different implementations for Deno vs Node:

```typescript
// feature.deno.ts - Deno-specific implementation
export function doSomething() {/* uses Deno APIs */}

// feature.node.ts - Node-specific implementation
export function doSomething() {/* uses Node APIs */}

// consumer.ts - imports the Deno version
import { doSomething } from "./feature.deno.ts";
// deno2node rewrites this to "./feature.node.ts" for Node builds
```

### Avoiding Deno-Only Globals

- ❌ Do NOT use `Deno.*` APIs in shared code
- ❌ Do NOT use `import.meta.url` for file paths without shimming
- ✅ Use web-standard APIs (`fetch`, `crypto`, `URL`, etc.)
- ✅ Use `node:` prefix for Node built-ins if absolutely needed

## Development Commands

Always use `deno task` commands instead of raw Deno commands:

```bash
deno task ok      # Format + lint + test + type-check (CI equivalent)
deno task test    # Run tests only
deno task check   # Type-check only
deno task build   # Generate Node.js artifacts in dist/
deno task clean   # Remove generated files
```

## Agent Workflow

1. **Before modifying APIs**: Review examples in `README.md` and `src/README.md`
2. **Validate changes**: Run `deno task ok` before committing
3. **Maintain exports**: Update `src/mod.ts` if adding new public APIs
4. **Sync documentation**: Update both README files and JSDoc together
5. **Test Node build**: Run `deno task build` for API changes

## Testing Conventions

### Test File Organization

```typescript
// test/format.featurename.test.ts
import { assertEquals, describe, it } from "./deps.test.ts";
import { FormattedString } from "../src/format.ts";
import type { MessageEntity } from "../src/deps.deno.ts";

describe("FormattedString - Feature Name", () => {
  describe("Subfeature", () => {
    it("should do something specific", () => {
      // Arrange
      const input = new FormattedString("text", []);

      // Act
      const result = input.someMethod();

      // Assert
      assertEquals(result.rawText, "expected");
      assertEquals(result.rawEntities.length, 1);
    });
  });
});
```

### Test Naming Patterns

- Group by feature: `format.bold.test.ts`, `format.italic.test.ts`
- Use `describe` blocks for logical grouping
- Test entity offsets and lengths explicitly (critical for this library)
- Include edge cases: empty strings, overlapping entities, boundary conditions

## Documentation Expectations

1. **README.md** and **src/README.md** must stay synchronized
2. Add JSDoc to all public exports in `src/format.ts`
3. Include usage examples in JSDoc for complex APIs
4. Run `deno fmt` to maintain consistent prose formatting

## Distribution and Release

### Build Process

```bash
# Transpile Deno → Node.js CommonJS
deno task build

# Equivalent npm command (delegates to deno2node)
npm run build
```

### Generated Files (Do NOT Commit)

- `dist/` - Node.js build output
- `coverage.lcov` - Coverage reports
- `test/cov_profile/` - Coverage data

### Version Updates

Coordinate changes across:

- `package.json` version field
- README documentation
- JSDoc version annotations (if any)

## CI/CD Expectations

GitHub Actions runs these checks on all PRs:

```yaml
- deno lint # Linting
- deno fmt --check # Formatting
- deno test --allow-import test # Tests
```

Always run `deno task ok` locally before pushing.

## Common Pitfalls

| Issue                           | Solution                                                  |
| ------------------------------- | --------------------------------------------------------- |
| Import not found in Node build  | Ensure `deps.node.ts` exports the same symbols            |
| Test fails only on CI           | Check `--allow-import` flag; run `deno task test` locally |
| Format changes on commit        | Run `deno fmt` before committing                          |
| Type errors after grammy update | Update both `deps.deno.ts` and `deps.node.ts`             |

## Automation Checklist

- [ ] Run `deno task ok` (format + lint + test + check)
- [ ] Run `deno task build` if changing public APIs
- [ ] Update `README.md` and `src/README.md` for API changes
- [ ] Add/update JSDoc for new or modified exports
- [ ] Ensure both `deps.deno.ts` and `deps.node.ts` stay in sync
