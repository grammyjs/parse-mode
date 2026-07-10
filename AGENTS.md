# Agent Guide

## Project model

`@grammyjs/parse-mode` is a Deno-first TypeScript library for producing Telegram
text plus `MessageEntity[]`. The npm package is generated as CommonJS in `dist/`
with deno2node, so shared source must work in both Deno and Node.

The public barrel is `src/mod.ts`:

- `src/entity-tag.ts` defines the formatting markers consumed by `fmt`.
- `src/format.ts` contains `FormattedString`, `fmt`, and text/entity operations.
- `src/stream-html-to-format.ts` is a stateful, incremental Telegram HTML parser.
- `src/util.ts` contains internal entity comparison, sorting, copying, and
  consolidation rules.

Source imports grammY types only from `./deps.deno.ts`; deno2node rewrites that
path for Node. Keep `deps.deno.ts` and `deps.node.ts` export-compatible and use
type-only imports where possible.

## Invariants to preserve

- Telegram offsets and lengths are JavaScript string indices (UTF-16 code
  units). Use the same semantics as `.length` and `.slice`; an emoji may occupy
  two units.
- Treat `FormattedString` operations as value operations. Text edits must retain,
  clip, rebase, and copy intersecting entities without mutating their inputs.
  Formatting-aware search, split, prefix/suffix checks, and replacement match
  both text and the complete entity set unless an API explicitly says it is
  text-only.
- Entity identity includes type-specific data: link URL, `pre` language, custom
  emoji ID, date-time timestamp/format, and mentioned user. Adjacent or
  overlapping entities consolidate only when this data matches. Returned entity
  order must remain deterministic.
- `fmt` offsets interpolated entities at their insertion point, uses repeated
  tags of the same type as open/close markers, closes remaining tags at the end,
  and consolidates the result.
- `HTMLStreamParser.add` may receive arbitrary chunk boundaries, including in the
  middle of tags, attributes, and entities. Equivalent chunkings must produce
  equivalent output. Preserve the existing plaintext fallback for malformed
  input and keep `toFormattedString()` non-mutating and idempotent.

## Making changes

- A new formatting entity usually requires coordinated updates to its entity-tag
  builder, `FormattedString` static and instance APIs, metadata handling in
  `util.ts`, public JSDoc, and focused tests. Add parser mapping/validation only
  when Telegram HTML supports it.
- Public exports belong in `src/mod.ts`. Keep `README.md` and `src/README.md`
  usage documentation aligned; parser behavior belongs in `docs/HTML.md`.
- Tests use Deno BDD helpers from `test/deps.test.ts`, import source files
  directly, and are grouped by feature. Assert `rawText` and exact entity type,
  offset, length, and type-specific fields. Cover empty/boundary/overlap cases;
  parser changes also need split-chunk and malformed-input cases.

## Commands

Use the tasks in `deno.jsonc`:

```sh
deno task test            # tests (accepts additional Deno test arguments)
deno task check           # type-check the public entry point
deno task ok              # format, lint, test, and type-check
deno task build           # verify the Node build in dist/
```

Run `deno task ok` before handoff. Also run `deno task build` after public API,
dependency-boundary, or cross-runtime changes. `dist/` and coverage outputs are
generated and must not be committed.
