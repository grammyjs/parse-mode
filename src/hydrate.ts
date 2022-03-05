import type {
  Context,
  MessageEntity,
  NextFunction,
  ParseMode,
} from "./deps.deno.ts";
import { FormattedString, type Stringable } from "./format.ts";

type Tail<T extends Array<any>> = T extends [head: infer E1, ...tail: infer E2]
  ? E2
  : [];

type ParseModeContext<C extends Context = Context> = C & {
  replyFmt: (
    stringLike: Stringable,
    ...args: Tail<Parameters<C["reply"]>>
  ) => ReturnType<C["reply"]>;
  replyWithHTML: C["reply"];
  replyWithMarkdown: C["reply"];
  replyWithMarkdownV1: C["reply"];
  replyWithMarkdownV2: C["reply"];
};

const buildReplyWithParseMode = <C extends ParseModeContext>(
  parseMode: ParseMode,
  ctx: C,
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

const middleware = async <C extends ParseModeContext>(
  ctx: C,
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
    );
  };

  ctx.replyWithHTML = buildReplyWithParseMode("HTML", ctx);
  ctx.replyWithMarkdown = buildReplyWithParseMode("MarkdownV2", ctx);
  ctx.replyWithMarkdownV1 = buildReplyWithParseMode("Markdown", ctx);
  ctx.replyWithMarkdownV2 = buildReplyWithParseMode("MarkdownV2", ctx);
  return next();
};

export { middleware as hydrateReply, type ParseModeContext };
