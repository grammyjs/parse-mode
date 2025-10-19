# Agent Guide for @grammyjs/parse-mode

This guide defines expectations for automation and maintainers contributing to this repository while respecting Deno-centric workflows and the grammY ecosystem.

## Quick Facts

- Target runtimes: Deno (primary) and Node.js via [deno.jsonc](deno.jsonc:4) tasks and CommonJS output configured in [tsconfig.json](tsconfig.json:12).
- Primary entry point: [src/mod.ts](src/mod.ts:1) re-exports the formatting surface from [src/format.ts](src/format.ts:1).
- Types originate from [src/deps.deno.ts](src/deps.deno.ts:1) and mirror Node bindings via [src/deps.node.ts](src/deps.node.ts:1).
- TypeScript compiler settings enforce strict mode and consistent casing through [tsconfig.json](tsconfig.json:3).
- Canonical workflows are encapsulated in [deno.jsonc](deno.jsonc:4); run tasks instead of ad-hoc commands to preserve parity between Deno and Node artifacts.

## Agent Workflow

1. Review high-level usage examples in [README.md](README.md:12) and [src/README.md](src/README.md:12) before modifying public APIs so samples remain accurate.
2. Use `deno task check`, `deno task test`, and `deno task ok` defined in [deno.jsonc](deno.jsonc:4) to validate code instead of invoking Deno subcommands manually.
3. Prefer incremental edits within `src/` to maintain shared exports in [src/mod.ts](src/mod.ts:1); never bypass helper factories in [src/format.ts](src/format.ts:943).
4. Synchronize documentation after behavior changes by updating both READMEs and relevant JSDoc in [src/format.ts](src/format.ts:147).
5. When adjusting distribution settings or introducing new exports, regenerate Node artifacts via `deno task build` as scripted in [deno.jsonc](deno.jsonc:5) and confirm `npm run build` delegates to the same pipeline in [package.json](package.json:22).

## Deno Runtime Practices

- Execute linting, formatting, testing, and cache validation through `deno task ok` in [deno.jsonc](deno.jsonc:7) to match CI expectations.
- Use the repository-wide formatting configuration (`proseWrap`) from [deno.jsonc](deno.jsonc:18) when editing Markdown or documentation snippets.
- Avoid committing generated artifacts (`dist/`, coverage output) excluded in [deno.jsonc](deno.jsonc:12); regenerate them locally when verification is required.

## Testing Strategy

1. Group new specs under descriptive `describe` blocks following patterns in [test/format.utility.test.ts](test/format.utility.test.ts:5) and [test/util.consolidateEntities.test.ts](test/util.consolidateEntities.test.ts:5).
2. Extend chaining coverage using fluent combinations similar to those in [test/format.utility.test.ts](test/format.utility.test.ts:40) when introducing new helpers or modifier interactions.
3. Update entity-focused scenarios in [test/util.consolidateEntities.test.ts](test/util.consolidateEntities.test.ts:147) whenever consolidation logic evolves, ensuring ordering remains stable.
4. Run `deno task test` from [deno.jsonc](deno.jsonc:6) before submission; add regression cases that assert both text and entity offsets wherever bugs previously occurred.

## Documentation Expectations

1. Mirror API documentation and examples between [README.md](README.md:12) and [src/README.md](src/README.md:12); maintain consistent import signatures and sample outputs.
2. Extend inline JSDoc alongside definitions in [src/format.ts](src/format.ts:147) and supporting utilities in [src/util.ts](src/util.ts:1) whenever behavior changes or new helpers are added.
3. Provide additional guidance or caveats surfaced by warnings (for example, channel ID validation) directly in user-facing docs to reduce reliance on runtime console messages.
4. Preserve the prose formatting conventions defined in [deno.jsonc](deno.jsonc:18) so automated `deno fmt` runs remain noise-free.

## Distribution and Release

- The Node build path relies on `deno task build` in [deno.jsonc](deno.jsonc:5) and the CommonJS configuration in [tsconfig.json](tsconfig.json:12); avoid Deno-only globals in exported code.
- `npm run build` bridges to the same pipeline via `deno2node` in [package.json](package.json:22); execute it when exported APIs change to confirm TypeScript declaration output.
- Do not commit `dist/` artifacts or coverage reports; ensure `.gitignore` and clean tasks in [deno.jsonc](deno.jsonc:8) stay untouched unless the distribution strategy changes.
- Coordinate version bumps with documentation updates and changelog notes (if introduced) so publishable metadata in [package.json](package.json:3) matches Deno usage guidance.

## Automation Checklist

- [ ] Run `deno task ok` to cover formatting, linting, tests, and type-checking per [deno.jsonc](deno.jsonc:7).
- [ ] Execute `deno task build` for API or distribution changes to validate Node artifacts in [package.json](package.json:22).
- [ ] Update both READMEs and relevant JSDoc comments whenever surface APIs or examples shift ([README.md](README.md:12), [src/README.md](src/README.md:12), [src/format.ts](src/format.ts:147)).
- [ ] Confirm no unintended files are generated under excluded paths listed in [deno.jsonc](deno.jsonc:12).
