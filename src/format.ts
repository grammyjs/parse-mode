import type { MessageEntity } from "./deps.deno.ts";

export interface Stringable {
  toString(): string;
}

class FormattedString implements Stringable {
  text: string;
  entities: MessageEntity[];

  constructor(text: string, entities: MessageEntity[]) {
    this.text = text;
    this.entities = entities;
  }

  toString() {
    return this.text;
  }
}

const unwrap = (stringLike: Stringable): FormattedString => {
  if (stringLike instanceof FormattedString) {
    return stringLike;
  }
  return new FormattedString(stringLike.toString(), []);
};

const buildFormatter = <T extends Array<any> = never>(
  type: MessageEntity["type"],
  ...formatArgKeys: T
) => {
  return (stringLike: Stringable, ...formatArgs: T) => {
    const formattedString = unwrap(stringLike);
    const formatArgObj = Object.fromEntries(
      formatArgKeys.map((formatArgKey, i) => [formatArgKey, formatArgs[i]]),
    );
    return new FormattedString(
      formattedString.text,
      [{
        type,
        offset: 0,
        length: formattedString.text.length,
        ...formatArgObj,
      }, ...formattedString.entities],
    );
  };
};

// Native entity functions
const bold = buildFormatter("bold");
const code = buildFormatter("code");
const italic = buildFormatter("italic");
const link = buildFormatter<[string]>("text_link", "url");
const pre = buildFormatter<[string]>("pre", "language");
const spoiler = buildFormatter("spoiler");
const strikethrough = buildFormatter("strikethrough");
const underline = buildFormatter("underline");

// Utility functions
const mentionUser = (stringLike: Stringable, userId: number) => {
  return link(stringLike, `tg://user?id=${userId}`);
};

const linkMessage = (stringLike: Stringable, chatId: number, messageId: number) => {
  return link(stringLike, `https://t.me/c/${(chatId+ 1000000000000) * -1}/${messageId}`)
}

// Root format function
const fmt = (
  rawStringParts: TemplateStringsArray | string[],
  ...stringLikes: Stringable[]
): FormattedString => {
  let text = rawStringParts[0];
  let entities: MessageEntity[] = [];

  for (let i = 0; i < stringLikes.length; i++) {
    const stringLike = stringLikes[i];
    if (stringLike instanceof FormattedString) {
      entities.push(
        ...stringLike.entities.map((e) => ({
          ...e,
          offset: e.offset + text.length,
        })),
      );
    }
    text += stringLike.toString();
    text += rawStringParts[i + 1];
  }
  return new FormattedString(text, entities);
};

export {
  bold,
  code,
  fmt,
  FormattedString,
  italic,
  link,
  linkMessage,
  mentionUser,
  pre,
  spoiler,
  strikethrough,
  underline,
};
