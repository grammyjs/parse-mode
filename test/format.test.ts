import { assertEquals, assertInstanceOf, describe, it } from "./deps.test.ts";
import { FormattedString } from "../src/format.ts";
import type { MessageEntity } from "../src/deps.deno.ts";

describe("FormattedString - Basic functionality", () => {
  it("Constructor", () => {
    const text = "Hello World";
    const entities: MessageEntity[] = [
      { type: "bold" as const, offset: 0, length: 5 },
    ];

    const formatted = new FormattedString(text, entities);

    assertEquals(formatted.rawText, text);
    assertEquals(formatted.rawEntities, entities);
  });

  it("Text and caption getters", () => {
    const text = "Hello World";
    const entities: MessageEntity[] = [
      { type: "bold" as const, offset: 0, length: 5 },
    ];

    const formatted = new FormattedString(text, entities);

    assertEquals(formatted.text, text);
    assertEquals(formatted.caption, text);
    assertEquals(formatted.entities, entities);
    assertEquals(formatted.caption_entities, entities);
  });

  it("toString method", () => {
    const text = "Hello World";
    const entities: MessageEntity[] = [
      { type: "bold" as const, offset: 0, length: 5 },
    ];

    const formatted = new FormattedString(text, entities);

    assertEquals(formatted.toString(), text);
  });
});

describe("FormattedString - Static formatting methods", () => {
  it("Static bold methods", () => {
    const text = "bold text";

    const boldFormatted = FormattedString.bold(text);
    const bFormatted = FormattedString.b(text);

    assertInstanceOf(boldFormatted, FormattedString);
    assertInstanceOf(bFormatted, FormattedString);
    assertEquals(boldFormatted.rawText, text);
    assertEquals(bFormatted.rawText, text);

    // Test entity properties
    assertEquals(boldFormatted.rawEntities.length, 1);
    assertEquals(boldFormatted.rawEntities[0]?.type, "bold");
    assertEquals(boldFormatted.rawEntities[0]?.offset, 0);
    assertEquals(boldFormatted.rawEntities[0]?.length, text.length);

    assertEquals(bFormatted.rawEntities.length, 1);
    assertEquals(bFormatted.rawEntities[0]?.type, "bold");
    assertEquals(bFormatted.rawEntities[0]?.offset, 0);
    assertEquals(bFormatted.rawEntities[0]?.length, text.length);
  });

  it("Static italic methods", () => {
    const text = "italic text";

    const italicFormatted = FormattedString.italic(text);
    const iFormatted = FormattedString.i(text);

    assertInstanceOf(italicFormatted, FormattedString);
    assertInstanceOf(iFormatted, FormattedString);
    assertEquals(italicFormatted.rawText, text);
    assertEquals(iFormatted.rawText, text);

    // Test entity properties
    assertEquals(italicFormatted.rawEntities.length, 1);
    assertEquals(italicFormatted.rawEntities[0]?.type, "italic");
    assertEquals(italicFormatted.rawEntities[0]?.offset, 0);
    assertEquals(italicFormatted.rawEntities[0]?.length, text.length);

    assertEquals(iFormatted.rawEntities.length, 1);
    assertEquals(iFormatted.rawEntities[0]?.type, "italic");
    assertEquals(iFormatted.rawEntities[0]?.offset, 0);
    assertEquals(iFormatted.rawEntities[0]?.length, text.length);
  });

  it("Static strikethrough methods", () => {
    const text = "strikethrough text";

    const strikethroughFormatted = FormattedString.strikethrough(text);
    const sFormatted = FormattedString.s(text);

    assertInstanceOf(strikethroughFormatted, FormattedString);
    assertInstanceOf(sFormatted, FormattedString);
    assertEquals(strikethroughFormatted.rawText, text);
    assertEquals(sFormatted.rawText, text);

    // Test entity properties
    assertEquals(strikethroughFormatted.rawEntities.length, 1);
    assertEquals(strikethroughFormatted.rawEntities[0]?.type, "strikethrough");
    assertEquals(strikethroughFormatted.rawEntities[0]?.offset, 0);
    assertEquals(strikethroughFormatted.rawEntities[0]?.length, text.length);

    assertEquals(sFormatted.rawEntities.length, 1);
    assertEquals(sFormatted.rawEntities[0]?.type, "strikethrough");
    assertEquals(sFormatted.rawEntities[0]?.offset, 0);
    assertEquals(sFormatted.rawEntities[0]?.length, text.length);
  });

  it("Static underline methods", () => {
    const text = "underline text";

    const underlineFormatted = FormattedString.underline(text);
    const uFormatted = FormattedString.u(text);

    assertInstanceOf(underlineFormatted, FormattedString);
    assertInstanceOf(uFormatted, FormattedString);
    assertEquals(underlineFormatted.rawText, text);
    assertEquals(uFormatted.rawText, text);

    // Test entity properties
    assertEquals(underlineFormatted.rawEntities.length, 1);
    assertEquals(underlineFormatted.rawEntities[0]?.type, "underline");
    assertEquals(underlineFormatted.rawEntities[0]?.offset, 0);
    assertEquals(underlineFormatted.rawEntities[0]?.length, text.length);

    assertEquals(uFormatted.rawEntities.length, 1);
    assertEquals(uFormatted.rawEntities[0]?.type, "underline");
    assertEquals(uFormatted.rawEntities[0]?.offset, 0);
    assertEquals(uFormatted.rawEntities[0]?.length, text.length);
  });
});

describe("FormattedString - Static special methods", () => {
  it("Static link methods", () => {
    const text = "link text";
    const url = "https://example.com";

    const linkFormatted = FormattedString.link(text, url);
    const aFormatted = FormattedString.a(text, url);

    assertInstanceOf(linkFormatted, FormattedString);
    assertInstanceOf(aFormatted, FormattedString);
    assertEquals(linkFormatted.rawText, text);
    assertEquals(aFormatted.rawText, text);

    // Test entity properties
    assertEquals(linkFormatted.rawEntities.length, 1);
    assertEquals(linkFormatted.rawEntities[0]?.type, "text_link");
    assertEquals(linkFormatted.rawEntities[0]?.offset, 0);
    assertEquals(linkFormatted.rawEntities[0]?.length, text.length);
    //@ts-expect-error quick test
    assertEquals(linkFormatted.rawEntities[0]?.url, url);

    assertEquals(aFormatted.rawEntities.length, 1);
    assertEquals(aFormatted.rawEntities[0]?.type, "text_link");
    assertEquals(aFormatted.rawEntities[0]?.offset, 0);
    assertEquals(aFormatted.rawEntities[0]?.length, text.length);
    //@ts-expect-error quick test
    assertEquals(aFormatted.rawEntities[0]?.url, url);
  });

  it("Static code method", () => {
    const text = "code text";

    const codeFormatted = FormattedString.code(text);

    assertInstanceOf(codeFormatted, FormattedString);
    assertEquals(codeFormatted.rawText, text);

    // Test entity properties
    assertEquals(codeFormatted.rawEntities.length, 1);
    assertEquals(codeFormatted.rawEntities[0]?.type, "code");
    assertEquals(codeFormatted.rawEntities[0]?.offset, 0);
    assertEquals(codeFormatted.rawEntities[0]?.length, text.length);
  });

  it("Static pre method", () => {
    const text = "console.log('hello');";
    const language = "javascript";

    const preFormatted = FormattedString.pre(text, language);

    assertInstanceOf(preFormatted, FormattedString);
    assertEquals(preFormatted.rawText, text);

    // Test entity properties
    assertEquals(preFormatted.rawEntities.length, 1);
    assertEquals(preFormatted.rawEntities[0]?.type, "pre");
    assertEquals(preFormatted.rawEntities[0]?.offset, 0);
    assertEquals(preFormatted.rawEntities[0]?.length, text.length);
    //@ts-expect-error quick test
    assertEquals(preFormatted.rawEntities[0]?.language, language);
  });

  it("Static spoiler method", () => {
    const text = "spoiler text";

    const spoilerFormatted = FormattedString.spoiler(text);

    assertInstanceOf(spoilerFormatted, FormattedString);
    assertEquals(spoilerFormatted.rawText, text);

    // Test entity properties
    assertEquals(spoilerFormatted.rawEntities.length, 1);
    assertEquals(spoilerFormatted.rawEntities[0]?.type, "spoiler");
    assertEquals(spoilerFormatted.rawEntities[0]?.offset, 0);
    assertEquals(spoilerFormatted.rawEntities[0]?.length, text.length);
  });

  it("Static blockquote method", () => {
    const text = "quoted text";

    const blockquoteFormatted = FormattedString.blockquote(text);

    assertInstanceOf(blockquoteFormatted, FormattedString);
    assertEquals(blockquoteFormatted.rawText, text);

    // Test entity properties
    assertEquals(blockquoteFormatted.rawEntities.length, 1);
    assertEquals(blockquoteFormatted.rawEntities[0]?.type, "blockquote");
    assertEquals(blockquoteFormatted.rawEntities[0]?.offset, 0);
    assertEquals(blockquoteFormatted.rawEntities[0]?.length, text.length);
  });

  it("Static expandableBlockquote method", () => {
    const text = "expandable quoted text";

    const expandableBlockquoteFormatted = FormattedString.expandableBlockquote(
      text,
    );

    assertInstanceOf(expandableBlockquoteFormatted, FormattedString);
    assertEquals(expandableBlockquoteFormatted.rawText, text);

    // Test entity properties
    assertEquals(expandableBlockquoteFormatted.rawEntities.length, 1);
    assertEquals(
      expandableBlockquoteFormatted.rawEntities[0]?.type,
      "expandable_blockquote",
    );
    assertEquals(expandableBlockquoteFormatted.rawEntities[0]?.offset, 0);
    assertEquals(
      expandableBlockquoteFormatted.rawEntities[0]?.length,
      text.length,
    );
  });

  it("Static mentionUser method", () => {
    const text = "@username";
    const userId = 123456789;

    const mentionFormatted = FormattedString.mentionUser(text, userId);

    assertInstanceOf(mentionFormatted, FormattedString);
    assertEquals(mentionFormatted.rawText, text);

    // Test entity properties
    assertEquals(mentionFormatted.rawEntities.length, 1);
    assertEquals(mentionFormatted.rawEntities[0]?.type, "text_link");
    assertEquals(mentionFormatted.rawEntities[0]?.offset, 0);
    assertEquals(mentionFormatted.rawEntities[0]?.length, text.length);
    assertEquals(
      //@ts-expect-error quick test
      mentionFormatted.rawEntities[0]?.url,
      `tg://user?id=123456789`,
    );
  });

  it("Static customEmoji method", () => {
    const placeholder = "😀";
    const emojiId = "5123456789123456789";

    const emojiFormatted = FormattedString.customEmoji(placeholder, emojiId);

    assertInstanceOf(emojiFormatted, FormattedString);
    assertEquals(emojiFormatted.rawText, placeholder);

    // Test entity properties
    assertEquals(emojiFormatted.rawEntities.length, 1);
    assertEquals(emojiFormatted.rawEntities[0]?.type, "text_link");
    assertEquals(emojiFormatted.rawEntities[0]?.offset, 0);
    assertEquals(emojiFormatted.rawEntities[0]?.length, placeholder.length);
    assertEquals(
      //@ts-expect-error quick test
      emojiFormatted.rawEntities[0]?.url,
      `tg://emoji?id=5123456789123456789`,
    );
  });

  it("Static linkMessage method for valid supergroup", () => {
    const text = "message link";
    const chatId = -1001234567890;
    const messageId = 123;

    const messageLinkFormatted = FormattedString.linkMessage(
      text,
      chatId,
      messageId,
    );

    assertInstanceOf(messageLinkFormatted, FormattedString);
    assertEquals(messageLinkFormatted.rawText, text);

    // Test entity properties
    assertEquals(messageLinkFormatted.rawEntities.length, 1);
    assertEquals(messageLinkFormatted.rawEntities[0]?.type, "text_link");
    assertEquals(messageLinkFormatted.rawEntities[0]?.offset, 0);
    assertEquals(messageLinkFormatted.rawEntities[0]?.length, text.length);
    assertEquals(
      //@ts-expect-error quick test
      messageLinkFormatted.rawEntities[0]?.url,
      `https://t.me/c/1234567890/123`,
    );
  });

  it("Static linkMessage method for invalid chat (positive ID)", () => {
    const text = "message link";
    const chatId = 1234567890; // Positive chat ID (private chat)
    const messageId = 123;

    const messageLinkFormatted = FormattedString.linkMessage(
      text,
      chatId,
      messageId,
    );

    assertInstanceOf(messageLinkFormatted, FormattedString);
    assertEquals(messageLinkFormatted.rawText, text);
    // Should not create a link for private chats
    assertEquals(messageLinkFormatted.rawEntities.length, 0);
  });
});

describe("FormattedString", () => {
  it("Instance bold methods", () => {
    const initialText = "Hello ";
    const boldText = "World";
    const initialFormatted = new FormattedString(initialText, []);

    const boldResult = initialFormatted.bold(boldText);
    const bResult = initialFormatted.b(boldText);

    assertInstanceOf(boldResult, FormattedString);
    assertInstanceOf(bResult, FormattedString);
    assertEquals(boldResult.rawText, `${initialText}${boldText}`);
    assertEquals(bResult.rawText, `${initialText}${boldText}`);

    // Test entity properties
    assertEquals(boldResult.rawEntities.length, 1);
    assertEquals(boldResult.rawEntities[0]?.type, "bold");
    assertEquals(boldResult.rawEntities[0]?.offset, initialText.length);
    assertEquals(boldResult.rawEntities[0]?.length, boldText.length);

    assertEquals(bResult.rawEntities.length, 1);
    assertEquals(bResult.rawEntities[0]?.type, "bold");
    assertEquals(bResult.rawEntities[0]?.offset, initialText.length);
    assertEquals(bResult.rawEntities[0]?.length, boldText.length);
  });

  it("Instance italic methods", () => {
    const initialText = "Hello ";
    const italicText = "World";
    const initialFormatted = new FormattedString(initialText, []);

    const italicResult = initialFormatted.italic(italicText);
    const iResult = initialFormatted.i(italicText);

    assertInstanceOf(italicResult, FormattedString);
    assertInstanceOf(iResult, FormattedString);
    assertEquals(italicResult.rawText, `${initialText}${italicText}`);
    assertEquals(iResult.rawText, `${initialText}${italicText}`);

    // Test entity properties
    assertEquals(italicResult.rawEntities.length, 1);
    assertEquals(italicResult.rawEntities[0]?.type, "italic");
    assertEquals(italicResult.rawEntities[0]?.offset, initialText.length);
    assertEquals(italicResult.rawEntities[0]?.length, italicText.length);

    assertEquals(iResult.rawEntities.length, 1);
    assertEquals(iResult.rawEntities[0]?.type, "italic");
    assertEquals(iResult.rawEntities[0]?.offset, initialText.length);
    assertEquals(iResult.rawEntities[0]?.length, italicText.length);
  });

  it("Instance strikethrough methods", () => {
    const initialText = "Hello ";
    const strikeText = "World";
    const initialFormatted = new FormattedString(initialText, []);

    const strikeResult = initialFormatted.strikethrough(strikeText);
    const sResult = initialFormatted.s(strikeText);

    assertInstanceOf(strikeResult, FormattedString);
    assertInstanceOf(sResult, FormattedString);
    assertEquals(strikeResult.rawText, `${initialText}${strikeText}`);
    assertEquals(sResult.rawText, `${initialText}${strikeText}`);

    // Test entity properties
    assertEquals(strikeResult.rawEntities.length, 1);
    assertEquals(strikeResult.rawEntities[0]?.type, "strikethrough");
    assertEquals(strikeResult.rawEntities[0]?.offset, initialText.length);
    assertEquals(strikeResult.rawEntities[0]?.length, strikeText.length);

    assertEquals(sResult.rawEntities.length, 1);
    assertEquals(sResult.rawEntities[0]?.type, "strikethrough");
    assertEquals(sResult.rawEntities[0]?.offset, initialText.length);
    assertEquals(sResult.rawEntities[0]?.length, strikeText.length);
  });

  it("Instance underline methods", () => {
    const initialText = "Hello ";
    const underlineText = "World";
    const initialFormatted = new FormattedString(initialText, []);

    const underlineResult = initialFormatted.underline(underlineText);
    const uResult = initialFormatted.u(underlineText);

    assertInstanceOf(underlineResult, FormattedString);
    assertInstanceOf(uResult, FormattedString);
    assertEquals(underlineResult.rawText, `${initialText}${underlineText}`);
    assertEquals(uResult.rawText, `${initialText}${underlineText}`);

    // Test entity properties
    assertEquals(underlineResult.rawEntities.length, 1);
    assertEquals(underlineResult.rawEntities[0]?.type, "underline");
    assertEquals(underlineResult.rawEntities[0]?.offset, initialText.length);
    assertEquals(underlineResult.rawEntities[0]?.length, underlineText.length);

    assertEquals(uResult.rawEntities.length, 1);
    assertEquals(uResult.rawEntities[0]?.type, "underline");
    assertEquals(uResult.rawEntities[0]?.offset, initialText.length);
    assertEquals(uResult.rawEntities[0]?.length, underlineText.length);
  });

  it("Instance link methods", () => {
    const initialText = "Visit ";
    const linkText = "our website";
    const url = "https://example.com";
    const initialFormatted = new FormattedString(initialText, []);

    const linkResult = initialFormatted.link(linkText, url);
    const aResult = initialFormatted.a(linkText, url);

    assertInstanceOf(linkResult, FormattedString);
    assertInstanceOf(aResult, FormattedString);
    assertEquals(linkResult.rawText, `${initialText}${linkText}`);
    assertEquals(aResult.rawText, `${initialText}${linkText}`);

    // Test entity properties
    assertEquals(linkResult.rawEntities.length, 1);
    assertEquals(linkResult.rawEntities[0]?.type, "text_link");
    assertEquals(linkResult.rawEntities[0]?.offset, initialText.length);
    assertEquals(linkResult.rawEntities[0]?.length, linkText.length);
    //@ts-expect-error quick test
    assertEquals(linkResult.rawEntities[0]?.url, url);

    assertEquals(aResult.rawEntities.length, 1);
    assertEquals(aResult.rawEntities[0]?.type, "text_link");
    assertEquals(aResult.rawEntities[0]?.offset, initialText.length);
    assertEquals(aResult.rawEntities[0]?.length, linkText.length);
    //@ts-expect-error quick test
    assertEquals(aResult.rawEntities[0]?.url, url);
  });

  it("Instance code method", () => {
    const initialText = "Run ";
    const codeText = "npm install";
    const initialFormatted = new FormattedString(initialText, []);

    const codeResult = initialFormatted.code(codeText);

    assertInstanceOf(codeResult, FormattedString);
    assertEquals(codeResult.rawText, `${initialText}${codeText}`);

    // Test entity properties
    assertEquals(codeResult.rawEntities.length, 1);
    assertEquals(codeResult.rawEntities[0]?.type, "code");
    assertEquals(codeResult.rawEntities[0]?.offset, initialText.length);
    assertEquals(codeResult.rawEntities[0]?.length, codeText.length);
  });

  it("Instance pre method", () => {
    const initialText = "Code example:\n";
    const preText = "console.log('hello');";
    const language = "javascript";
    const initialFormatted = new FormattedString(initialText, []);

    const preResult = initialFormatted.pre(preText, language);

    assertInstanceOf(preResult, FormattedString);
    assertEquals(preResult.rawText, `${initialText}${preText}`);

    // Test entity properties
    assertEquals(preResult.rawEntities.length, 1);
    assertEquals(preResult.rawEntities[0]?.type, "pre");
    assertEquals(preResult.rawEntities[0]?.offset, initialText.length);
    assertEquals(preResult.rawEntities[0]?.length, preText.length);
    //@ts-expect-error quick test
    assertEquals(preResult.rawEntities[0]?.language, language);
  });

  it("Instance spoiler method", () => {
    const initialText = "Spoiler alert: ";
    const spoilerText = "secret text";
    const initialFormatted = new FormattedString(initialText, []);

    const spoilerResult = initialFormatted.spoiler(spoilerText);

    assertInstanceOf(spoilerResult, FormattedString);
    assertEquals(spoilerResult.rawText, `${initialText}${spoilerText}`);

    // Test entity properties
    assertEquals(spoilerResult.rawEntities.length, 1);
    assertEquals(spoilerResult.rawEntities[0]?.type, "spoiler");
    assertEquals(spoilerResult.rawEntities[0]?.offset, initialText.length);
    assertEquals(spoilerResult.rawEntities[0]?.length, spoilerText.length);
  });

  it("Instance blockquote method", () => {
    const initialText = "As they say: ";
    const quoteText = "To be or not to be";
    const initialFormatted = new FormattedString(initialText, []);

    const quoteResult = initialFormatted.blockquote(quoteText);

    assertInstanceOf(quoteResult, FormattedString);
    assertEquals(quoteResult.rawText, `${initialText}${quoteText}`);

    // Test entity properties
    assertEquals(quoteResult.rawEntities.length, 1);
    assertEquals(quoteResult.rawEntities[0]?.type, "blockquote");
    assertEquals(quoteResult.rawEntities[0]?.offset, initialText.length);
    assertEquals(quoteResult.rawEntities[0]?.length, quoteText.length);
  });

  it("Instance expandableBlockquote method", () => {
    const initialText = "Long quote: ";
    const quoteText = "This is a very long quote that should be expandable";
    const initialFormatted = new FormattedString(initialText, []);

    const quoteResult = initialFormatted.expandableBlockquote(quoteText);

    assertInstanceOf(quoteResult, FormattedString);
    assertEquals(quoteResult.rawText, `${initialText}${quoteText}`);

    // Test entity properties
    assertEquals(quoteResult.rawEntities.length, 1);
    assertEquals(quoteResult.rawEntities[0]?.type, "expandable_blockquote");
    assertEquals(quoteResult.rawEntities[0]?.offset, initialText.length);
    assertEquals(quoteResult.rawEntities[0]?.length, quoteText.length);
  });

  it("Instance mentionUser method", () => {
    const initialText = "Hello ";
    const mentionText = "@user";
    const userId = 123456789;
    const initialFormatted = new FormattedString(initialText, []);

    const mentionResult = initialFormatted.mentionUser(mentionText, userId);

    assertInstanceOf(mentionResult, FormattedString);
    assertEquals(mentionResult.rawText, `${initialText}${mentionText}`);

    // Test entity properties
    assertEquals(mentionResult.rawEntities.length, 1);
    assertEquals(mentionResult.rawEntities[0]?.type, "text_link");
    assertEquals(mentionResult.rawEntities[0]?.offset, initialText.length);
    assertEquals(mentionResult.rawEntities[0]?.length, mentionText.length);
    //@ts-expect-error quick test
    assertEquals(mentionResult.rawEntities[0]?.url, `tg://user?id=123456789`);
  });

  it("Instance customEmoji method", () => {
    const initialText = "Check this out ";
    const placeholder = "😀";
    const emojiId = "5123456789123456789";
    const initialFormatted = new FormattedString(initialText, []);

    const emojiResult = initialFormatted.customEmoji(placeholder, emojiId);

    assertInstanceOf(emojiResult, FormattedString);
    assertEquals(emojiResult.rawText, `${initialText}${placeholder}`);

    // Test entity properties
    assertEquals(emojiResult.rawEntities.length, 1);
    assertEquals(emojiResult.rawEntities[0]?.type, "text_link");
    assertEquals(emojiResult.rawEntities[0]?.offset, initialText.length);
    assertEquals(emojiResult.rawEntities[0]?.length, placeholder.length);
    assertEquals(
      //@ts-expect-error quick test
      emojiResult.rawEntities[0]?.url,
      `tg://emoji?id=5123456789123456789`,
    );
  });

  it("Instance linkMessage method", () => {
    const initialText = "See ";
    const linkText = "this message";
    const chatId = -1001234567890;
    const messageId = 123;
    const initialFormatted = new FormattedString(initialText, []);

    const linkResult = initialFormatted.linkMessage(
      linkText,
      chatId,
      messageId,
    );

    assertInstanceOf(linkResult, FormattedString);
    assertEquals(linkResult.rawText, `${initialText}${linkText}`);

    // Test entity properties
    assertEquals(linkResult.rawEntities.length, 1);
    assertEquals(linkResult.rawEntities[0]?.type, "text_link");
    assertEquals(linkResult.rawEntities[0]?.offset, initialText.length);
    assertEquals(linkResult.rawEntities[0]?.length, linkText.length);
    assertEquals(
      //@ts-expect-error quick test
      linkResult.rawEntities[0]?.url,
      `https://t.me/c/1234567890/123`,
    );
  });

  it("Instance plain method", () => {
    const initialText = "Hello";
    const plainText = " World";
    const initialFormatted = new FormattedString(initialText, []);

    const plainResult = initialFormatted.plain(plainText);

    assertInstanceOf(plainResult, FormattedString);
    assertEquals(plainResult.rawText, `${initialText}${plainText}`);

    // Test entity properties - plain text should not add any entities
    assertEquals(plainResult.rawEntities.length, 0);
  });

  it("Complex chaining", () => {
    const result = new FormattedString("Start: ", [])
      .bold("Bold")
      .plain(" then ")
      .italic("Italic")
      .plain(" and ")
      .code("code");

    assertInstanceOf(result, FormattedString);
    assertEquals(result.rawText, "Start: Bold then Italic and code");

    // Test exact entity count and properties
    assertEquals(result.rawEntities.length, 3);

    // Test bold entity
    assertEquals(result.rawEntities[0]?.type, "bold");
    assertEquals(result.rawEntities[0]?.offset, 7); // After "Start: "
    assertEquals(result.rawEntities[0]?.length, 4); // "Bold"

    // Test italic entity
    assertEquals(result.rawEntities[1]?.type, "italic");
    assertEquals(result.rawEntities[1]?.offset, 17); // After "Start: Bold then "
    assertEquals(result.rawEntities[1]?.length, 6); // "Italic"

    // Test code entity
    assertEquals(result.rawEntities[2]?.type, "code");
    assertEquals(result.rawEntities[2]?.offset, 28); // After "Start: Bold then Italic and "
    assertEquals(result.rawEntities[2]?.length, 4); // "code"
  });

  it("Stringable object as input", () => {
    const stringableObject = {
      toString: () => "custom string",
    };

    const result = FormattedString.bold(stringableObject);

    assertInstanceOf(result, FormattedString);
    assertEquals(result.rawText, "custom string");

    // Test entity properties
    assertEquals(result.rawEntities.length, 1);
    assertEquals(result.rawEntities[0]?.type, "bold");
    assertEquals(result.rawEntities[0]?.offset, 0);
    assertEquals(result.rawEntities[0]?.length, "custom string".length);
  });

  it("Empty entities array", () => {
    const text = "Plain text";
    const formatted = new FormattedString(text, []);

    assertEquals(formatted.text, text);
    assertEquals(formatted.entities.length, 0);
    assertEquals(formatted.caption_entities.length, 0);
  });

  it("Multiple entities", () => {
    const text = "Hello World";
    const entities: MessageEntity[] = [
      { type: "bold" as const, offset: 0, length: 5 },
      { type: "italic" as const, offset: 6, length: 5 },
    ];

    const formatted = new FormattedString(text, entities);

    assertEquals(formatted.entities.length, 2);
    assertEquals(formatted.entities[0]?.type, "bold");
    assertEquals(formatted.entities[1]?.type, "italic");
  });

  it("Static join method", () => {
    // Test empty array
    const emptyResult = FormattedString.join([]);
    assertInstanceOf(emptyResult, FormattedString);
    assertEquals(emptyResult.rawText, "");
    assertEquals(emptyResult.rawEntities.length, 0);

    // Test array of strings
    const stringsResult = FormattedString.join(["Hello", " ", "World"]);
    assertInstanceOf(stringsResult, FormattedString);
    assertEquals(stringsResult.rawText, "Hello World");
    assertEquals(stringsResult.rawEntities.length, 0);

    // Test mixed array
    const boldText = FormattedString.bold("Bold");
    const italicText = FormattedString.italic("Italic");
    const plainText = " and ";

    const mixedResult = FormattedString.join([
      "Start: ",
      boldText,
      " then ",
      italicText,
      plainText,
      "plain",
    ]);

    assertInstanceOf(mixedResult, FormattedString);
    assertEquals(mixedResult.rawText, "Start: Bold then Italic and plain");

    // Test exact entity count and properties
    assertEquals(mixedResult.rawEntities.length, 2);

    // Test bold entity
    assertEquals(mixedResult.rawEntities[0]?.type, "bold");
    assertEquals(mixedResult.rawEntities[0]?.offset, 7); // After "Start: "
    assertEquals(mixedResult.rawEntities[0]?.length, 4); // "Bold"

    // Test italic entity
    assertEquals(mixedResult.rawEntities[1]?.type, "italic");
    assertEquals(mixedResult.rawEntities[1]?.offset, 17); // After "Start: Bold then "
    assertEquals(mixedResult.rawEntities[1]?.length, 6); // "Italic"

    // Test TextWithEntities and CaptionWithEntities
    const textWithEntities = {
      text: "TextWithEntities",
      entities: [{ type: "bold" as const, offset: 0, length: 4 }],
    };

    const captionWithEntities = {
      caption: "CaptionWithEntities",
      caption_entities: [{ type: "italic" as const, offset: 0, length: 7 }],
    };

    const combinedResult = FormattedString.join([
      "Start: ",
      textWithEntities,
      " and ",
      captionWithEntities,
    ]);

    assertInstanceOf(combinedResult, FormattedString);
    assertEquals(
      combinedResult.rawText,
      "Start: TextWithEntities and CaptionWithEntities",
    );

    // Test entity count
    assertEquals(combinedResult.rawEntities.length, 2);

    // Test first entity from TextWithEntities
    assertEquals(combinedResult.rawEntities[0]?.type, "bold");
    assertEquals(combinedResult.rawEntities[0]?.offset, 7); // After "Start: "
    assertEquals(combinedResult.rawEntities[0]?.length, 4); // "Text" part of "TextWithEntities"

    // Test second entity from CaptionWithEntities
    assertEquals(combinedResult.rawEntities[1]?.type, "italic");
    assertEquals(combinedResult.rawEntities[1]?.offset, 28); // After "Start: TextWithEntities and "
    assertEquals(combinedResult.rawEntities[1]?.length, 7); // "Caption"
  });

  it("Static join method with separator", () => {
    // Test basic string separator
    const result1 = FormattedString.join(["a", "b", "c"], " ");
    assertInstanceOf(result1, FormattedString);
    assertEquals(result1.rawText, "a b c");
    assertEquals(result1.rawEntities.length, 0);

    // Test different separator
    const result2 = FormattedString.join(["Hello", "World"], " - ");
    assertInstanceOf(result2, FormattedString);
    assertEquals(result2.rawText, "Hello - World");
    assertEquals(result2.rawEntities.length, 0);

    // Test with empty separator (should be same as no separator)
    const result3 = FormattedString.join(["a", "b", "c"], "");
    const result4 = FormattedString.join(["a", "b", "c"]);
    assertEquals(result3.rawText, result4.rawText);

    // Test with single item and separator
    const result5 = FormattedString.join(["single"], " - ");
    assertEquals(result5.rawText, "single");

    // Test with empty array and separator
    const result6 = FormattedString.join([], " - ");
    assertEquals(result6.rawText, "");

    // Test with formatted strings and separator
    const boldText = FormattedString.bold("Bold");
    const italicText = FormattedString.italic("Italic");
    const result7 = FormattedString.join([boldText, italicText], " | ");

    assertInstanceOf(result7, FormattedString);
    assertEquals(result7.rawText, "Bold | Italic");
    assertEquals(result7.rawEntities.length, 2);

    // Test entity positions with separator
    assertEquals(result7.rawEntities[0]?.type, "bold");
    assertEquals(result7.rawEntities[0]?.offset, 0);
    assertEquals(result7.rawEntities[0]?.length, 4); // "Bold"

    assertEquals(result7.rawEntities[1]?.type, "italic");
    assertEquals(result7.rawEntities[1]?.offset, 7); // After "Bold | "
    assertEquals(result7.rawEntities[1]?.length, 6); // "Italic"

    // Test with FormattedString as separator
    const separatorFormatted = FormattedString.underline(" - ");
    const result8 = FormattedString.join(
      ["Hello", "World"],
      separatorFormatted,
    );

    assertInstanceOf(result8, FormattedString);
    assertEquals(result8.rawText, "Hello - World");
    assertEquals(result8.rawEntities.length, 1);
    assertEquals(result8.rawEntities[0]?.type, "underline");
    assertEquals(result8.rawEntities[0]?.offset, 5); // After "Hello"
    assertEquals(result8.rawEntities[0]?.length, 3); // " - "

    // Test with TextWithEntities as separator
    const textSeparator = {
      text: " -> ",
      entities: [{ type: "code" as const, offset: 1, length: 2 }], // "->"
    };
    const result9 = FormattedString.join(["A", "B"], textSeparator);

    assertInstanceOf(result9, FormattedString);
    assertEquals(result9.rawText, "A -> B");
    assertEquals(result9.rawEntities.length, 1);
    assertEquals(result9.rawEntities[0]?.type, "code");
    assertEquals(result9.rawEntities[0]?.offset, 2); // After "A "
    assertEquals(result9.rawEntities[0]?.length, 2); // "->"
  });

  it("Static join method entity behavior", () => {
    // Test entity behavior when joining FormattedStrings
    const boldText1 = FormattedString.bold("Hello");
    const boldText2 = FormattedString.bold("World");

    const result = FormattedString.join([boldText1, boldText2], " ");

    assertInstanceOf(result, FormattedString);
    assertEquals(result.rawText, "Hello World");

    // Should have two separate bold entities because the space separator is not bold
    assertEquals(result.rawEntities.length, 2);
    assertEquals(result.rawEntities[0]?.type, "bold");
    assertEquals(result.rawEntities[0]?.offset, 0);
    assertEquals(result.rawEntities[0]?.length, 5); // "Hello"
    assertEquals(result.rawEntities[1]?.type, "bold");
    assertEquals(result.rawEntities[1]?.offset, 6);
    assertEquals(result.rawEntities[1]?.length, 5); // "World"

    // Test without separator - should also consolidate
    const resultNoSep = FormattedString.join([boldText1, boldText2]);

    assertInstanceOf(resultNoSep, FormattedString);
    assertEquals(resultNoSep.rawText, "HelloWorld");
    assertEquals(resultNoSep.rawEntities.length, 1);
    assertEquals(resultNoSep.rawEntities[0]?.type, "bold");
    assertEquals(resultNoSep.rawEntities[0]?.offset, 0);
    assertEquals(resultNoSep.rawEntities[0]?.length, 10); // "HelloWorld"

    // Test with different entity types - should NOT consolidate
    const boldText = FormattedString.bold("Hello");
    const italicText = FormattedString.italic("World");

    const mixedResult = FormattedString.join([boldText, italicText], " ");

    assertInstanceOf(mixedResult, FormattedString);
    assertEquals(mixedResult.rawText, "Hello World");
    assertEquals(mixedResult.rawEntities.length, 2); // Should remain separate
    assertEquals(mixedResult.rawEntities[0]?.type, "bold");
    assertEquals(mixedResult.rawEntities[1]?.type, "italic");

    // Test with FormattedString separator between same entity types
    const boldSeparator = FormattedString.bold(" | ");
    const resultWithBoldSep = FormattedString.join(
      [boldText1, boldText2],
      boldSeparator,
    );

    assertInstanceOf(resultWithBoldSep, FormattedString);
    assertEquals(resultWithBoldSep.rawText, "Hello | World");
    assertEquals(resultWithBoldSep.rawEntities.length, 1); // All bold parts should be consolidated
    assertEquals(resultWithBoldSep.rawEntities[0]?.type, "bold");
    assertEquals(resultWithBoldSep.rawEntities[0]?.offset, 0);
    assertEquals(resultWithBoldSep.rawEntities[0]?.length, 13); // "Hello | World"

    // Test that single item doesn't go through consolidation path
    const singleResult = FormattedString.join([boldText1]);
    assertInstanceOf(singleResult, FormattedString);
    assertEquals(singleResult.rawText, "Hello");
    assertEquals(singleResult.rawEntities.length, 1);
    assertEquals(singleResult.rawEntities[0]?.type, "bold");

    // Test empty array
    const emptyResult = FormattedString.join([]);
    assertInstanceOf(emptyResult, FormattedString);
    assertEquals(emptyResult.rawText, "");
    assertEquals(emptyResult.rawEntities.length, 0);
  });

  it("Instance slice method", () => {
    // Test the example from the problem statement
    const originalText = "hello bold and italic world";
    const entities: MessageEntity[] = [
      { type: "bold" as const, offset: 6, length: 4 },
      { type: "italic" as const, offset: 15, length: 6 },
    ];
    const original = new FormattedString(originalText, entities);

    const sliced = original.slice(6, 20);

    assertInstanceOf(sliced, FormattedString);
    assertEquals(sliced.rawText, "bold and itali");
    assertEquals(sliced.rawEntities.length, 2);

    // Test bold entity adjustment
    assertEquals(sliced.rawEntities[0]?.type, "bold");
    assertEquals(sliced.rawEntities[0]?.offset, 0);
    assertEquals(sliced.rawEntities[0]?.length, 4);

    // Test italic entity adjustment
    assertEquals(sliced.rawEntities[1]?.type, "italic");
    assertEquals(sliced.rawEntities[1]?.offset, 9);
    assertEquals(sliced.rawEntities[1]?.length, 5);
  });

  it("slice method edge cases", () => {
    const text = "Hello World Test";
    const entities: MessageEntity[] = [
      { type: "bold" as const, offset: 0, length: 5 }, // "Hello"
      { type: "italic" as const, offset: 6, length: 5 }, // "World"
      { type: "code" as const, offset: 12, length: 4 }, // "Test"
    ];
    const original = new FormattedString(text, entities);

    // Test slice without parameters (should return full copy)
    const fullSlice = original.slice();
    assertInstanceOf(fullSlice, FormattedString);
    assertEquals(fullSlice.rawText, text);
    assertEquals(fullSlice.rawEntities.length, 3);
    assertEquals(fullSlice.rawEntities[0]?.type, "bold");
    assertEquals(fullSlice.rawEntities[1]?.type, "italic");
    assertEquals(fullSlice.rawEntities[2]?.type, "code");

    // Test slice with only start parameter
    const partialSlice = original.slice(6);
    assertEquals(partialSlice.rawText, "World Test");
    assertEquals(partialSlice.rawEntities.length, 2);
    assertEquals(partialSlice.rawEntities[0]?.type, "italic");
    assertEquals(partialSlice.rawEntities[0]?.offset, 0);
    assertEquals(partialSlice.rawEntities[0]?.length, 5);

    // Test slice that partially overlaps entities
    const overlappingSlice = original.slice(3, 9);
    assertEquals(overlappingSlice.rawText, "lo Wor");
    assertEquals(overlappingSlice.rawEntities.length, 2);

    // Bold entity should be partially included
    assertEquals(overlappingSlice.rawEntities[0]?.type, "bold");
    assertEquals(overlappingSlice.rawEntities[0]?.offset, 0);
    assertEquals(overlappingSlice.rawEntities[0]?.length, 2); // "lo"

    // Italic entity should be partially included
    assertEquals(overlappingSlice.rawEntities[1]?.type, "italic");
    assertEquals(overlappingSlice.rawEntities[1]?.offset, 3);
    assertEquals(overlappingSlice.rawEntities[1]?.length, 3); // "Wor"

    // Test slice that excludes all entities
    const noEntitiesSlice = original.slice(1, 2);
    assertEquals(noEntitiesSlice.rawText, "e");
    assertEquals(noEntitiesSlice.rawEntities.length, 1);
    assertEquals(noEntitiesSlice.rawEntities[0]?.type, "bold");
    assertEquals(noEntitiesSlice.rawEntities[0]?.offset, 0);
    assertEquals(noEntitiesSlice.rawEntities[0]?.length, 1);
  });

  it("slice method with empty string", () => {
    const empty = new FormattedString("", []);
    const sliced = empty.slice(0, 0);

    assertInstanceOf(sliced, FormattedString);
    assertEquals(sliced.rawText, "");
    assertEquals(sliced.rawEntities.length, 0);
  });

  it("slice method boundary conditions", () => {
    const text = "abcdef";
    const entities: MessageEntity[] = [
      { type: "bold" as const, offset: 1, length: 4 }, // "bcde"
    ];
    const original = new FormattedString(text, entities);

    // Test slice at entity boundaries
    const exactSlice = original.slice(1, 5);
    assertEquals(exactSlice.rawText, "bcde");
    assertEquals(exactSlice.rawEntities.length, 1);
    assertEquals(exactSlice.rawEntities[0]?.type, "bold");
    assertEquals(exactSlice.rawEntities[0]?.offset, 0);
    assertEquals(exactSlice.rawEntities[0]?.length, 4);

    // Test slice that goes beyond text length
    const beyondSlice = original.slice(0, 100);
    assertEquals(beyondSlice.rawText, text);
    assertEquals(beyondSlice.rawEntities.length, 1);

    // Test slice with negative start (should be treated as 0)
    const negativeStart = original.slice(-5, 3);
    assertEquals(negativeStart.rawText, "abc");
    assertEquals(negativeStart.rawEntities.length, 1);
    assertEquals(negativeStart.rawEntities[0]?.type, "bold");
    assertEquals(negativeStart.rawEntities[0]?.offset, 1);
    assertEquals(negativeStart.rawEntities[0]?.length, 2); // "bc"
  });

  it("slice method creates deep copy", () => {
    const original = new FormattedString("hello world", [
      { type: "bold" as const, offset: 0, length: 5 },
    ]);

    const sliced = original.slice(0, 7);

    // Verify it's a different object
    assertInstanceOf(sliced, FormattedString);
    assertEquals(sliced !== original, true);
    assertEquals(sliced.rawEntities !== original.rawEntities, true);
    assertEquals(sliced.rawEntities[0] !== original.rawEntities[0], true);

    // Verify the sliced result has the correct content
    assertEquals(sliced.rawText, "hello w");
    assertEquals(sliced.rawEntities.length, 1);
    assertEquals(sliced.rawEntities[0]?.type, "bold");
    assertEquals(sliced.rawEntities[0]?.offset, 0);
    assertEquals(sliced.rawEntities[0]?.length, 5);
  });

  it("find method basic functionality", () => {
    // Test finding a simple text match
    const text = "Hello world, hello universe";
    const source = new FormattedString(text, []);
    const pattern = new FormattedString("hello", []);

    const result = source.find(pattern);
    assertEquals(result, 13); // Should find "hello" at position 13
  });

  it("find method with entities", () => {
    // Create a source with bold "world" at position 6
    const sourceText = "Hello world test";
    const sourceEntities = [{ type: "bold" as const, offset: 6, length: 5 }]; // "world"
    const source = new FormattedString(sourceText, sourceEntities);

    // Create pattern for bold "world"
    const patternText = "world";
    const patternEntities = [{ type: "bold" as const, offset: 0, length: 5 }];
    const pattern = new FormattedString(patternText, patternEntities);

    const result = source.find(pattern);
    assertEquals(result, 6); // Should find bold "world" at position 6
  });

  it("find method entities must match exactly", () => {
    // Create source with bold "world"
    const sourceText = "Hello world test world end";
    const sourceEntities = [{ type: "bold" as const, offset: 6, length: 5 }]; // first "world"
    const source = new FormattedString(sourceText, sourceEntities);

    // Create pattern for italic "world" (different formatting)
    const patternText = "world";
    const patternEntities = [{ type: "italic" as const, offset: 0, length: 5 }];
    const pattern = new FormattedString(patternText, patternEntities);

    const result = source.find(pattern);
    assertEquals(result, -1); // Should not find because entities don't match
  });

  it("find method text without entities", () => {
    // Create source with bold "world"
    const sourceText = "Hello world test world end";
    const sourceEntities = [{ type: "bold" as const, offset: 6, length: 5 }]; // first "world"
    const source = new FormattedString(sourceText, sourceEntities);

    // Create pattern for plain "world" (no entities)
    const pattern = new FormattedString("world", []);

    const result = source.find(pattern);
    assertEquals(result, 17); // Should find the second "world" at position 17 (plain text)
  });

  it("find method multiple entities", () => {
    // Create source with multiple formatting
    const sourceText = "Hello bold italic world";
    const sourceEntities = [
      { type: "bold" as const, offset: 6, length: 4 }, // "bold"
      { type: "italic" as const, offset: 11, length: 6 }, // "italic"
    ];
    const source = new FormattedString(sourceText, sourceEntities);

    // Create pattern matching the "bold italic" part
    const patternText = "bold italic";
    const patternEntities = [
      { type: "bold" as const, offset: 0, length: 4 }, // "bold"
      { type: "italic" as const, offset: 5, length: 6 }, // "italic"
    ];
    const pattern = new FormattedString(patternText, patternEntities);

    const result = source.find(pattern);
    assertEquals(result, 6); // Should find the pattern starting at position 6
  });

  it("find method not found", () => {
    const source = new FormattedString("Hello world", []);
    const pattern = new FormattedString("foo", []);

    const result = source.find(pattern);
    assertEquals(result, -1); // Should return -1 when not found
  });

  it("find method empty pattern", () => {
    const source = new FormattedString("Hello world", []);
    const pattern = new FormattedString("", []);

    const result = source.find(pattern);
    assertEquals(result, 0); // Empty string should match at the beginning
  });

  it("find method pattern longer than source", () => {
    const source = new FormattedString("Hi", []);
    const pattern = new FormattedString("Hello world", []);

    const result = source.find(pattern);
    assertEquals(result, -1); // Should return -1 when pattern is longer than source
  });

  it("find method exact match", () => {
    const text = "Hello world";
    const entities = [{ type: "bold" as const, offset: 0, length: 5 }];
    const source = new FormattedString(text, entities);
    const pattern = new FormattedString(text, entities);

    const result = source.find(pattern);
    assertEquals(result, 0); // Should find exact match at position 0
  });

  it("find method with special entity properties", () => {
    // Test with entities that have additional properties like URL
    const sourceText = "Click here to visit example.com";
    const sourceEntities = [{
      type: "text_link" as const,
      offset: 6,
      length: 4,
      url: "https://example.com",
    }]; // "here"
    const source = new FormattedString(sourceText, sourceEntities);

    // Pattern that matches the link with same URL
    const patternText = "here";
    const patternEntities = [{
      type: "text_link" as const,
      offset: 0,
      length: 4,
      url: "https://example.com",
    }];
    const pattern = new FormattedString(patternText, patternEntities);

    const result = source.find(pattern);
    assertEquals(result, 6); // Should find the link at position 6
  });

  it("find method different URL should not match", () => {
    // Test with entities that have different URLs
    const sourceText = "Click here to visit example.com";
    const sourceEntities = [{
      type: "text_link" as const,
      offset: 6,
      length: 4,
      url: "https://example.com",
    }]; // "here"
    const source = new FormattedString(sourceText, sourceEntities);

    // Pattern with different URL
    const patternText = "here";
    const patternEntities = [{
      type: "text_link" as const,
      offset: 0,
      length: 4,
      url: "https://different.com",
    }];
    const pattern = new FormattedString(patternText, patternEntities);

    const result = source.find(pattern);
    assertEquals(result, -1); // Should not find because URLs are different
  });

  it("find method case sensitive", () => {
    const source = new FormattedString("Hello World", []);
    const pattern = new FormattedString("hello", []);

    const result = source.find(pattern);
    assertEquals(result, -1); // Should be case sensitive and not find "hello" in "Hello"
  });

  it("find method overlapping matches", () => {
    // Test that it finds the first match when there are overlapping possibilities
    const sourceText = "aaaa";
    const source = new FormattedString(sourceText, []);
    const pattern = new FormattedString("aa", []);

    const result = source.find(pattern);
    assertEquals(result, 0); // Should find the first "aa" at position 0
  });

  it("find method complex entity overlap", () => {
    // Test with entities that span across the search pattern boundaries
    const sourceText = "prefix bold and italic suffix";
    const sourceEntities = [
      { type: "bold" as const, offset: 7, length: 15 }, // "bold and italic"
      { type: "italic" as const, offset: 16, length: 6 }, // "italic"
    ];
    const source = new FormattedString(sourceText, sourceEntities);

    // Look for "and italic" with both bold on entire text and italic on "italic" part
    const patternText = "and italic";
    const patternEntities = [
      { type: "bold" as const, offset: 0, length: 10 }, // bold on entire "and italic"
      { type: "italic" as const, offset: 4, length: 6 }, // italic on "italic" part
    ];
    const pattern = new FormattedString(patternText, patternEntities);

    const result = source.find(pattern);
    assertEquals(result, 12); // Should find at position 12 where "and italic" starts
  });

  it("findAll method basic functionality", () => {
    // Test finding multiple simple text matches
    const text = "Hello world, hello universe, hello galaxy";
    const source = new FormattedString(text, []);
    const pattern = new FormattedString("hello", []);

    const results = source.findAll(pattern);
    assertEquals(results.length, 2); // Should find 2 matches
    assertEquals(results[0], 13); // First "hello" at position 13
    assertEquals(results[1], 29); // Second "hello" at position 29
  });

  it("findAll method with entities", () => {
    // Create a source with multiple bold "world" instances
    const sourceText = "Hello world test world end world";
    const sourceEntities = [
      { type: "bold" as const, offset: 6, length: 5 }, // first "world"
      { type: "bold" as const, offset: 27, length: 5 }, // third "world"
    ];
    const source = new FormattedString(sourceText, sourceEntities);

    // Create pattern for bold "world"
    const patternText = "world";
    const patternEntities = [{ type: "bold" as const, offset: 0, length: 5 }];
    const pattern = new FormattedString(patternText, patternEntities);

    const results = source.findAll(pattern);
    assertEquals(results.length, 2); // Should find 2 bold "world" instances
    assertEquals(results[0], 6); // First bold "world" at position 6
    assertEquals(results[1], 27); // Third bold "world" at position 27
  });

  it("findAll method no matches", () => {
    const source = new FormattedString("Hello world", []);
    const pattern = new FormattedString("foo", []);

    const results = source.findAll(pattern);
    assertEquals(results.length, 0); // Should return empty array when not found
  });

  it("findAll method empty pattern", () => {
    const source = new FormattedString("Hello world", []);
    const pattern = new FormattedString("", []);

    const results = source.findAll(pattern);
    assertEquals(results.length, 1); // Empty string should match once at the beginning
    assertEquals(results[0], 0);
  });

  it("findAll method pattern longer than source", () => {
    const source = new FormattedString("Hi", []);
    const pattern = new FormattedString("Hello world", []);

    const results = source.findAll(pattern);
    assertEquals(results.length, 0); // Should return empty array when pattern is longer than source
  });

  it("findAll method exact match", () => {
    const text = "Hello world";
    const entities = [{ type: "bold" as const, offset: 0, length: 5 }];
    const source = new FormattedString(text, entities);
    const pattern = new FormattedString(text, entities);

    const results = source.findAll(pattern);
    assertEquals(results.length, 1); // Should find one exact match
    assertEquals(results[0], 0); // Should find exact match at position 0
  });

  it("findAll method overlapping patterns", () => {
    // Test that it finds all overlapping matches
    const sourceText = "aaaa";
    const source = new FormattedString(sourceText, []);
    const pattern = new FormattedString("aa", []);

    const results = source.findAll(pattern, true);
    assertEquals(results.length, 3); // Should find "aa" at positions 0, 1, 2
    assertEquals(results[0], 0);
    assertEquals(results[1], 1);
    assertEquals(results[2], 2);
  });

  it("findAll method non-overlapping patterns (default)", () => {
    // Test that it finds only non-overlapping matches by default
    const sourceText = "aaaa";
    const source = new FormattedString(sourceText, []);
    const pattern = new FormattedString("aa", []);

    const results = source.findAll(pattern);
    assertEquals(results.length, 2); // Should find "aa" at positions 0, 2 (non-overlapping)
    assertEquals(results[0], 0);
    assertEquals(results[1], 2);
  });

  it("findAll method non-overlapping patterns explicit", () => {
    // Test that it finds only non-overlapping matches when explicitly specified
    const sourceText = "aaaa";
    const source = new FormattedString(sourceText, []);
    const pattern = new FormattedString("aa", []);

    const results = source.findAll(pattern, false);
    assertEquals(results.length, 2); // Should find "aa" at positions 0, 2 (non-overlapping)
    assertEquals(results[0], 0);
    assertEquals(results[1], 2);
  });

  it("findAll method with complex entities", () => {
    // Test with entities that have additional properties like URL
    const sourceText = "Click here to visit example.com and here again";
    const sourceEntities = [
      {
        type: "text_link" as const,
        offset: 6,
        length: 4,
        url: "https://example.com",
      }, // first "here"
      {
        type: "text_link" as const,
        offset: 36,
        length: 4,
        url: "https://example.com",
      }, // second "here"
    ];
    const source = new FormattedString(sourceText, sourceEntities);

    // Pattern that matches the link with same URL
    const patternText = "here";
    const patternEntities = [{
      type: "text_link" as const,
      offset: 0,
      length: 4,
      url: "https://example.com",
    }];
    const pattern = new FormattedString(patternText, patternEntities);

    const results = source.findAll(pattern);
    assertEquals(results.length, 2); // Should find both links
    assertEquals(results[0], 6); // Should find the first link at position 6
    assertEquals(results[1], 36); // Should find the second link at position 36
  });

  it("findAll method mixed entity matches", () => {
    // Test finding plain text when some instances have entities
    const sourceText = "Hello world test world end world";
    const sourceEntities = [
      { type: "bold" as const, offset: 6, length: 5 }, // first "world" is bold
    ];
    const source = new FormattedString(sourceText, sourceEntities);

    // Pattern for plain "world" (no entities)
    const pattern = new FormattedString("world", []);

    const results = source.findAll(pattern);
    assertEquals(results.length, 2); // Should find 2 plain "world" instances
    assertEquals(results[0], 17); // Second "world" at position 17
    assertEquals(results[1], 27); // Third "world" at position 27
  });
});

describe("FormattedString - Replace methods", () => {
  it("replace method basic functionality", () => {
    // Test replacing a simple text match
    const text = "Hello world, hello universe";
    const source = new FormattedString(text, []);
    const pattern = new FormattedString("hello", []);
    const replacement = new FormattedString("hi", []);

    const result = source.replace(pattern, replacement);
    assertEquals(result.rawText, "Hello world, hi universe");
    assertEquals(result.rawEntities.length, 0);
  });

  it("replace method with entities", () => {
    // Test replacing text with matching entities
    const sourceText = "Hello bold world and normal text";
    const sourceEntities = [
      { type: "bold" as const, offset: 6, length: 10 }, // "bold world"
    ];
    const source = new FormattedString(sourceText, sourceEntities);

    const pattern = new FormattedString("bold world", [
      { type: "bold" as const, offset: 0, length: 10 },
    ]);
    const replacement = new FormattedString("italic text", [
      { type: "italic" as const, offset: 0, length: 11 },
    ]);

    const result = source.replace(pattern, replacement);
    assertEquals(result.rawText, "Hello italic text and normal text");
    assertEquals(result.rawEntities.length, 1);
    assertEquals(result.rawEntities[0]?.type, "italic");
    assertEquals(result.rawEntities[0]?.offset, 6);
    assertEquals(result.rawEntities[0]?.length, 11);
  });

  it("replace method entities must match exactly", () => {
    // Test that entities must match exactly for replacement
    const sourceText = "Hello bold world";
    const sourceEntities = [
      { type: "bold" as const, offset: 6, length: 10 }, // "bold world"
    ];
    const source = new FormattedString(sourceText, sourceEntities);

    // Pattern with different entities (italic instead of bold)
    const pattern = new FormattedString("bold world", [
      { type: "italic" as const, offset: 0, length: 10 },
    ]);
    const replacement = new FormattedString("new text", []);

    const result = source.replace(pattern, replacement);
    // Should not replace because entities don't match
    assertEquals(result.rawText, "Hello bold world");
    assertEquals(result.rawEntities.length, 1);
    assertEquals(result.rawEntities[0]?.type, "bold");
  });

  it("replace method not found", () => {
    // Test replacement when pattern is not found
    const source = new FormattedString("Hello world", []);
    const pattern = new FormattedString("goodbye", []);
    const replacement = new FormattedString("hi", []);

    const result = source.replace(pattern, replacement);
    assertEquals(result.rawText, "Hello world");
    assertEquals(result.rawEntities.length, 0);
  });

  it("replace method preserves surrounding entities", () => {
    // Test that entities before and after replacement are preserved
    const sourceText = "Hello bold world and italic text";
    const sourceEntities = [
      { type: "bold" as const, offset: 6, length: 4 }, // "bold"
      { type: "italic" as const, offset: 21, length: 11 }, // "italic text"
    ];
    const source = new FormattedString(sourceText, sourceEntities);

    const pattern = new FormattedString("world", []);
    const replacement = new FormattedString("universe", []);

    const result = source.replace(pattern, replacement);
    assertEquals(result.rawText, "Hello bold universe and italic text");
    assertEquals(result.rawEntities.length, 2);

    // Check that "bold" entity is preserved
    assertEquals(result.rawEntities[0]?.type, "bold");
    assertEquals(result.rawEntities[0]?.offset, 6);
    assertEquals(result.rawEntities[0]?.length, 4);

    // Check that "italic text" entity is preserved and offset adjusted
    assertEquals(result.rawEntities[1]?.type, "italic");
    assertEquals(result.rawEntities[1]?.offset, 24); // offset shifted by +3 ("universe" vs "world")
    assertEquals(result.rawEntities[1]?.length, 11);
  });

  it("replace method complex entity replacement", () => {
    // Test replacing a complex pattern with multiple entities
    const sourceText = "Start bold and italic end";
    const sourceEntities = [
      { type: "bold" as const, offset: 6, length: 4 }, // "bold"
      { type: "italic" as const, offset: 15, length: 6 }, // "italic"
    ];
    const source = new FormattedString(sourceText, sourceEntities);

    const patternText = "bold and italic";
    const patternEntities = [
      { type: "bold" as const, offset: 0, length: 4 }, // "bold"
      { type: "italic" as const, offset: 9, length: 6 }, // "italic"
    ];
    const pattern = new FormattedString(patternText, patternEntities);

    const replacementText = "underlined text";
    const replacementEntities = [
      { type: "underline" as const, offset: 0, length: 15 },
    ];
    const replacement = new FormattedString(
      replacementText,
      replacementEntities,
    );

    const result = source.replace(pattern, replacement);
    assertEquals(result.rawText, "Start underlined text end");
    assertEquals(result.rawEntities.length, 1);
    assertEquals(result.rawEntities[0]?.type, "underline");
    assertEquals(result.rawEntities[0]?.offset, 6);
    assertEquals(result.rawEntities[0]?.length, 15);
  });

  it("replaceAll method basic functionality", () => {
    // Test replacing multiple simple text matches
    const text = "Hello world, hello universe, hello galaxy";
    const source = new FormattedString(text, []);
    const pattern = new FormattedString("hello", []);
    const replacement = new FormattedString("hi", []);

    const result = source.replaceAll(pattern, replacement);
    assertEquals(result.rawText, "Hello world, hi universe, hi galaxy");
    assertEquals(result.rawEntities.length, 0);
  });

  it("replaceAll method with entities", () => {
    // Test replacing multiple text matches with entities
    const sourceText = "Hello bold world and bold text";
    const sourceEntities = [
      { type: "bold" as const, offset: 6, length: 4 }, // first "bold"
      { type: "bold" as const, offset: 21, length: 4 }, // second "bold"
    ];
    const source = new FormattedString(sourceText, sourceEntities);

    const pattern = new FormattedString("bold", [
      { type: "bold" as const, offset: 0, length: 4 },
    ]);
    const replacement = new FormattedString("italic", [
      { type: "italic" as const, offset: 0, length: 6 },
    ]);

    const result = source.replaceAll(pattern, replacement);
    assertEquals(result.rawText, "Hello italic world and italic text");
    assertEquals(result.rawEntities.length, 2);

    // Check first replacement
    assertEquals(result.rawEntities[0]?.type, "italic");
    assertEquals(result.rawEntities[0]?.offset, 6);
    assertEquals(result.rawEntities[0]?.length, 6);

    // Check second replacement
    assertEquals(result.rawEntities[1]?.type, "italic");
    assertEquals(result.rawEntities[1]?.offset, 23); // offset adjusted for length difference
    assertEquals(result.rawEntities[1]?.length, 6);
  });

  it("replaceAll method no matches", () => {
    // Test replaceAll when pattern is not found
    const source = new FormattedString("Hello world", []);
    const pattern = new FormattedString("goodbye", []);
    const replacement = new FormattedString("hi", []);

    const result = source.replaceAll(pattern, replacement);
    assertEquals(result.rawText, "Hello world");
    assertEquals(result.rawEntities.length, 0);
  });

  it("replaceAll method overlapping prevention", () => {
    // Test that replaceAll doesn't create overlapping matches
    const text = "aaaa";
    const source = new FormattedString(text, []);
    const pattern = new FormattedString("aa", []);
    const replacement = new FormattedString("b", []);

    const result = source.replaceAll(pattern, replacement);
    // Should replace non-overlapping matches: "aa|aa" -> "b|b"
    assertEquals(result.rawText, "bb");
    assertEquals(result.rawEntities.length, 0);
  });

  it("replaceAll method preserves complex entities", () => {
    // Test that complex entity structures are preserved correctly
    const sourceText = "Link to google and normal link text";
    const sourceEntities = [
      {
        type: "text_link" as const,
        offset: 0,
        length: 14,
        url: "https://google.com",
      }, // "Link to google"
    ];
    const source = new FormattedString(sourceText, sourceEntities);

    const pattern = new FormattedString("link", []);
    const replacement = new FormattedString("URL", []);

    const result = source.replaceAll(pattern, replacement);
    assertEquals(result.rawText, "Link to google and normal URL text");
    assertEquals(result.rawEntities.length, 1);

    // Check that the link entity is preserved
    assertEquals(result.rawEntities[0]?.type, "text_link");
    assertEquals(result.rawEntities[0]?.offset, 0);
    assertEquals(result.rawEntities[0]?.length, 14); // "Link to google" unchanged
    assertEquals(
      (result.rawEntities[0] as { url: string })?.url,
      "https://google.com",
    );
  });

  it("replaceAll method with adjacent patterns", () => {
    // Test replacing adjacent patterns
    const text = "abcabc";
    const source = new FormattedString(text, []);
    const pattern = new FormattedString("abc", []);
    const replacement = new FormattedString("xyz", []);

    const result = source.replaceAll(pattern, replacement);
    assertEquals(result.rawText, "xyzxyz");
    assertEquals(result.rawEntities.length, 0);
  });

  it("replaceAll method empty replacement", () => {
    // Test replacing with empty string (deletion)
    const text = "Hello, world! Hello, universe!";
    const source = new FormattedString(text, []);
    const pattern = new FormattedString("Hello, ", []);
    const replacement = new FormattedString("", []);

    const result = source.replaceAll(pattern, replacement);
    assertEquals(result.rawText, "world! universe!");
    assertEquals(result.rawEntities.length, 0);
  });

  it("replace method replacement inside longer formatted string", () => {
    // Test the scenario from the issue: replace part of a longer formatted string
    // "Hello bolded world" where entire string is bolded, replace "bolded" with italicized "italics"
    const sourceText = "Hello bolded world";
    const sourceEntities = [
      { type: "bold" as const, offset: 0, length: 18 }, // entire string is bolded
    ];
    const source = new FormattedString(sourceText, sourceEntities);

    // Pattern is "bolded" with bold formatting to match the source formatting
    const pattern = new FormattedString("bolded", [
      { type: "bold" as const, offset: 0, length: 6 },
    ]);

    // Replacement is "italics" with italic formatting
    const replacement = new FormattedString("italics", [
      { type: "italic" as const, offset: 0, length: 7 },
    ]);

    const result = source.replace(pattern, replacement);
    assertEquals(result.rawText, "Hello italics world");
    assertEquals(result.rawEntities.length, 3);

    // Check that "Hello " remains bolded
    assertEquals(result.rawEntities[0]?.type, "bold");
    assertEquals(result.rawEntities[0]?.offset, 0);
    assertEquals(result.rawEntities[0]?.length, 6); // "Hello "

    // Check that "italics" is italicized
    assertEquals(result.rawEntities[1]?.type, "italic");
    assertEquals(result.rawEntities[1]?.offset, 6);
    assertEquals(result.rawEntities[1]?.length, 7); // "italics"

    // Check that " world" remains bolded
    assertEquals(result.rawEntities[2]?.type, "bold");
    assertEquals(result.rawEntities[2]?.offset, 13);
    assertEquals(result.rawEntities[2]?.length, 6); // " world"
  });

  it("replaceAll method replacement inside longer formatted string", () => {
    // Test replaceAll with the same scenario: multiple replacements inside longer formatted strings
    const sourceText = "Hello bolded world and bolded universe";
    const sourceEntities = [
      { type: "bold" as const, offset: 0, length: 38 }, // entire string is bolded
    ];
    const source = new FormattedString(sourceText, sourceEntities);

    // Pattern is "bolded" with bold formatting to match the source formatting
    const pattern = new FormattedString("bolded", [
      { type: "bold" as const, offset: 0, length: 6 },
    ]);

    // Replacement is "italics" with italic formatting
    const replacement = new FormattedString("italics", [
      { type: "italic" as const, offset: 0, length: 7 },
    ]);

    const result = source.replaceAll(pattern, replacement);
    assertEquals(result.rawText, "Hello italics world and italics universe");
    assertEquals(result.rawEntities.length, 5);

    // Check that "Hello " remains bolded
    assertEquals(result.rawEntities[0]?.type, "bold");
    assertEquals(result.rawEntities[0]?.offset, 0);
    assertEquals(result.rawEntities[0]?.length, 6); // "Hello "

    // Check that first "italics" is italicized
    assertEquals(result.rawEntities[1]?.type, "italic");
    assertEquals(result.rawEntities[1]?.offset, 6);
    assertEquals(result.rawEntities[1]?.length, 7); // "italics"

    // Check that " world and " remains bolded
    assertEquals(result.rawEntities[2]?.type, "bold");
    assertEquals(result.rawEntities[2]?.offset, 13);
    assertEquals(result.rawEntities[2]?.length, 11); // " world and "

    // Check that second "italics" is italicized
    assertEquals(result.rawEntities[3]?.type, "italic");
    assertEquals(result.rawEntities[3]?.offset, 24);
    assertEquals(result.rawEntities[3]?.length, 7); // "italics"

    // Check that " universe" remains bolded
    assertEquals(result.rawEntities[4]?.type, "bold");
    assertEquals(result.rawEntities[4]?.offset, 31);
    assertEquals(result.rawEntities[4]?.length, 9); // " universe"
  });

  it("Static split method - basic functionality", () => {
    // Test basic string split with plain separator
    const text = new FormattedString("a,b,c");
    const separator = new FormattedString(",");
    const result = FormattedString.split(text, separator);

    assertEquals(result.length, 3);
    assertEquals(result[0]?.rawText, "a");
    assertEquals(result[1]?.rawText, "b");
    assertEquals(result[2]?.rawText, "c");
    assertEquals(result[0]?.rawEntities.length, 0);
    assertEquals(result[1]?.rawEntities.length, 0);
    assertEquals(result[2]?.rawEntities.length, 0);
  });

  it("Static split method - no separator found", () => {
    // Test when separator is not found
    const text = new FormattedString("hello world");
    const separator = new FormattedString(",");
    const result = FormattedString.split(text, separator);

    assertEquals(result.length, 1);
    assertEquals(result[0]?.rawText, "hello world");
    assertEquals(result[0]?.rawEntities.length, 0);
  });

  it("Static split method - empty separator", () => {
    // Test with empty separator - should return array of individual characters
    const text = new FormattedString("abc");
    const separator = new FormattedString("");
    const result = FormattedString.split(text, separator);

    assertEquals(result.length, 3);
    assertEquals(result[0]?.rawText, "a");
    assertEquals(result[1]?.rawText, "b");
    assertEquals(result[2]?.rawText, "c");
  });

  it("Static split method - empty text", () => {
    // Test with empty text
    const text = new FormattedString("");
    const separator = new FormattedString(",");
    const result = FormattedString.split(text, separator);

    assertEquals(result.length, 1);
    assertEquals(result[0]?.rawText, "");
    assertEquals(result[0]?.rawEntities.length, 0);
  });

  it("Static split method - empty text and empty separator", () => {
    // Test with both empty text and empty separator
    const text = new FormattedString("");
    const separator = new FormattedString("");
    const result = FormattedString.split(text, separator);

    assertEquals(result.length, 1);
    assertEquals(result[0]?.rawText, "");
    assertEquals(result[0]?.rawEntities.length, 0);
  });

  it("Static split method - separator at beginning/end", () => {
    // Test separator at beginning and end
    const text = new FormattedString(",a,b,");
    const separator = new FormattedString(",");
    const result = FormattedString.split(text, separator);

    assertEquals(result.length, 4);
    assertEquals(result[0]?.rawText, "");
    assertEquals(result[1]?.rawText, "a");
    assertEquals(result[2]?.rawText, "b");
    assertEquals(result[3]?.rawText, "");
  });

  it("Static split method - with entities", () => {
    // Test split with entities in text and separator
    const boldText = FormattedString.bold("Hello");
    const separator = FormattedString.italic(" | ");
    const italicText = FormattedString.italic("World");
    const text = FormattedString.join([boldText, separator, italicText]);

    const result = FormattedString.split(text, separator);

    assertEquals(result.length, 2);
    assertEquals(result[0]?.rawText, "Hello");
    assertEquals(result[1]?.rawText, "World");

    // First segment should have bold entity
    assertEquals(result[0]?.rawEntities.length, 1);
    assertEquals(result[0]?.rawEntities[0]?.type, "bold");
    assertEquals(result[0]?.rawEntities[0]?.offset, 0);
    assertEquals(result[0]?.rawEntities[0]?.length, 5);

    // Second segment should have italic entity
    assertEquals(result[1]?.rawEntities.length, 1);
    assertEquals(result[1]?.rawEntities[0]?.type, "italic");
    assertEquals(result[1]?.rawEntities[0]?.offset, 0);
    assertEquals(result[1]?.rawEntities[0]?.length, 5);
  });

  it("Static split method - separator with entities must match exactly", () => {
    // Test that separator entities must match exactly
    const text = new FormattedString("Hello | World | Test");
    const plainSeparator = new FormattedString(" | ");
    const boldSeparator = FormattedString.bold(" | ");

    // Plain separator should split successfully
    const result1 = FormattedString.split(text, plainSeparator);
    assertEquals(result1.length, 3);
    assertEquals(result1[0]?.rawText, "Hello");
    assertEquals(result1[1]?.rawText, "World");
    assertEquals(result1[2]?.rawText, "Test");

    // Bold separator should not find matches (no bold entities in text)
    const result2 = FormattedString.split(text, boldSeparator);
    assertEquals(result2.length, 1);
    assertEquals(result2[0]?.rawText, "Hello | World | Test");
  });

  it("Instance split method", () => {
    // Test instance split method
    const text = new FormattedString("a,b,c");
    const separator = new FormattedString(",");
    const result = text.split(separator);

    assertEquals(result.length, 3);
    assertEquals(result[0]?.rawText, "a");
    assertEquals(result[1]?.rawText, "b");
    assertEquals(result[2]?.rawText, "c");
  });

  it("Instance split method - with entities", () => {
    // Test instance split with entities
    const boldA = FormattedString.bold("A");
    const separator = new FormattedString(",");
    const italicB = FormattedString.italic("B");
    const text = FormattedString.join([boldA, separator, italicB]);

    const result = text.split(separator);

    assertEquals(result.length, 2);
    assertEquals(result[0]?.rawText, "A");
    assertEquals(result[1]?.rawText, "B");

    // Check entities are preserved
    assertEquals(result[0]?.rawEntities[0]?.type, "bold");
    assertEquals(result[1]?.rawEntities[0]?.type, "italic");
  });

  it("Static split method - consecutive separators", () => {
    // Test consecutive separators create empty segments
    const text = new FormattedString("a,,b");
    const separator = new FormattedString(",");
    const result = FormattedString.split(text, separator);

    assertEquals(result.length, 3);
    assertEquals(result[0]?.rawText, "a");
    assertEquals(result[1]?.rawText, ""); // empty segment
    assertEquals(result[2]?.rawText, "b");
  });

  it("Static split method - separator equals entire text", () => {
    // Test when separator is the entire text
    const text = new FormattedString(",");
    const separator = new FormattedString(",");
    const result = FormattedString.split(text, separator);

    assertEquals(result.length, 2);
    assertEquals(result[0]?.rawText, ""); // empty before
    assertEquals(result[1]?.rawText, ""); // empty after
  });

  it("Static split method - entity coverage affects matching", () => {
    // Test that entity coverage affects separator matching
    const boldText = FormattedString.bold("Hello World"); // bold covers entire text including space
    const plainSeparator = new FormattedString(" "); // space without entities

    // Should not match because space in bold text has bold entity but separator doesn't
    const result1 = FormattedString.split(boldText, plainSeparator);
    assertEquals(result1.length, 1);
    assertEquals(result1[0]?.rawText, "Hello World");

    // Should match if separator also has bold entity covering the space
    const boldSeparator = FormattedString.bold(" ");
    const result2 = FormattedString.split(boldText, boldSeparator);
    assertEquals(result2.length, 2);
    assertEquals(result2[0]?.rawText, "Hello");
    assertEquals(result2[1]?.rawText, "World");
  });

  it("Instance concat method - single argument", () => {
    const first = FormattedString.bold("Hello");
    const second = FormattedString.italic("World");

    const result = first.concat(second);

    assertInstanceOf(result, FormattedString);
    assertEquals(result.rawText, "HelloWorld");
    assertEquals(result.rawEntities.length, 2);
    assertEquals(result.rawEntities[0]?.type, "bold");
    assertEquals(result.rawEntities[0]?.offset, 0);
    assertEquals(result.rawEntities[0]?.length, 5);
    assertEquals(result.rawEntities[1]?.type, "italic");
    assertEquals(result.rawEntities[1]?.offset, 5);
    assertEquals(result.rawEntities[1]?.length, 5);
  });

  it("Instance concat method - multiple arguments", () => {
    const first = FormattedString.bold("Hello");
    const second = new FormattedString(" ");
    const third = FormattedString.italic("Beautiful");
    const fourth = new FormattedString(" ");
    const fifth = FormattedString.code("World");

    const result = first.concat(second, third, fourth, fifth);

    assertInstanceOf(result, FormattedString);
    assertEquals(result.rawText, "Hello Beautiful World");
    assertEquals(result.rawEntities.length, 3);
    assertEquals(result.rawEntities[0]?.type, "bold");
    assertEquals(result.rawEntities[0]?.offset, 0);
    assertEquals(result.rawEntities[0]?.length, 5);
    assertEquals(result.rawEntities[1]?.type, "italic");
    assertEquals(result.rawEntities[1]?.offset, 6);
    assertEquals(result.rawEntities[1]?.length, 9);
    assertEquals(result.rawEntities[2]?.type, "code");
    assertEquals(result.rawEntities[2]?.offset, 16);
    assertEquals(result.rawEntities[2]?.length, 5);
  });

  it("Instance concat method - empty arguments", () => {
    const first = FormattedString.bold("Hello");
    const empty = new FormattedString("");

    const result = first.concat(empty);

    assertInstanceOf(result, FormattedString);
    assertEquals(result.rawText, "Hello");
    assertEquals(result.rawEntities.length, 1);
    assertEquals(result.rawEntities[0]?.type, "bold");
    assertEquals(result.rawEntities[0]?.offset, 0);
    assertEquals(result.rawEntities[0]?.length, 5);
  });

  it("Instance concat method - entity consolidation", () => {
    const first = FormattedString.bold("Hello");
    const second = FormattedString.bold("World");

    const result = first.concat(second);

    assertInstanceOf(result, FormattedString);
    assertEquals(result.rawText, "HelloWorld");
    // Should consolidate adjacent bold entities
    assertEquals(result.rawEntities.length, 1);
    assertEquals(result.rawEntities[0]?.type, "bold");
    assertEquals(result.rawEntities[0]?.offset, 0);
    assertEquals(result.rawEntities[0]?.length, 10);
  });

  it("Instance concat method - no arguments", () => {
    const first = FormattedString.bold("Hello");

    const result = first.concat();

    assertInstanceOf(result, FormattedString);
    assertEquals(result.rawText, "Hello");
    assertEquals(result.rawEntities.length, 1);
    assertEquals(result.rawEntities[0]?.type, "bold");
    assertEquals(result.rawEntities[0]?.offset, 0);
    assertEquals(result.rawEntities[0]?.length, 5);
  });
});

describe("FormattedString - startsWith and endsWith methods", () => {
  it("Static startsWith - basic functionality", () => {
    const source = new FormattedString("Hello World");
    const pattern1 = new FormattedString("Hello");
    const pattern2 = new FormattedString("World");
    const pattern3 = new FormattedString("Hi");

    assertEquals(FormattedString.startsWith(source, pattern1), true);
    assertEquals(FormattedString.startsWith(source, pattern2), false);
    assertEquals(FormattedString.startsWith(source, pattern3), false);
  });

  it("Static startsWith - empty pattern", () => {
    const source = new FormattedString("Hello World");
    const emptyPattern = new FormattedString("");

    assertEquals(FormattedString.startsWith(source, emptyPattern), true);
  });

  it("Static startsWith - empty source", () => {
    const emptySource = new FormattedString("");
    const pattern = new FormattedString("Hello");
    const emptyPattern = new FormattedString("");

    assertEquals(FormattedString.startsWith(emptySource, pattern), false);
    assertEquals(FormattedString.startsWith(emptySource, emptyPattern), true);
  });

  it("Static startsWith - pattern longer than source", () => {
    const source = new FormattedString("Hi");
    const pattern = new FormattedString("Hello World");

    assertEquals(FormattedString.startsWith(source, pattern), false);
  });

  it("Static startsWith - exact match", () => {
    const source = new FormattedString("Hello World");
    const pattern = new FormattedString("Hello World");

    assertEquals(FormattedString.startsWith(source, pattern), true);
  });

  it("Static startsWith - with entities matching", () => {
    const source = FormattedString.bold("Hello").concat(
      new FormattedString(" World"),
    );
    const pattern = FormattedString.bold("Hello");

    assertEquals(FormattedString.startsWith(source, pattern), true);
  });

  it("Static startsWith - with entities not matching", () => {
    const source = FormattedString.bold("Hello World");
    const pattern = new FormattedString("Hello"); // no bold entity

    assertEquals(FormattedString.startsWith(source, pattern), false);
  });

  it("Static startsWith - complex entities matching", () => {
    const boldHello = FormattedString.bold("Hello");
    const space = new FormattedString(" ");
    const italicWorld = FormattedString.italic("World");
    const source = FormattedString.join([boldHello, space, italicWorld]);

    const pattern1 = FormattedString.join([boldHello, space]);
    const pattern2 = FormattedString.join([
      new FormattedString("Hello"),
      space,
    ]);

    assertEquals(FormattedString.startsWith(source, pattern1), true);
    assertEquals(FormattedString.startsWith(source, pattern2), false);
  });

  it("Instance startsWith - basic functionality", () => {
    const source = new FormattedString("Hello World");
    const pattern1 = new FormattedString("Hello");
    const pattern2 = new FormattedString("World");

    assertEquals(source.startsWith(pattern1), true);
    assertEquals(source.startsWith(pattern2), false);
  });

  it("Static endsWith - basic functionality", () => {
    const source = new FormattedString("Hello World");
    const pattern1 = new FormattedString("World");
    const pattern2 = new FormattedString("Hello");
    const pattern3 = new FormattedString("Earth");

    assertEquals(FormattedString.endsWith(source, pattern1), true);
    assertEquals(FormattedString.endsWith(source, pattern2), false);
    assertEquals(FormattedString.endsWith(source, pattern3), false);
  });

  it("Static endsWith - empty pattern", () => {
    const source = new FormattedString("Hello World");
    const emptyPattern = new FormattedString("");

    assertEquals(FormattedString.endsWith(source, emptyPattern), true);
  });

  it("Static endsWith - empty source", () => {
    const emptySource = new FormattedString("");
    const pattern = new FormattedString("World");
    const emptyPattern = new FormattedString("");

    assertEquals(FormattedString.endsWith(emptySource, pattern), false);
    assertEquals(FormattedString.endsWith(emptySource, emptyPattern), true);
  });

  it("Static endsWith - pattern longer than source", () => {
    const source = new FormattedString("Hi");
    const pattern = new FormattedString("Hello World");

    assertEquals(FormattedString.endsWith(source, pattern), false);
  });

  it("Static endsWith - exact match", () => {
    const source = new FormattedString("Hello World");
    const pattern = new FormattedString("Hello World");

    assertEquals(FormattedString.endsWith(source, pattern), true);
  });

  it("Static endsWith - with entities matching", () => {
    const source = new FormattedString("Hello ").concat(
      FormattedString.italic("World"),
    );
    const pattern = FormattedString.italic("World");

    assertEquals(FormattedString.endsWith(source, pattern), true);
  });

  it("Static endsWith - with entities not matching", () => {
    const source = FormattedString.italic("Hello World");
    const pattern = new FormattedString("World"); // no italic entity

    assertEquals(FormattedString.endsWith(source, pattern), false);
  });

  it("Static endsWith - complex entities matching", () => {
    const boldHello = FormattedString.bold("Hello");
    const space = new FormattedString(" ");
    const italicWorld = FormattedString.italic("World");
    const source = FormattedString.join([boldHello, space, italicWorld]);

    const pattern1 = FormattedString.join([space, italicWorld]);
    const pattern2 = FormattedString.join([
      space,
      new FormattedString("World"),
    ]);

    assertEquals(FormattedString.endsWith(source, pattern1), true);
    assertEquals(FormattedString.endsWith(source, pattern2), false);
  });

  it("Instance endsWith - basic functionality", () => {
    const source = new FormattedString("Hello World");
    const pattern1 = new FormattedString("World");
    const pattern2 = new FormattedString("Hello");

    assertEquals(source.endsWith(pattern1), true);
    assertEquals(source.endsWith(pattern2), false);
  });

  it("startsWith and endsWith - single character", () => {
    const source = new FormattedString("Hello");
    const hPattern = new FormattedString("H");
    const oPattern = new FormattedString("o");

    assertEquals(source.startsWith(hPattern), true);
    assertEquals(source.endsWith(oPattern), true);
    assertEquals(source.startsWith(oPattern), false);
    assertEquals(source.endsWith(hPattern), false);
  });

  it("startsWith and endsWith - with link entities", () => {
    const linkText = FormattedString.link("click here", "https://example.com");
    const source = new FormattedString("Visit ").concat(linkText).concat(
      new FormattedString(" now"),
    );

    const startsPattern = new FormattedString("Visit ");
    const endsPattern = new FormattedString(" now");
    const linkPattern = FormattedString.link(
      "click here",
      "https://example.com",
    );

    assertEquals(source.startsWith(startsPattern), true);
    assertEquals(source.endsWith(endsPattern), true);
    assertEquals(source.startsWith(linkPattern), false);
    assertEquals(source.endsWith(linkPattern), false);
  });

  it("startsWith and endsWith - overlapping patterns", () => {
    const source = new FormattedString("abcabc");
    const abcPattern = new FormattedString("abc");

    assertEquals(source.startsWith(abcPattern), true);
    assertEquals(source.endsWith(abcPattern), true);
  });
});
