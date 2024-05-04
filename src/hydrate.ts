import type { Context, NextFunction, ParseMode } from "./deps.deno.ts";
import { FormattedString, type Stringable } from "./format.ts";
import {
  InputMediaPhoto,
  InputMediaVideo,
  InputMediaAnimation,
  InputMediaAudio,
  InputMediaDocument,
} from "./deps.deno.ts";

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
  replyFmtWithPhoto: (
    photo: Parameters<C["replyWithPhoto"]>[0],
    options: {
      caption: Stringable;
    } & Omit<Parameters<C["replyWithPhoto"]>[1], "caption">,
    ...args: Tail<Parameters<C["replyWithPhoto"]>>
  ) => ReturnType<C["replyWithPhoto"]>;
  replyFmtWithMediaGroup: (
    media: (Parameters<C["replyWithMediaGroup"]>[0][number] & { caption?: Stringable })[]
  ) => ReturnType<C["replyWithMediaGroup"]>;
  editFmtMessageMedia: (
    media: Parameters<C["editMessageMedia"]>[0] & { caption?: Stringable },
    options?: Omit<Parameters<C["editMessageMedia"]>[1], "caption">
  ) => ReturnType<C["editMessageMedia"]>;
  editFmtMessageText: (
    text: Stringable,
    options?: Parameters<C["editMessageText"]>[1]
  ) => ReturnType<C["editMessageText"]>;
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
const hydrateReply = async <C extends Context>(
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

  ctx.replyFmtWithPhoto = (photo, options, ...args) => {
    const entities = options.caption instanceof FormattedString
      ? { caption_entities: options.caption.entities }
      : undefined;
    return ctx.replyWithPhoto(
      photo,
      {
        caption: options.caption.toString(),
        ...entities,
        ...options,
      },
      ...args
    );
  };

  ctx.replyFmtWithMediaGroup = (media) => {
    const inputMedia = media.map(item => ({
      ...item,
      caption: item.caption?.toString(),
      caption_entities: item.caption instanceof FormattedString
        ? item.caption.entities
        : undefined,
    }));
    return ctx.replyWithMediaGroup(inputMedia);
  };

  ctx.editFmtMessageMedia = (media, options = {}) => {
    const caption_entities = media.caption instanceof FormattedString
      ? media.caption.entities
      : undefined;
    return ctx.editMessageMedia(
      {
        ...media,
        caption: media.caption?.toString(),
        caption_entities,
      },
      options
    );
  };

  ctx.editFmtMessageText = (text, options = {}) => {
    const entities = text instanceof FormattedString
      ? text.entities
      : undefined;
    return ctx.editMessageText(
      text.toString(),
      {
        ...options,
        entities,
      }
    );
  };

  await next();
};

export {
  hydrateReply,
  type ParseModeContext,
  type ParseModeFlavor,
};