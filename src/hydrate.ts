import type { Context, NextFunction, ParseMode } from "./deps.deno.ts";
import { FormattedString, type Stringable } from "./format.ts";
import {
  InputMedia,
  InputMediaAudio,
  InputMediaDocument,
  InputMediaPhoto,
  InputMediaVideo,
} from "./deps.deno.ts";

type Tail<T extends Array<unknown>> = T extends
  [head: infer E1, ...tail: infer E2] ? E2
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
    other?:
      & Omit<Exclude<Parameters<C["replyWithPhoto"]>[1], undefined>, "caption">
      & {
        caption?: Stringable;
      },
    ...args: Tail<Tail<Parameters<C["replyWithPhoto"]>>>
  ) => ReturnType<C["replyWithPhoto"]>;
  replyFmtWithMediaGroup: (
    media: (Omit<Parameters<C["replyWithMediaGroup"]>[0][number], "caption"> & {
      caption?: Stringable;
    })[],
    other?: Parameters<C["replyWithMediaGroup"]>[1],
    ...args: Tail<Tail<Parameters<C["replyWithMediaGroup"]>>>
  ) => ReturnType<C["replyWithMediaGroup"]>;
  editFmtMessageMedia: (
    media: Omit<Parameters<C["editMessageMedia"]>[0], "caption"> & {
      caption?: Stringable;
    },
    other?: Omit<Parameters<C["editMessageMedia"]>[1], "caption">,
    ...args: Tail<Tail<Parameters<C["editMessageMedia"]>>>
  ) => ReturnType<C["editMessageMedia"]>;
  editFmtMessageText: (
    text: Stringable,
    other?: Parameters<C["editMessageText"]>[1],
    ...args: Tail<Tail<Parameters<C["editMessageText"]>>>
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
      ...rest,
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
      ...rest,
    ) as ReturnType<C["reply"]>;
  };

  ctx.replyWithHTML = buildReplyWithParseMode("HTML", ctx);
  ctx.replyWithMarkdown = buildReplyWithParseMode("MarkdownV2", ctx);
  ctx.replyWithMarkdownV1 = buildReplyWithParseMode("Markdown", ctx);
  ctx.replyWithMarkdownV2 = buildReplyWithParseMode("MarkdownV2", ctx);

  ctx.replyFmtWithPhoto = (photo, other, ...args) => {
    const caption = other?.caption?.toString();
    const caption_entities = other?.caption instanceof FormattedString
      ? other.caption.entities
      : other?.caption_entities;

    return ctx.replyWithPhoto(
      photo,
      {
        ...other,
        caption,
        caption_entities,
      },
      ...args,
    ) as ReturnType<C["replyWithPhoto"]>;
  };

  ctx.replyFmtWithMediaGroup = (media, other, ...args) => {
    const inputMedia = media.map((item) => {
      const caption = item.caption?.toString();
      const caption_entities = item.caption instanceof FormattedString
        ? item.caption.entities
        : item.caption_entities;

      return {
        ...item,
        caption,
        caption_entities,
      };
    }) as readonly (
      | InputMediaAudio
      | InputMediaDocument
      | InputMediaPhoto
      | InputMediaVideo
    )[];
    return ctx.replyWithMediaGroup(inputMedia, other, ...args) as ReturnType<
      C["replyWithMediaGroup"]
    >;
  };

  ctx.editFmtMessageMedia = (media, other, ...args) => {
    const caption = media.caption?.toString();
    const caption_entities = media.caption instanceof FormattedString
      ? media.caption.entities
      : media?.caption_entities;
    return ctx.editMessageMedia(
      {
        ...media,
        caption,
        caption_entities,
      } as InputMedia,
      other,
      ...args,
    ) as ReturnType<C["editMessageMedia"]>;
  };

  ctx.editFmtMessageText = (text, other, ...args) => {
    const entities = text instanceof FormattedString
      ? text.entities
      : other?.entities;
    return ctx.editMessageText(
      text.toString(),
      {
        ...other,
        entities,
      },
      ...args,
    ) as ReturnType<C["editMessageText"]>;
  };

  await next();
};

export { hydrateReply, type ParseModeContext, type ParseModeFlavor };
