# Parse Mode plugin for grammY

This library provides simplified formatting utilities for the [grammY](https://grammy.dev) Telegram Bot framework. It enables you to compose richly formatted messages using a declarative, type-safe API.

With this plugin, you can:

- Use tagged template literals and formatters (like bold, italic, link, etc) to build formatted messages and captions
- Apply formatting to text and media captions using the fmt function

The plugin is compatible with both Deno and Node.js, and is designed to work as a drop-in enhancement for grammY bots that need robust formatting capabilities.

## Usage (Using fmt)

```ts
import { Bot } from "grammy";
import { fmt, b, u } from "@grammyjs/parse-mode";

const bot = new Bot("");

bot.command("demo", async (ctx) => {
 // Using return values of fmt
 const combined = fmt`${b}bolded${b} ${ctx.msg.text} ${u}underlined${u}`;
 await ctx.reply(combined.text { entities: combined.entities });
 await ctx.replyWithPhoto(photo { caption: combined.caption, caption_entities: combined.caption_entities });
});

bot.start();
```

## Usage (Using FormattedString)

```ts
import { Bot } from "grammy";
import { FormattedString } from "@grammyjs/parse-mode";

const bot = new Bot("");

bot.command("demo", async (ctx) => {
 // Using return values of Fmt
 const combined = FormattedString.b("bolded").plain(ctx.msg.text).u("underlined");
 await ctx.reply(combined.text { entities: combined.entities });
 await ctx.replyWithPhoto(photo { caption: combined.caption, caption_entities: combined.caption_entities });
});

bot.start();
```
