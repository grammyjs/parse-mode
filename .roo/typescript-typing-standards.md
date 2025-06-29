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

Current instances of `any` type usage in the codebase:

#### Test Files (16 instances total)

**`test/util.consolidateEntities.test.ts` (6 instances)**

- Type assertions for accessing entity-specific properties in tests
- Pattern: `(entity as any).property` for URL, language, custom_emoji_id, and user properties

**`test/util.isEntitySimilar.test.ts` (10 instances)**

- Using `null as any` and `undefined as any` for testing edge cases
- Affects entity properties: language, url, custom_emoji_id, and user fields

### Acceptable Usage (Comments/Documentation)

The following instances are acceptable as they appear in documentation or comments:

- Documentation comments mentioning "any" as an English word
- Type system explanatory comments

## Recommended Solutions

### 1. Intersection Types for Direct Type Narrowing (PREFERRED)

The cleanest approach is to use intersection types directly:

```typescript
// ✅ PREFERRED: Use intersection types for direct type narrowing
const entity = sorted[0] as MessageEntity & { type: "text_link" };
assertEquals(entity.url, "https://a.com"); // TypeScript knows this property exists

// ✅ Other examples:
const preEntity = sorted[0] as MessageEntity & { type: "pre" };
assertEquals(preEntity.language, "javascript");

const customEmojiEntity = sorted[0] as MessageEntity & { type: "custom_emoji" };
assertEquals(customEmojiEntity.custom_emoji_id, "111");

const textMentionEntity = sorted[0] as MessageEntity & { type: "text_mention" };
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
type CustomEmojiEntity = MessageEntity & {
  type: "custom_emoji";
  custom_emoji_id: string;
};
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
function isTextLinkEntity(
  entity: MessageEntity,
): entity is MessageEntity & { url: string } {
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
function assertIsTextLinkEntity(
  entity: MessageEntity,
): asserts entity is TextLinkEntity {
  if (entity.type !== "text_link" || !("url" in entity)) {
    throw new Error("Expected text_link entity");
  }
}
```

## Implementation Priority

1. **HIGH**: Fix test file type assertions in [`test/util.consolidateEntities.test.ts`](test/util.consolidateEntities.test.ts) and [`test/util.isEntitySimilar.test.ts`](test/util.isEntitySimilar.test.ts)
2. **MEDIUM**: Review and strengthen type definitions in [`src/util.ts`](src/util.ts)
3. **LOW**: Enhance type safety in [`src/format.ts`](src/format.ts)

## Monitoring and Enforcement

- Add ESLint rule `@typescript-eslint/no-explicit-any` to prevent future `any` usage
- Consider adding `@typescript-eslint/no-unsafe-*` rules for additional safety
- Regular code reviews must check for proper typing practices

## Related Files

- [`src/util.ts`](src/util.ts) - Core utility functions with proper typing
- [`test/util.consolidateEntities.test.ts`](test/util.consolidateEntities.test.ts) - Test file with `any` violations
- [`test/util.isEntitySimilar.test.ts`](test/util.isEntitySimilar.test.ts) - Test file with `any` violations
- [`src/format.ts`](src/format.ts) - Formatting utilities with good type practices
- [`src/deps.deno.ts`](src/deps.deno.ts) - Type definitions source
- [`tsconfig.json`](tsconfig.json) - TypeScript configuration

## Success Metrics

- Zero `any` type usage in production code
- Comprehensive type coverage for all [`MessageEntity`](src/deps.deno.ts) variants
- Improved IDE support and autocomplete
- Reduced runtime type errors
- Enhanced code maintainability and refactoring safety
