import { assertEquals, describe, it } from "./deps.test.ts";
import { isEntityEqual } from "../src/util.ts";
import type { MessageEntity } from "../src/deps.deno.ts";

describe("isEntityEqual", () => {
  it("basic functionality", () => {
    const entity1: MessageEntity = { type: "bold", offset: 0, length: 5 };
    const entity2: MessageEntity = { type: "bold", offset: 0, length: 5 };
    const entity3: MessageEntity = { type: "bold", offset: 10, length: 5 };
    const entity4: MessageEntity = { type: "bold", offset: 0, length: 3 };

    // Identical entities should be equal
    assertEquals(isEntityEqual(entity1, entity2), true);

    // Same type and length but different offset should not be equal
    assertEquals(isEntityEqual(entity1, entity3), false);

    // Same type and offset but different length should not be equal
    assertEquals(isEntityEqual(entity1, entity4), false);
  });

  it("with text_link entities", () => {
    const entity1: MessageEntity = {
      type: "text_link",
      offset: 0,
      length: 5,
      url: "https://example.com",
    };
    const entity2: MessageEntity = {
      type: "text_link",
      offset: 0,
      length: 5,
      url: "https://example.com",
    };
    const entity3: MessageEntity = {
      type: "text_link",
      offset: 0,
      length: 5,
      url: "https://different.com",
    };
    const entity4: MessageEntity = {
      type: "text_link",
      offset: 10,
      length: 5,
      url: "https://example.com",
    };

    // Identical entities should be equal
    assertEquals(isEntityEqual(entity1, entity2), true);

    // Same position but different URL should not be equal
    assertEquals(isEntityEqual(entity1, entity3), false);

    // Same URL but different position should not be equal
    assertEquals(isEntityEqual(entity1, entity4), false);
  });

  it("comprehensive comparison", () => {
    const entity1: MessageEntity = {
      type: "pre",
      offset: 10,
      length: 20,
      language: "typescript",
    };
    const entity2: MessageEntity = {
      type: "pre",
      offset: 10,
      length: 20,
      language: "typescript",
    };
    const entity3: MessageEntity = {
      type: "pre",
      offset: 10,
      length: 20,
      language: "javascript",
    };

    // Completely identical entities should be equal
    assertEquals(isEntityEqual(entity1, entity2), true);

    // Different language should not be equal even with same type, offset, length
    assertEquals(isEntityEqual(entity1, entity3), false);
  });

  it("custom_emoji entity equality tests", () => {
    const entity1: MessageEntity = {
      type: "custom_emoji",
      offset: 0,
      length: 2,
      custom_emoji_id: "123456",
    };
    const entity2: MessageEntity = {
      type: "custom_emoji",
      offset: 0,
      length: 2,
      custom_emoji_id: "123456",
    };
    const entity3: MessageEntity = {
      type: "custom_emoji",
      offset: 0,
      length: 2,
      custom_emoji_id: "789012",
    };
    const entity4: MessageEntity = {
      type: "custom_emoji",
      offset: 5,
      length: 2,
      custom_emoji_id: "123456",
    };
    const entity5: MessageEntity = {
      type: "custom_emoji",
      offset: 0,
      length: 3,
      custom_emoji_id: "123456",
    };

    // Identical custom_emoji entities should be equal
    assertEquals(isEntityEqual(entity1, entity2), true);

    // Different custom_emoji_id should not be equal
    assertEquals(isEntityEqual(entity1, entity3), false);

    // Different offset should not be equal
    assertEquals(isEntityEqual(entity1, entity4), false);

    // Different length should not be equal
    assertEquals(isEntityEqual(entity1, entity5), false);
  });

  it("text_mention entity equality tests", () => {
    const user1 = { id: 123, is_bot: false, first_name: "John" };
    const copyUser1 = { id: 123, is_bot: false, first_name: "John" };
    const user2 = { id: 456, is_bot: false, first_name: "Jane" };

    const entity1: MessageEntity = {
      type: "text_mention",
      offset: 0,
      length: 5,
      user: user1,
    };
    const entity2: MessageEntity = {
      type: "text_mention",
      offset: 0,
      length: 5,
      user: copyUser1,
    };
    const entity3: MessageEntity = {
      type: "text_mention",
      offset: 0,
      length: 5,
      user: user2,
    };
    const entity4: MessageEntity = {
      type: "text_mention",
      offset: 10,
      length: 5,
      user: user1,
    };
    const entity5: MessageEntity = {
      type: "text_mention",
      offset: 0,
      length: 3,
      user: user1,
    };

    // Identical text_mention entities should be equal
    assertEquals(isEntityEqual(entity1, entity2), true);

    // Different users should not be equal
    assertEquals(isEntityEqual(entity1, entity3), false);

    // Different offset should not be equal
    assertEquals(isEntityEqual(entity1, entity4), false);

    // Different length should not be equal
    assertEquals(isEntityEqual(entity1, entity5), false);
  });

  it("edge cases with undefined/null optional properties", () => {
    // text_link without url property
    const textLinkWithoutUrl: MessageEntity = {
      type: "text_link",
      offset: 0,
      length: 5,
    } as MessageEntity;
    const textLinkWithoutUrl2: MessageEntity = {
      type: "text_link",
      offset: 0,
      length: 5,
    } as MessageEntity;
    const textLinkWithUrl: MessageEntity = {
      type: "text_link",
      offset: 0,
      length: 5,
      url: "https://example.com",
    };

    // Two text_link entities without url should be equal
    assertEquals(isEntityEqual(textLinkWithoutUrl, textLinkWithoutUrl2), true);

    // text_link without url vs with url should not be equal
    assertEquals(isEntityEqual(textLinkWithoutUrl, textLinkWithUrl), false);

    // pre without language property
    const preWithoutLanguage: MessageEntity = {
      type: "pre",
      offset: 0,
      length: 10,
    } as MessageEntity;
    const preWithoutLanguage2: MessageEntity = {
      type: "pre",
      offset: 0,
      length: 10,
    } as MessageEntity;
    const preWithLanguage: MessageEntity = {
      type: "pre",
      offset: 0,
      length: 10,
      language: "javascript",
    };

    // Two pre entities without language should be equal
    assertEquals(isEntityEqual(preWithoutLanguage, preWithoutLanguage2), true);

    // pre without language vs with language should not be equal
    assertEquals(isEntityEqual(preWithoutLanguage, preWithLanguage), false);

    // custom_emoji without custom_emoji_id property
    const customEmojiWithoutId: MessageEntity = {
      type: "custom_emoji",
      offset: 0,
      length: 2,
    } as MessageEntity;
    const customEmojiWithoutId2: MessageEntity = {
      type: "custom_emoji",
      offset: 0,
      length: 2,
    } as MessageEntity;
    const customEmojiWithId: MessageEntity = {
      type: "custom_emoji",
      offset: 0,
      length: 2,
      custom_emoji_id: "123456",
    };

    // Two custom_emoji entities without custom_emoji_id should be equal
    assertEquals(isEntityEqual(customEmojiWithoutId, customEmojiWithoutId2), true);

    // custom_emoji without id vs with id should not be equal
    assertEquals(isEntityEqual(customEmojiWithoutId, customEmojiWithId), false);
  });
});