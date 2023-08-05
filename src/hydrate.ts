import type {
  Context,
  NextFunction,
} from "./deps.deno.ts";

import { FormattedString } from "./format.ts";
import { parseMode } from './transformer.ts';

type Head<T extends Array<unknown>> = T extends [head: infer E1, ...tail: infer E2]
  ? E1
  : never;

type Tail<T extends Array<unknown>> = T extends [head: infer E1, ...tail: infer E2]
  ? E2
  : [];

/**
 * Context flavor for `Context` that will be hydrated with 
 * an additional set of reply methods from `hydrateReply`
 */
type ParseModeFlavor<C extends Context> = C & {
  editMessageCaption: (
    other?: Head<Parameters<C["editMessageCaption"]>> & { caption?: FormattedString },
    ...args: Tail<Parameters<C["editMessageText"]>>
  ) => ReturnType<C["editMessageCaption"]>;
  editMessageMedia: (
    media: { caption?: FormattedString },
    ...args: Tail<Parameters<C["editMessageMedia"]>>
  ) => ReturnType<C["editMessageMedia"]>;
  editMessageText: (
    text: FormattedString,
    ...args: Tail<Parameters<C["editMessageText"]>>
  ) => ReturnType<C["editMessageText"]>;
  reply: (
    text: FormattedString,
    ...args: Tail<Parameters<C["reply"]>>
  ) => ReturnType<C["reply"]>;
  replyWithAnimation: (
    animation: Head<Parameters<C["replyWithAnimation"]>>,
    other?: Head<Tail<Parameters<C["replyWithAnimation"]>>> & { caption?: FormattedString },
    ...args: Tail<Tail<Parameters<C["replyWithAnimation"]>>>
  ) => ReturnType<C["replyWithAnimation"]>;
  replyWithAudio: (
    audio: Head<Parameters<C["replyWithAudio"]>>,
    other?: Head<Tail<Parameters<C["replyWithAudio"]>>> & { caption?: FormattedString },
    ...args: Tail<Tail<Parameters<C["replyWithAudio"]>>>
  ) => ReturnType<C["replyWithAudio"]>;
  replyWithDocument: (
    document: Head<Parameters<C["replyWithDocument"]>>,
    other?: Head<Tail<Parameters<C["replyWithDocument"]>>> & { caption?: FormattedString },
    ...args: Tail<Tail<Parameters<C["replyWithDocument"]>>>
  ) => ReturnType<C["replyWithDocument"]>;
  replyWithPhoto: (
    photo: Head<Parameters<C["replyWithPhoto"]>>,
    other?: Head<Tail<Parameters<C["replyWithPhoto"]>>> & { caption?: FormattedString },
    ...args: Tail<Tail<Parameters<C["replyWithPhoto"]>>>
  ) => ReturnType<C["replyWithPhoto"]>;
  replyWithVideo: (
    photo: Head<Parameters<C["replyWithVideo"]>>,
    other?: Head<Tail<Parameters<C["replyWithVideo"]>>> & { caption?: FormattedString },
    ...args: Tail<Tail<Parameters<C["replyWithVideo"]>>>
  ) => ReturnType<C["replyWithVideo"]>;
  replyWithVoice: (
    photo: Head<Parameters<C["replyWithVoice"]>>,
    other?: Head<Tail<Parameters<C["replyWithVoice"]>>> & { caption?: FormattedString },
    ...args: Tail<Tail<Parameters<C["replyWithVoice"]>>>
  ) => ReturnType<C["replyWithVoice"]>;
};

/**
 * Hydrates a context with new reply method overloads
 * @param ctx The context to hydrate
 * @param next The next middleware function
 */
const middleware = () => async <C extends Context>(
  ctx: ParseModeFlavor<C>,
  next: NextFunction,
) => {
  ctx.api.config.use(parseMode());
  await next();
};

export { middleware as hydrateReply, type ParseModeFlavor };
