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

## Using fmt in media captions

In addition to the existing `replyFmt` method, you can now use the following new methods to apply fmt formatting to media captions:

- `replyFmtWithPhoto(photo, options)`: Send a photo with a formatted caption 
- `replyFmtWithMediaGroup(media)`: Send a media group with formatted captions
- `editFmtMessageMedia(media, options)`: Edit media and formatted caption in a message
- `editFmtMessageText(text, options)`: Edit formatted text in a message

All of these functions are used in the same way as the official functions that do not have Fmt.

```ts
bot.use(hydrateReplyFmt);

await ctx.replyFmtWithPhoto("photo_url", {
  caption: fmt`This is a ${bold("formatted")} caption`,
});

await ctx.replyFmtWithMediaGroup([
  {
    type: "photo",
    media: "photo1_url", 
    caption: fmt`First photo with ${italic("italic")} text`
  },
  {
    type: "photo",
    media: "photo2_url",
    caption: fmt`Second photo with ${code("code")} text` 
  }
]);

await ctx.editFmtMessageMedia(
  {
    type: "photo",
    media: "new_photo_url",  
    caption: fmt`Updated ${bold("caption")}`,  
  },
  { reply_markup: { inline_keyboard: [...] } }
);

await ctx.editFmtMessageText(
  fmt`Edited ${underline("message")} text`,
  { reply_markup: { inline_keyboard: [...] } }  
);
```