# MarkdownV2 Formatting

This document describes the MarkdownV2 formatting style supported by the Telegram Bot API and how each syntax element maps to `MessageEntity` types and `FormattedString` methods in this library.

## Overview

MarkdownV2 is the recommended Markdown-based formatting mode for Telegram bots. It provides a rich set of formatting options with strict escaping rules.

### Special Characters

The following characters must be escaped with a preceding backslash (`\`) when used as literal text:

```
_ * [ ] ( ) ~ ` > # + - = | { } . ! \
```

Inside `pre` and `code` entities, only `` ` `` and `\` need escaping.
Inside inline link URLs `(...)`, only `)` and `\` need escaping.

---

## Entity Reference

| Syntax                        | MessageEntity Type      | FormattedString Method                      |
| ----------------------------- | ----------------------- | ------------------------------------------- |
| `*bold*`                      | `bold`                  | `FormattedString.bold()`                    |
| `_italic_`                    | `italic`                | `FormattedString.italic()`                  |
| `__underline__`               | `underline`             | `FormattedString.underline()`               |
| `~strikethrough~`             | `strikethrough`         | `FormattedString.strikethrough()`           |
| `\|\|spoiler\|\|`             | `spoiler`               | `FormattedString.spoiler()`                 |
| `` `code` ``                  | `code`                  | `FormattedString.code()`                    |
| `` ```pre``` ``               | `pre`                   | `FormattedString.pre()`                     |
| `` ```language\ncode``` ``    | `pre` (with `language`) | `FormattedString.pre(text, "language")`     |
| `[text](url)`                 | `text_link`             | `FormattedString.link(text, url)`           |
| `[text](tg://user?id=123)`    | `text_link`             | `FormattedString.mentionUser(text, userId)` |
| `![emoji](tg://emoji?id=123)` | `custom_emoji`          | `FormattedString.emoji(text, emojiId)`      |
| `>blockquote`                 | `blockquote`            | `FormattedString.blockquote()`              |
| `**>expandable...\|\|`        | `expandable_blockquote` | `FormattedString.expandableBlockquote()`    |

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
import { bold, fmt, FormattedString } from "@grammyjs/parse-mode";

// Using entity tag
const fromFmt = fmt`${bold}bold text${bold}`;

// Using static method
const fromStatic = FormattedString.bold("bold text");

// Using instance method
const fromInstance = new FormattedString("").bold("bold text");
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
import { fmt, FormattedString, italic } from "@grammyjs/parse-mode";

const fromFmt = fmt`${italic}italic text${italic}`;
const fromStatic = FormattedString.italic("italic text");
```

---

### Underline

**Syntax:** `__underline text__`

**MessageEntity:**

```json
{ "type": "underline", "offset": 0, "length": 14 }
```

**FormattedString Usage:**

```typescript
import { fmt, FormattedString, underline } from "@grammyjs/parse-mode";

const fromFmt = fmt`${underline}underline text${underline}`;
const fromStatic = FormattedString.underline("underline text");
```

---

### Strikethrough

**Syntax:** `~strikethrough text~`

**MessageEntity:**

```json
{ "type": "strikethrough", "offset": 0, "length": 18 }
```

**FormattedString Usage:**

```typescript
import { fmt, FormattedString, strikethrough } from "@grammyjs/parse-mode";

const fromFmt = fmt`${strikethrough}strikethrough text${strikethrough}`;
const fromStatic = FormattedString.strikethrough("strikethrough text");
```

---

### Spoiler

**Syntax:** `||spoiler text||`

**MessageEntity:**

```json
{ "type": "spoiler", "offset": 0, "length": 12 }
```

**FormattedString Usage:**

```typescript
import { fmt, FormattedString, spoiler } from "@grammyjs/parse-mode";

const fromFmt = fmt`${spoiler}spoiler text${spoiler}`;
const fromStatic = FormattedString.spoiler("spoiler text");
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
import { code, fmt, FormattedString } from "@grammyjs/parse-mode";

const fromFmt = fmt`${code}inline code${code}`;
const fromStatic = FormattedString.code("inline code");
```

> **Note:** Code entities cannot be combined with other formatting (bold, italic, etc.).

---

### Pre-formatted Code Block

**Syntax:**

````
```
pre-formatted code
```
````

**With language:**

````
```python
print("Hello")
```
````

**MessageEntity:**

```json
{ "type": "pre", "offset": 0, "length": 18 }
{ "type": "pre", "offset": 0, "length": 14, "language": "python" }
```

**FormattedString Usage:**

```typescript
import { fmt, FormattedString, pre } from "@grammyjs/parse-mode";

// Without language
const fromFmt = fmt`${pre()}pre-formatted code${pre}`;

// With language
const fromFmtLang = fmt`${pre("python")}print("Hello")${pre}`;
const fromStatic = FormattedString.pre('print("Hello")', "python");
```

> **Note:** Pre entities cannot be combined with other formatting.

---

### Text Link

**Syntax:** `[link text](https://example.com)`

**MessageEntity:**

```json
{ "type": "text_link", "offset": 0, "length": 9, "url": "https://example.com" }
```

**FormattedString Usage:**

```typescript
import { fmt, FormattedString, link } from "@grammyjs/parse-mode";

const fromFmt = fmt`${link("https://example.com")}link text${link}`;
const fromStatic = FormattedString.link("link text", "https://example.com");
```

---

### User Mention (Text Mention)

**Syntax:** `[user name](tg://user?id=123456789)`

**MessageEntity:**

```json
{
  "type": "text_link",
  "offset": 0,
  "length": 9,
  "url": "tg://user?id=123456789"
}
```

**FormattedString Usage:**

```typescript
import { FormattedString, mentionUser } from "@grammyjs/parse-mode";

const fromFunc = mentionUser("user name", 123456789);
const fromStatic = FormattedString.mentionUser("user name", 123456789);
```

---

### Custom Emoji

**Syntax:** `![👍](tg://emoji?id=5368324170671202286)`

**MessageEntity:**

```json
{
  "type": "custom_emoji",
  "offset": 0,
  "length": 2,
  "custom_emoji_id": "5368324170671202286"
}
```

**FormattedString Usage:**

```typescript
import { emoji, fmt, FormattedString } from "@grammyjs/parse-mode";

const fromFmt = fmt`${emoji("5368324170671202286")}👍${emoji}`;
const fromStatic = FormattedString.emoji("👍", "5368324170671202286");
```

---

### Blockquote

**Syntax:**

```
>Block quotation started
>Block quotation continued
```

**MessageEntity:**

```json
{ "type": "blockquote", "offset": 0, "length": 52 }
```

**FormattedString Usage:**

```typescript
import { blockquote, fmt, FormattedString } from "@grammyjs/parse-mode";

const fromFmt = fmt`${blockquote}Block quotation text${blockquote}`;
const fromStatic = FormattedString.blockquote("Block quotation text");
```

---

### Expandable Blockquote

**Syntax:**

```
**>Expandable block quotation started
>Expandable block quotation continued
>The last line of the block quotation||
```

**MessageEntity:**

```json
{ "type": "expandable_blockquote", "offset": 0, "length": 108 }
```

**FormattedString Usage:**

```typescript
import {
  expandableBlockquote,
  fmt,
  FormattedString,
} from "@grammyjs/parse-mode";

const fromFmt =
  fmt`${expandableBlockquote}Expandable quotation${expandableBlockquote}`;
const fromStatic = FormattedString.expandableBlockquote("Expandable quotation");
```

---

## Nesting Rules

MarkdownV2 supports limited nesting of entities:

- **Allowed nesting:** Bold, italic, underline, strikethrough, and spoiler can be nested within each other
- **Cannot nest:** `code` and `pre` entities cannot contain or be contained by other formatting
- **Blockquotes:** Cannot be nested within other blockquotes

### Example: Nested Formatting

```typescript
import { bold, fmt, italic } from "@grammyjs/parse-mode";

// Bold italic text
const boldItalic = fmt`${bold}${italic}bold and italic${italic}${bold}`;
```

**MarkdownV2 equivalent:** `*_bold and italic_*`
