import { assertEquals, assertInstanceOf, describe, it } from "./deps.test.ts";
import { FormattedString } from "../src/format.ts";

describe("FormattedString - linkMessage formatting methods", () => {
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
  it("Instance linkMessage method", () => {
    const initialText = "See ";
    const linkText = "this message";
    const chatId = -1001234567890;
    const messageId = 123;
    const initialFormatted = new FormattedString(initialText);

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
