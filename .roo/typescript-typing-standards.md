---
title: TypeScript Typing Standards
task_id: avoid-any-type-standard
date: 2025-06-28
last_updated: 2025-06-28
status: FINAL
owner: Memory
---

# TypeScript Typing Standards

## Core Principle: Avoid `any` Type

**CRITICAL RULE**: Always avoid the `any` type at all times. Ensure that proper types are used instead.

## Current Codebase Analysis

### Identified `any` Usage Violations

The following instances of `any` type usage have been identified in the codebase and require attention:

#### High Priority - Test Files (`test/util.test.ts`)

1. **Lines 650, 651, 652**: Type assertions for URL properties
   ```typescript
   assertEquals((sorted[0] as any).url, "https://a.com");
   assertEquals((sorted[1] as any).url, "https://m.com");
   assertEquals((sorted[2] as any).url, "https://z.com");
   ```

2. **Lines 663, 664, 665**: Type assertions for language properties
   ```typescript
   assertEquals((sorted[0] as any).language, "javascript");
   assertEquals((sorted[1] as any).language, "python");
   assertEquals((sorted[2] as any).language, "typescript");
   ```

3. **Lines 676, 677, 678**: Type assertions for custom emoji ID properties
   ```typescript
   assertEquals((sorted[0] as any).custom_emoji_id, "111");
   assertEquals((sorted[1] as any).custom_emoji_id, "555");
   assertEquals((sorted[2] as any).custom_emoji_id, "999");
   ```

4. **Lines 704, 705, 706**: Type assertions for user ID properties
   ```typescript
   assertEquals((sorted[0] as any).user.id, 100);
   assertEquals((sorted[1] as any).user.id, 200);
   assertEquals((sorted[2] as any).user.id, 300);
   ```

5. **Lines 726, 727**: Type assertions for username properties
   ```typescript
   assertEquals((sorted[0] as any).user.username, "alpha");
   assertEquals((sorted[1] as any).user.username, "zebra");
   ```

6. **Lines 747, 748**: Type assertions for first_name properties
   ```typescript
   assertEquals((sorted[0] as any).user.first_name, "Alice");
   assertEquals((sorted[1] as any).user.first_name, "Zoe");
   ```

7. **Lines 780, 781**: Type assertions for last_name properties
   ```typescript
   assertEquals((sorted[0] as any).user.last_name, "Doe");
   assertEquals((sorted[1] as any).user.last_name, "Smith");
   ```

8. **Lines 787, 793, 794, 795**: Forcing empty string for URL
   ```typescript
   { type: "text_link", offset: 0, length: 5, url: "" } as any, // missing url
   assertEquals((sorted[0] as any).url, "");
   assertEquals((sorted[1] as any).url, "https://a.com");
   assertEquals((sorted[2] as any).url, "https://b.com");
   ```

9. **Lines 801, 807, 808, 809**: Forcing empty string for language
   ```typescript
   { type: "pre", offset: 0, length: 10, language: "" } as any, // missing language
   assertEquals((sorted[0] as any).language, "");
   assertEquals((sorted[1] as any).language, "javascript");
   assertEquals((sorted[2] as any).language, "python");
   ```

### Acceptable Usage (Comments/Documentation)

The following instances are acceptable as they appear in documentation or comments:
- `src/format.ts` line 1107: Documentation comment mentioning "any mix of types"
- `src/format.ts` lines 849, 861: Comments using "any" as English word
- `src/format.ts` lines 1070, 1076: Documentation comments

## Recommended Solutions

### 1. Intersection Types for Direct Type Narrowing (PREFERRED)

The cleanest approach is to use intersection types directly:

```typescript
// ✅ PREFERRED: Use intersection types for direct type narrowing
const entity = sorted[0] as MessageEntity & { type: 'text_link' };
assertEquals(entity.url, "https://a.com"); // TypeScript knows this property exists

// ✅ Other examples:
const preEntity = sorted[0] as MessageEntity & { type: 'pre' };
assertEquals(preEntity.language, "javascript");

const customEmojiEntity = sorted[0] as MessageEntity & { type: 'custom_emoji' };
assertEquals(customEmojiEntity.custom_emoji_id, "111");

const textMentionEntity = sorted[0] as MessageEntity & { type: 'text_mention' };
assertEquals(textMentionEntity.user.id, 100);
```

**Benefits:**
- No need to define custom types for simple cases
- Direct and concise
- Leverages TypeScript's intersection type system
- Maintains type safety without boilerplate

### 2. Custom Type Definitions (for reusability)

When intersection types are used frequently, define reusable types:

```typescript
type TextLinkEntity = MessageEntity & { type: "text_link"; url: string };
type PreEntity = MessageEntity & { type: "pre"; language?: string };
type CustomEmojiEntity = MessageEntity & { type: "custom_emoji"; custom_emoji_id: string };
type TextMentionEntity = MessageEntity & { type: "text_mention"; user: User };

// Then use proper type narrowing
function getEntityUrl(entity: MessageEntity): string | undefined {
  if (entity.type === "text_link") {
    return (entity as TextLinkEntity).url;
  }
  return undefined;
}
```

### 3. Type Guards and Assertions

For complex validation logic, create proper type guards:

```typescript
function isTextLinkEntity(entity: MessageEntity): entity is MessageEntity & { url: string } {
  return entity.type === "text_link" && "url" in entity;
}

if (isTextLinkEntity(sorted[0])) {
  assertEquals(sorted[0].url, "https://a.com");
}
```

### 3. Generic Type Helpers

Create utility types for common patterns:

```typescript
type EntityWithProperty<T extends string, P> = MessageEntity & { type: T } & P;

type TextLinkEntity = EntityWithProperty<"text_link", { url: string }>;
type PreEntity = EntityWithProperty<"pre", { language?: string }>;
```

## Type Safety Best Practices

### 1. Use Strict TypeScript Configuration

Ensure [`tsconfig.json`](tsconfig.json) has strict settings:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

### 2. Prefer Unknown Over Any

When type is truly unknown, use `unknown` instead of `any`:
```typescript
// Instead of this:
function processData(data: any) { ... }

// Use this:
function processData(data: unknown) {
  if (typeof data === 'string') {
    // TypeScript knows data is string here
    return data.toUpperCase();
  }
  // Handle other cases
}
```

### 3. Use Assertion Functions

For complex type validation:
```typescript
function assertIsTextLinkEntity(entity: MessageEntity): asserts entity is TextLinkEntity {
  if (entity.type !== "text_link" || !("url" in entity)) {
    throw new Error("Expected text_link entity");
  }
}
```

## Implementation Priority

1. **HIGH**: Fix test file type assertions (lines 650-809 in [`test/util.test.ts`](test/util.test.ts))
2. **MEDIUM**: Review and strengthen type definitions in [`src/util.ts`](src/util.ts)
3. **LOW**: Enhance type safety in [`src/format.ts`](src/format.ts)

## Monitoring and Enforcement

- Add ESLint rule `@typescript-eslint/no-explicit-any` to prevent future `any` usage
- Consider adding `@typescript-eslint/no-unsafe-*` rules for additional safety
- Regular code reviews must check for proper typing practices

## Related Files

- [`src/util.ts`](src/util.ts) - Core utility functions with proper typing
- [`test/util.test.ts`](test/util.test.ts) - Test file with multiple `any` violations
- [`src/format.ts`](src/format.ts) - Formatting utilities with good type practices
- [`src/deps.deno.ts`](src/deps.deno.ts) - Type definitions source
- [`tsconfig.json`](tsconfig.json) - TypeScript configuration

## Success Metrics

- Zero `any` type usage in production code
- Comprehensive type coverage for all [`MessageEntity`](src/deps.deno.ts) variants
- Improved IDE support and autocomplete
- Reduced runtime type errors
- Enhanced code maintainability and refactoring safety