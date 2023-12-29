# Parse Mode plugin for grammY

This plugin provides a transformer for setting default `parse_mode`, and a middleware for hydrating `Context` with familiar `reply` variant methods - i.e. `replyWithHTML`, `replyWithMarkdown`, etc.

## Usage (Using format)

```ts
import { Bot, Composer, Context } from "grammy";
import { bold, fmt, hydrateReply, italic } from "@grammyjs/parse-mode";
import type { ParseModeFlavor } from "@grammyjs/parse-mode";

const bot = new Bot<ParseModeFlavor<Context>>("");

// Install format reply variant to ctx
bot.use(hydrateReply);

bot.command("demo", async (ctx) => {
  await ctx.replyFmt(fmt`${bold("bold!")}
${bold(italic("bitalic!"))}
${bold(fmt`bold ${link("blink", "example.com")} bold`)}`);

  // fmt can also be called like a regular function
  await ctx.replyFmt(
    fmt(
      ["", " and ", " and ", ""],
      fmt`${bold("bold")}`,
      fmt`${bold(italic("bitalic"))}`,
      fmt`${italic("italic")}`,
    ),
  );
});

bot.start();
```

## Usage (Using default parse mode and utility reply methods)

```ts
import { Bot, Composer, Context } from "grammy";
import { hydrateReply, parseMode } from "@grammyjs/parse-mode";

import type { ParseModeFlavor } from "@grammyjs/parse-mode";

const bot = new Bot<ParseModeFlavor<Context>>("");

// Install familiar reply variants to ctx
bot.use(hydrateReply);

// Sets default parse_mode for ctx.reply
bot.api.config.use(parseMode("MarkdownV2"));

bot.command("demo", async (ctx) => {
  await ctx.reply("*This* is _the_ default `formatting`");
  await ctx.replyWithHTML(
    "<b>This</b> is <i>withHTML</i> <code>formatting</code>",
  );
  await ctx.replyWithMarkdown("*This* is _withMarkdown_ `formatting`");
  await ctx.replyWithMarkdownV1("*This* is _withMarkdownV1_ `formatting`");
  await ctx.replyWithMarkdownV2("*This* is _withMarkdownV2_ `formatting`");
});

bot.start();
```
