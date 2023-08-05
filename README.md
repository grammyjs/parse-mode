# Parse Mode plugin for grammY

This plugin provides transformer that injects `entities` or `caption_entities` if `text` or `caption` are FormattedString. It also provides a middleware that installs this transformer on the `ctx.api` object.

## Usage (Using format)

```ts
import { Bot, Context } from 'grammy';
import { bold, fmt, hydrateReply, italic } from '@grammyjs/parse-mode';
import type { ParseModeFlavor } from '@grammyjs/parse-mode';

const bot = new Bot<ParseModeFlavor<Context>>('');

// Install automatic entities inject from FormattedString transformer
bot.use(hydrateReply());

bot.command('demo', async ctx => {
  const boldText = fmt`This is a ${bold('bolded')} string`;
  await ctx.reply(boldText);

  const underlineText = fmt`This is an ${underline('underlined')}`;
  await ctx.reply(underlineText);

  // fmt can also be use to concat FormattedStrings
  cosnt combinedText = fmt`${boldText}\n${underlineText}`
  await ctx.reply(combinedText);
});

bot.start();
```
