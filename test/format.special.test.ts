import { assertEquals, assertInstanceOf, describe, it } from "./deps.test.ts";
import { FormattedString } from "../src/format.ts";

describe("FormattedString - Static special methods", () => {
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

describe("FormattedString - Instance special methods", () => {
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
});