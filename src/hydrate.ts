import type { Context, NextFunction, ParseMode } from "./deps.deno.ts";
import { FormattedString, type Stringable } from "./format.ts";

type Tail<T extends Array<any>> = T extends [head: infer E1, ...tail: infer E2]
  ? E2
  : [];

/**
 * Context flavor for `Context` that will be hydrated with
 * an additional set of reply methods from `hydrateReply`
 */
type ParseModeFlavor<C extends Context> = C & {
  replyFmt: (
    stringLike: Stringable,
    ...args: Tail<Parameters<C["reply"]>>
  ) => ReturnType<C["reply"]>;
  replyWithHTML: C["reply"];
  replyWithMarkdown: C["reply"];
  replyWithMarkdownV1: C["reply"];
  replyWithMarkdownV2: C["reply"];
};

/**
 * @deprecated Use ParseModeFlavor instead of ParseModeContext
 */
type ParseModeContext<C extends Context = Context> = ParseModeFlavor<C>;

const buildReplyWithParseMode = <C extends Context>(
  parseMode: ParseMode,
  ctx: ParseModeFlavor<C>,
) => {
  return (...args: Parameters<C["reply"]>) => {
    const [text, payload, ...rest] = args;
    return ctx.reply(
      text,
      { ...payload, parse_mode: parseMode },
      ...rest as any,
    );
  };
};

/**
 * Hydrates a context with an additional set of reply methods
 * @param ctx The context to hydrate
 * @param next The next middleware function
 */
const middleware = async <C extends Context>(
  ctx: ParseModeFlavor<C>,
  next: NextFunction,
) => {
  ctx.replyFmt = (stringLike, ...args) => {
    const [payload, ...rest] = args;
    const entities = stringLike instanceof FormattedString
      ? { entities: stringLike.entities }
      : undefined;
    return ctx.reply(
      stringLike.toString(),
      { ...payload, ...entities },
      ...rest as any,
    ) as ReturnType<C["reply"]>;
  };

  ctx.replyWithHTML = buildReplyWithParseMode("HTML", ctx);
  ctx.replyWithMarkdown = buildReplyWithParseMode("MarkdownV2", ctx);
  ctx.replyWithMarkdownV1 = buildReplyWithParseMode("Markdown", ctx);
  ctx.replyWithMarkdownV2 = buildReplyWithParseMode("MarkdownV2", ctx);
  await next();
};

export {
  middleware as hydrateReply,
  type ParseModeContext,
  type ParseModeFlavor,
};
