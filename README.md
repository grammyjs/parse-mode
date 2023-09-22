# Parse Mode plugin for grammY

This plugin lets you format your messages and captions with **bold**, __italic__, etc in a much more reliable and efficient way than with Markdown or HTML.
It does this by providing a transformer that injects `entities` or `caption_entities` if `text` or `caption` are FormattedString.

## Usage (Using format)

```ts
import { Api, Bot, Context } from "grammy";
import { bold, fmt, hydrateFmt, underline } from "@grammyjs/parse-mode";
import type { ParseModeApiFlavor, ParseModeFlavor } from "@grammyjs/parse-mode";

type MyApi = ParseModeApiFlavor<Api>;
type MyContext = ParseModeFlavor<Context & { api: MyApi }>;
const bot = new Bot<MyContext, MyApi>("");

// Install automatic entities inject from FormattedString transformer
bot.api.config.use(hydrateFmt());

bot.command("demo", async (ctx) => {
  const boldText = fmt`This is a ${bold("bolded")} string`;
  await ctx.reply(boldText);

  const underlineText = fmt`This is an ${underline("underlined")}`;
  await ctx.api.sendMessage(ctx.chat.id, underlineText);

  // fmt can also be use to concat FormattedStrings
  const combinedText = fmt`${boldText}\n${underlineText}`;
  await bot.api.sendMessage(ctx.chat.id, combinedText);
});

bot.start();
```
