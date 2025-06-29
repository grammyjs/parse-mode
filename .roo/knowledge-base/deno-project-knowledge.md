---
title: grammyjs-parse-mode - Deno Project Knowledge Base
task_id: memory-update-deno-project
date: 2025-06-28
last_updated: 2025-06-28
status: FINAL
owner: Memory
---

# grammyjs-parse-mode Deno Project Knowledge

## Project Overview

**grammyjs-parse-mode** is a **Deno-first library** that provides simplified formatting utilities for the [grammY](https://grammy.dev) Telegram Bot framework. The project is designed with dual compatibility for both Deno and Node.js environments.

## Runtime Environment Details

### Primary Runtime: Deno

- **Configuration**: [`deno.jsonc`](../deno.jsonc) - Main Deno configuration file
- **Entry Point**: [`src/mod.ts`](../src/mod.ts) - Primary module export
- **Dependencies**: [`src/deps.deno.ts`](../src/deps.deno.ts) - Deno-specific imports from `https://lib.deno.dev/x/grammy`
- **Testing**: Native Deno test runner with `deno test --allow-import test`

### Secondary Runtime: Node.js

- **Dependencies**: [`src/deps.node.ts`](../src/deps.node.ts) - Node.js-specific imports
- **Build Process**: Uses `deno2node` for cross-compilation to Node.js
- **Package**: [`package.json`](../package.json) - NPM package configuration

## Deno-Specific Features

### Task Configuration

The [`deno.jsonc`](../deno.jsonc) defines several Deno tasks:

```json
{
  "tasks": {
    "check": "deno cache --allow-import --check=all src/mod.ts",
    "build": "deno run --no-prompt --allow-import --allow-read=. --allow-write=. https://deno.land/x/deno2node@v1.14.0/src/cli.ts tsconfig.json",
    "test": "deno test --allow-import test",
    "ok": "deno fmt && deno lint && deno task test && deno task check"
  }
}
```

### Permission Model

- **Import permissions**: `--allow-import` for external module access
- **File system**: `--allow-read` and `--allow-write` for build processes
- **Security**: Uses Deno's explicit permission model

## Library Architecture

### Core Functionality

1. **Tagged Template Literals**: [`fmt`](../src/format.ts) function for declarative message formatting
2. **FormattedString Class**: Object-oriented API for building formatted messages
3. **Type Safety**: Full TypeScript support with Telegram entity types
4. **Entity Management**: Handles Telegram `MessageEntity` objects for rich formatting

### Formatting Capabilities

- **Text Styles**: Bold (`b`), italic (`i`), underline (`u`), strikethrough (`s`)
- **Special Formatting**: Code blocks, pre-formatted text, spoilers
- **Interactive Elements**: Links, mentions, hashtags
- **Media Support**: Caption formatting for photos, videos, documents

## Development Workflow

### Deno-First Development

1. **Type Checking**: `deno task check` - Validates all TypeScript types
2. **Testing**: `deno task test` - Runs test suite with import permissions
3. **Formatting**: `deno fmt` - Applies consistent code formatting
4. **Linting**: `deno lint` - Enforces code quality standards
5. **Full Validation**: `deno task ok` - Complete development pipeline

### Cross-Platform Build

- **Target**: Node.js compatibility via `deno2node`
- **Output**: Generated Node.js package in `out/` directory
- **Automation**: Single command builds for both platforms

## Dependencies and Imports

### Deno Dependencies

- **grammY Types**: Imported from `https://lib.deno.dev/x/grammy@^1.36/types.ts`
- **Standard Library**: Uses Deno standard library patterns
- **No Package Manager**: Direct URL imports following Deno conventions

### Dual Compatibility Strategy

- **Conditional Exports**: Separate dependency files for each runtime
- **Build-Time Resolution**: `deno2node` handles import transformation
- **Type Consistency**: Shared TypeScript definitions across platforms

## Key Implementation Notes

### File Organization

```
src/
├── deps.deno.ts     # Deno-specific dependencies
├── deps.node.ts     # Node.js-specific dependencies  
├── format.ts        # Core formatting implementation
├── mod.ts          # Main module export
└── util.ts         # Utility functions
```

### Testing Strategy

- **Native Deno Testing**: Uses built-in `deno test` runner
- **Import Permissions**: Tests require `--allow-import` for external dependencies
- **Coverage Support**: Integrated coverage reporting via `deno coverage`

## Integration Points

### grammY Framework Integration

- **Message API**: Integrates with grammY's message sending methods
- **Entity Handling**: Compatible with Telegram Bot API entity format
- **Type Safety**: Leverages grammY's TypeScript definitions

### Telegram Bot API Compliance

- **MessageEntity**: Full support for Telegram's formatting entities
- **Caption Support**: Works with media captions and regular messages
- **API Compatibility**: Follows Telegram Bot API formatting specifications

This knowledge base establishes the project as a **Deno-first library** with comprehensive dual-platform support, leveraging Deno's modern development features while maintaining broad compatibility.
