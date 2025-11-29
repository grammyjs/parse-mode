# HTML Formatting

This document describes the HTML formatting style supported by the Telegram Bot API and how each HTML element maps to `MessageEntity` types and `FormattedString` methods in this library.

## Overview

HTML is a flexible formatting mode that uses familiar HTML tags. It's often easier to work with than MarkdownV2 because it doesn't require escaping as many special characters.

### Special Characters

The following characters must be replaced with HTML entities:

| Character | HTML Entity |
|-----------|-------------|
| `<` | `&lt;` |
| `>` | `&gt;` |
| `&` | `&amp;` |

All other HTML entities (numeric or named) are supported.

---

## Entity Reference

| HTML Tag | MessageEntity Type | FormattedString Method |
|----------|-------------------|----------------------|
| `<b>`, `<strong>` | `bold` | `FormattedString.bold()` |
| `<i>`, `<em>` | `italic` | `FormattedString.italic()` |
| `<u>`, `<ins>` | `underline` | `FormattedString.underline()` |
| `<s>`, `<strike>`, `<del>` | `strikethrough` | `FormattedString.strikethrough()` |
| `<span class="tg-spoiler">`, `<tg-spoiler>` | `spoiler` | `FormattedString.spoiler()` |
| `<code>` | `code` | `FormattedString.code()` |
| `<pre>` | `pre` | `FormattedString.pre()` |
| `<pre><code class="language-xxx">` | `pre` (with `language`) | `FormattedString.pre(text, "xxx")` |
| `<a href="url">` | `text_link` | `FormattedString.link(text, url)` |
| `<a href="tg://user?id=123">` | `text_link` | `FormattedString.mentionUser(text, userId)` |
| `<tg-emoji emoji-id="123">` | `custom_emoji` | `FormattedString.emoji(text, emojiId)` |
| `<blockquote>` | `blockquote` | `FormattedString.blockquote()` |
| `<blockquote expandable>` | `expandable_blockquote` | `FormattedString.expandableBlockquote()` |

---

## Detailed Entity Descriptions

### Bold

**HTML Syntax:**
```html
<b>bold text</b>
<strong>bold text</strong>
```

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

**HTML Syntax:**
```html
<i>italic text</i>
<em>italic text</em>
```

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

### Underline

**HTML Syntax:**
```html
<u>underline text</u>
<ins>underline text</ins>
```

**MessageEntity:**
```json
{ "type": "underline", "offset": 0, "length": 14 }
```

**FormattedString Usage:**
```typescript
import { fmt, underline, FormattedString } from "@grammyjs/parse-mode";

const fromFmt = fmt`${underline}underline text${underline}`;
const fromStatic = FormattedString.underline("underline text");
const fromAlias = FormattedString.u("underline text"); // alias
```

---

### Strikethrough

**HTML Syntax:**
```html
<s>strikethrough text</s>
<strike>strikethrough text</strike>
<del>strikethrough text</del>
```

**MessageEntity:**
```json
{ "type": "strikethrough", "offset": 0, "length": 18 }
```

**FormattedString Usage:**
```typescript
import { fmt, strikethrough, FormattedString } from "@grammyjs/parse-mode";

const fromFmt = fmt`${strikethrough}strikethrough text${strikethrough}`;
const fromStatic = FormattedString.strikethrough("strikethrough text");
const fromAlias = FormattedString.s("strikethrough text"); // alias
```

---

### Spoiler

**HTML Syntax:**
```html
<span class="tg-spoiler">spoiler text</span>
<tg-spoiler>spoiler text</tg-spoiler>
```

**MessageEntity:**
```json
{ "type": "spoiler", "offset": 0, "length": 12 }
```

**FormattedString Usage:**
```typescript
import { fmt, spoiler, FormattedString } from "@grammyjs/parse-mode";

const fromFmt = fmt`${spoiler}spoiler text${spoiler}`;
const fromStatic = FormattedString.spoiler("spoiler text");
```

---

### Inline Code

**HTML Syntax:**
```html
<code>inline code</code>
```

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

> **Note:** Code entities cannot be combined with other formatting (bold, italic, etc.).

---

### Pre-formatted Code Block

**HTML Syntax (without language):**
```html
<pre>pre-formatted code</pre>
```

**HTML Syntax (with language):**
```html
<pre><code class="language-python">print("Hello")</code></pre>
```

**MessageEntity:**
```json
{ "type": "pre", "offset": 0, "length": 18 }
{ "type": "pre", "offset": 0, "length": 14, "language": "python" }
```

**FormattedString Usage:**
```typescript
import { fmt, pre, FormattedString } from "@grammyjs/parse-mode";

// Without language
const fromFmt = fmt`${pre()}pre-formatted code${pre}`;

// With language
const fromFmtLang = fmt`${pre("python")}print("Hello")${pre}`;
const fromStatic = FormattedString.pre('print("Hello")', "python");
```

> **Note:** Pre entities cannot be combined with other formatting.

---

### Text Link

**HTML Syntax:**
```html
<a href="https://example.com">link text</a>
```

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

**HTML Syntax:**
```html
<a href="tg://user?id=123456789">user name</a>
```

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

### Custom Emoji

**HTML Syntax:**
```html
<tg-emoji emoji-id="5368324170671202286">👍</tg-emoji>
```

**MessageEntity:**
```json
{ "type": "custom_emoji", "offset": 0, "length": 2, "custom_emoji_id": "5368324170671202286" }
```

**FormattedString Usage:**
```typescript
import { fmt, emoji, FormattedString } from "@grammyjs/parse-mode";

const fromFmt = fmt`${emoji("5368324170671202286")}👍${emoji}`;
const fromStatic = FormattedString.emoji("👍", "5368324170671202286");
```

---

### Blockquote

**HTML Syntax:**
```html
<blockquote>Block quotation text</blockquote>
```

**MessageEntity:**
```json
{ "type": "blockquote", "offset": 0, "length": 20 }
```

**FormattedString Usage:**
```typescript
import { fmt, blockquote, FormattedString } from "@grammyjs/parse-mode";

const fromFmt = fmt`${blockquote}Block quotation text${blockquote}`;
const fromStatic = FormattedString.blockquote("Block quotation text");
```

---

### Expandable Blockquote

**HTML Syntax:**
```html
<blockquote expandable>Expandable quotation text</blockquote>
```

**MessageEntity:**
```json
{ "type": "expandable_blockquote", "offset": 0, "length": 25 }
```

**FormattedString Usage:**
```typescript
import { fmt, expandableBlockquote, FormattedString } from "@grammyjs/parse-mode";

const fromFmt = fmt`${expandableBlockquote}Expandable quotation text${expandableBlockquote}`;
const fromStatic = FormattedString.expandableBlockquote("Expandable quotation text");
```

---

## Nesting Rules

HTML supports rich nesting of formatting elements:

- **Allowed nesting:** `<b>`, `<i>`, `<u>`, `<s>`, `<span class="tg-spoiler">`, and `<a>` can be nested within each other
- **Cannot nest:** `<code>` and `<pre>` elements cannot contain or be contained by other formatting
- **Blockquotes:** Can contain other formatting but cannot be nested within other blockquotes

### Example: Nested Formatting

```html
<b><i>bold and italic</i></b>
<u><b>underlined bold</b></u>
```

```typescript
import { fmt, bold, italic, underline } from "@grammyjs/parse-mode";

// Bold italic text
const boldItalic = fmt`${bold}${italic}bold and italic${italic}${bold}`;

// Underlined bold text
const underlinedBold = fmt`${underline}${bold}underlined bold${bold}${underline}`;
```

---

## Unsupported HTML

Only the tags listed above are supported. All other HTML tags will be ignored or may cause parsing errors:

- No support for `<br>`, `<p>`, `<div>`, `<span>` (except with `tg-spoiler` class)
- No support for CSS styling via `style` attribute
- No support for `<img>`, `<video>`, or other media tags
- Attributes other than those specified above are ignored
