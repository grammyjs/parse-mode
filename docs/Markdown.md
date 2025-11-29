# Markdown (Legacy) Formatting

This document describes the legacy Markdown formatting style supported by the Telegram Bot API and how each syntax element maps to `MessageEntity` types and `FormattedString` methods in this library.

## ⚠️ Deprecation Notice

**Markdown mode is considered legacy.** Telegram recommends using **MarkdownV2** or **HTML** instead for new bots. The legacy Markdown mode has limited formatting options and can be error-prone due to parsing ambiguities.

---

## Overview

The legacy Markdown mode provides basic text formatting with a simplified syntax. It supports fewer formatting options than MarkdownV2 and has different escaping rules.

### Special Characters

The following characters have special meaning and may need escaping:
- `_` (underscore) - italic
- `*` (asterisk) - bold
- `` ` `` (backtick) - code
- `[` and `]` - links

Use `\` to escape these characters when you want them as literal text.

---

## Entity Reference

| Syntax | MessageEntity Type | FormattedString Method |
|--------|-------------------|----------------------|
| `*bold*` | `bold` | `FormattedString.bold()` |
| `_italic_` | `italic` | `FormattedString.italic()` |
| `` `code` `` | `code` | `FormattedString.code()` |
| ` ```pre``` ` | `pre` | `FormattedString.pre()` |
| `[text](url)` | `text_link` | `FormattedString.link(text, url)` |
| `[text](tg://user?id=123)` | `text_link` | `FormattedString.mentionUser(text, userId)` |

### Not Supported in Legacy Markdown

The following formatting options are **NOT available** in legacy Markdown mode:

| Feature | MessageEntity Type | Available in |
|---------|-------------------|--------------|
| Underline | `underline` | MarkdownV2, HTML |
| Strikethrough | `strikethrough` | MarkdownV2, HTML |
| Spoiler | `spoiler` | MarkdownV2, HTML |
| Custom Emoji | `custom_emoji` | MarkdownV2, HTML |
| Blockquote | `blockquote` | MarkdownV2, HTML |
| Expandable Blockquote | `expandable_blockquote` | MarkdownV2, HTML |
| Code with Language | `pre` with `language` | MarkdownV2, HTML |

---

## Detailed Entity Descriptions

### Bold

**Syntax:** `*bold text*`

**MessageEntity:**
```json
{ "type": "bold", "offset": 0, "length": 9 }
```

**FormattedString Usage:**
```typescript
import { fmt, bold, FormattedString } from "@grammyjs/parse-mode";

// Using entity tag
const fromFmt = fmt`${bold}bold text${bold}`;

// Using static method
const fromStatic = FormattedString.bold("bold text");

// Using static method (alias)
const fromAlias = FormattedString.b("bold text");
```

---

### Italic

**Syntax:** `_italic text_`

**MessageEntity:**
```json
{ "type": "italic", "offset": 0, "length": 11 }
```

**FormattedString Usage:**
```typescript
import { fmt, italic, FormattedString } from "@grammyjs/parse-mode";

const fromFmt = fmt`${italic}italic text${italic}`;
const fromStatic = FormattedString.italic("italic text");
const fromAlias = FormattedString.i("italic text"); // alias
```

---

### Inline Code

**Syntax:** `` `inline code` ``

**MessageEntity:**
```json
{ "type": "code", "offset": 0, "length": 11 }
```

**FormattedString Usage:**
```typescript
import { fmt, code, FormattedString } from "@grammyjs/parse-mode";

const fromFmt = fmt`${code}inline code${code}`;
const fromStatic = FormattedString.code("inline code");
```

> **Note:** Code entities cannot be combined with other formatting.

---

### Pre-formatted Code Block

**Syntax:**
````
```
pre-formatted code
```
````

**MessageEntity:**
```json
{ "type": "pre", "offset": 0, "length": 18 }
```

**FormattedString Usage:**
```typescript
import { fmt, pre, FormattedString } from "@grammyjs/parse-mode";

const fromFmt = fmt`${pre()}pre-formatted code${pre}`;
```

> **Note:** Legacy Markdown does **not** support language specification in code blocks. Use MarkdownV2 or HTML if you need syntax highlighting.

---

### Text Link

**Syntax:** `[link text](https://example.com)`

**MessageEntity:**
```json
{ "type": "text_link", "offset": 0, "length": 9, "url": "https://example.com" }
```

**FormattedString Usage:**
```typescript
import { fmt, link, FormattedString } from "@grammyjs/parse-mode";

const fromFmt = fmt`${link("https://example.com")}link text${link}`;
const fromStatic = FormattedString.link("link text", "https://example.com");
const fromAlias = FormattedString.a("link text", "https://example.com"); // alias
```

---

### User Mention (Text Mention)

**Syntax:** `[user name](tg://user?id=123456789)`

**MessageEntity:**
```json
{ "type": "text_link", "offset": 0, "length": 9, "url": "tg://user?id=123456789" }
```

**FormattedString Usage:**
```typescript
import { FormattedString, mentionUser } from "@grammyjs/parse-mode";

const fromFunc = mentionUser("user name", 123456789);
const fromStatic = FormattedString.mentionUser("user name", 123456789);
```

---

## Limitations and Gotchas

### No Nesting Support

Legacy Markdown has **very limited nesting support**:

- You cannot reliably nest bold inside italic or vice versa
- Combining `*` and `_` in complex ways often leads to parsing errors

**Example of problematic syntax:**
```
*_bold italic_* ← May not parse correctly
```

### Escaping Issues

The legacy parser can be finicky about special characters:

- Unmatched `*` or `_` characters may cause the entire message to fail parsing
- Using `\` to escape doesn't always work as expected

### Recommendation

**Use MarkdownV2 or HTML instead.** They offer:

1. More formatting options (underline, strikethrough, spoiler, etc.)
2. Better nesting support
3. More predictable escaping behavior
4. Syntax highlighting for code blocks

---

## Migration to MarkdownV2

If you're using legacy Markdown, here's how to migrate:

| Legacy Markdown | MarkdownV2 | Notes |
|-----------------|------------|-------|
| `*bold*` | `*bold*` | Same syntax |
| `_italic_` | `_italic_` | Same syntax |
| `` `code` `` | `` `code` `` | Same syntax |
| ` ```pre``` ` | ` ```pre``` ` | Same syntax |
| `[text](url)` | `[text](url)` | Same syntax |
| N/A | `__underline__` | New in MarkdownV2 |
| N/A | `~strikethrough~` | New in MarkdownV2 |
| N/A | `\|\|spoiler\|\|` | New in MarkdownV2 |

**Key difference:** MarkdownV2 requires escaping more special characters:
```
_ * [ ] ( ) ~ ` > # + - = | { } . ! \
```

---

## Using FormattedString Instead

The best approach is to use `FormattedString` and entity tags from this library. This completely avoids parsing issues because you're working with `MessageEntity` objects directly:

```typescript
import { fmt, bold, italic, code, link } from "@grammyjs/parse-mode";

// Build formatted text using entity tags
const message = fmt`
${bold}Important:${bold} This is ${italic}formatted${italic} text.
Check out ${link("https://example.com")}this link${link}.
Use ${code}inline code${code} for commands.
`;

// Send using entities (no parse_mode needed)
await ctx.reply(message.text, { entities: message.entities });
```

This approach:
- Works consistently regardless of special characters in your text
- Supports all formatting types (including those not in legacy Markdown)
- Eliminates escaping headaches
- Provides type safety
