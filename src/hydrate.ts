import type { Context, GrammyTypes, NextFunction } from './deps.deno.ts';

type ParseModeContext<C extends Context = Context> = C & {
  replyWithHTML: C['reply'];
  replyWithMarkdown: C['reply'];
  replyWithMarkdownV1: C['reply'];
  replyWithMarkdownV2: C['reply'];
};

const buildFormattedReply = <C extends ParseModeContext>(parseMode: GrammyTypes.ParseMode, ctx: C) => {
  return (...args: Parameters<C['reply']>) => {
    const [ text, payload, ...rest ] = args;
    return ctx.reply(text, { ...payload, parse_mode: parseMode }, ...rest as any);
  };
};

const middleware = async <C extends ParseModeContext>(ctx: C, next: NextFunction) => {
  ctx.replyWithHTML = buildFormattedReply('HTML', ctx);
  ctx.replyWithMarkdown = buildFormattedReply('MarkdownV2', ctx);
  ctx.replyWithMarkdownV1 = buildFormattedReply('Markdown', ctx);
  ctx.replyWithMarkdownV2 = buildFormattedReply('MarkdownV2', ctx);
  return next();
};

export { middleware as hydrateReply };
export type { ParseModeContext };
