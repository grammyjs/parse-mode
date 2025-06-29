import { assertEquals, describe, it } from "./deps.test.ts";
import { isEntitySimilar } from "../src/util.ts";
import type { MessageEntity } from "../src/deps.deno.ts";

// Entity comparison method tests
describe("isEntitySimilar", () => {
  it("basic functionality", () => {
    const entity1: MessageEntity = { type: "bold", offset: 0, length: 5 };
    const entity2: MessageEntity = { type: "bold", offset: 10, length: 3 };
    const entity3: MessageEntity = { type: "italic", offset: 0, length: 5 };

    // Same type, different offset/length should be similar
    assertEquals(isEntitySimilar(entity1, entity2), true);

    // Different type should not be similar
    assertEquals(isEntitySimilar(entity1, entity3), false);
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
      offset: 10,
      length: 3,
      url: "https://example.com",
    };
    const entity3: MessageEntity = {
      type: "text_link",
      offset: 0,
      length: 5,
      url: "https://different.com",
    };

    // Same type and URL, different offset/length should be similar
    assertEquals(isEntitySimilar(entity1, entity2), true);

    // Same type but different URL should not be similar
    assertEquals(isEntitySimilar(entity1, entity3), false);
  });

  it("with pre entities", () => {
    const entity1: MessageEntity = {
      type: "pre",
      offset: 0,
      length: 5,
      language: "javascript",
    };
    const entity2: MessageEntity = {
      type: "pre",
      offset: 10,
      length: 3,
      language: "javascript",
    };
    const entity3: MessageEntity = {
      type: "pre",
      offset: 0,
      length: 5,
      language: "python",
    };

    // Same type and language, different offset/length should be similar
    assertEquals(isEntitySimilar(entity1, entity2), true);

    // Same type but different language should not be similar
    assertEquals(isEntitySimilar(entity1, entity3), false);
  });

  it("with custom_emoji entities", () => {
    const entity1: MessageEntity = {
      type: "custom_emoji",
      offset: 0,
      length: 2,
      custom_emoji_id: "123456",
    };
    const entity2: MessageEntity = {
      type: "custom_emoji",
      offset: 5,
      length: 2,
      custom_emoji_id: "123456",
    };
    const entity3: MessageEntity = {
      type: "custom_emoji",
      offset: 0,
      length: 2,
      custom_emoji_id: "789012",
    };

    // Same type and emoji ID, different offset/length should be similar
    assertEquals(isEntitySimilar(entity1, entity2), true);

    // Same type but different emoji ID should not be similar
    assertEquals(isEntitySimilar(entity1, entity3), false);
  });

  it("with text_mention entities", () => {
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
      offset: 10,
      length: 4,
      user: copyUser1,
    };
    const entity3: MessageEntity = {
      type: "text_mention",
      offset: 0,
      length: 5,
      user: user2,
    };

    // Same type and user, different offset/length should be similar
    assertEquals(isEntitySimilar(entity1, entity2), true);

    // Same type but different user should not be similar
    assertEquals(isEntitySimilar(entity1, entity3), false);
  });

  it("pre entities without language property", () => {
    const preWithoutLanguage1: MessageEntity = {
      type: "pre",
      offset: 0,
      length: 10,
    } as MessageEntity;
    const preWithoutLanguage2: MessageEntity = {
      type: "pre",
      offset: 5,
      length: 8,
    } as MessageEntity;
    const preWithLanguage: MessageEntity = {
      type: "pre",
      offset: 0,
      length: 10,
      language: "javascript",
    };
    const preWithNullLanguage: MessageEntity = {
      type: "pre",
      offset: 0,
      length: 10,
      language: null as any,
    };
    const preWithUndefinedLanguage: MessageEntity = {
      type: "pre",
      offset: 0,
      length: 10,
      language: undefined as any,
    };

    // Pre entities without language should be similar
    assertEquals(
      isEntitySimilar(preWithoutLanguage1, preWithoutLanguage2),
      true,
    );

    // Pre without language vs pre with language should not be similar
    assertEquals(isEntitySimilar(preWithoutLanguage1, preWithLanguage), false);

    // Pre with null language vs pre without language should be similar (both undefined)
    assertEquals(
      isEntitySimilar(preWithoutLanguage1, preWithNullLanguage),
      false,
    );

    // Pre with undefined language vs pre without language should be similar (both undefined)
    assertEquals(
      isEntitySimilar(preWithoutLanguage1, preWithUndefinedLanguage),
      true,
    );
  });

  it("text_link entities without URL property", () => {
    const textLinkWithoutUrl1: MessageEntity = {
      type: "text_link",
      offset: 0,
      length: 5,
    } as MessageEntity;
    const textLinkWithoutUrl2: MessageEntity = {
      type: "text_link",
      offset: 10,
      length: 3,
    } as MessageEntity;
    const textLinkWithUrl: MessageEntity = {
      type: "text_link",
      offset: 0,
      length: 5,
      url: "https://example.com",
    };
    const textLinkWithNullUrl: MessageEntity = {
      type: "text_link",
      offset: 0,
      length: 5,
      url: null as any,
    };
    const textLinkWithUndefinedUrl: MessageEntity = {
      type: "text_link",
      offset: 0,
      length: 5,
      url: undefined as any,
    };

    // text_link entities without URL should be similar
    assertEquals(
      isEntitySimilar(textLinkWithoutUrl1, textLinkWithoutUrl2),
      true,
    );

    // text_link without URL vs text_link with URL should not be similar
    assertEquals(isEntitySimilar(textLinkWithoutUrl1, textLinkWithUrl), false);

    // text_link with null URL vs text_link without URL should not be similar (null != undefined)
    assertEquals(
      isEntitySimilar(textLinkWithoutUrl1, textLinkWithNullUrl),
      false,
    );

    // text_link with undefined URL vs text_link without URL should be similar (both undefined)
    assertEquals(
      isEntitySimilar(textLinkWithoutUrl1, textLinkWithUndefinedUrl),
      true,
    );
  });

  it("custom_emoji entities without custom_emoji_id property", () => {
    const customEmojiWithoutId1: MessageEntity = {
      type: "custom_emoji",
      offset: 0,
      length: 2,
    } as MessageEntity;
    const customEmojiWithoutId2: MessageEntity = {
      type: "custom_emoji",
      offset: 5,
      length: 2,
    } as MessageEntity;
    const customEmojiWithId: MessageEntity = {
      type: "custom_emoji",
      offset: 0,
      length: 2,
      custom_emoji_id: "123456",
    };
    const customEmojiWithNullId: MessageEntity = {
      type: "custom_emoji",
      offset: 0,
      length: 2,
      custom_emoji_id: null as any,
    };
    const customEmojiWithUndefinedId: MessageEntity = {
      type: "custom_emoji",
      offset: 0,
      length: 2,
      custom_emoji_id: undefined as any,
    };

    // custom_emoji entities without custom_emoji_id should be similar
    assertEquals(
      isEntitySimilar(customEmojiWithoutId1, customEmojiWithoutId2),
      true,
    );

    // custom_emoji without id vs custom_emoji with id should not be similar
    assertEquals(
      isEntitySimilar(customEmojiWithoutId1, customEmojiWithId),
      false,
    );

    // custom_emoji with null id vs custom_emoji without id should not be similar (null != undefined)
    assertEquals(
      isEntitySimilar(customEmojiWithoutId1, customEmojiWithNullId),
      false,
    );

    // custom_emoji with undefined id vs custom_emoji without id should be similar (both undefined)
    assertEquals(
      isEntitySimilar(customEmojiWithoutId1, customEmojiWithUndefinedId),
      true,
    );
  });

  it("text_mention entities with complex user scenarios", () => {
    const userWithNullProperties = {
      id: 123,
      is_bot: false,
      first_name: "John",
      last_name: null as any,
      username: undefined as any,
    };
    const userWithUndefinedProperties = {
      id: 123,
      is_bot: false,
      first_name: "John",
      last_name: undefined as any,
    };
    const userWithMissingProperties = {
      id: 123,
      is_bot: false,
      first_name: "John",
    };
    const userWithDifferentProperties = {
      id: 123,
      is_bot: false,
      first_name: "John",
      last_name: "Doe",
    };

    const entity1: MessageEntity = {
      type: "text_mention",
      offset: 0,
      length: 5,
      user: userWithNullProperties,
    };
    const entity2: MessageEntity = {
      type: "text_mention",
      offset: 10,
      length: 4,
      user: userWithUndefinedProperties,
    };
    const entity3: MessageEntity = {
      type: "text_mention",
      offset: 0,
      length: 5,
      user: userWithMissingProperties,
    };
    const entity4: MessageEntity = {
      type: "text_mention",
      offset: 0,
      length: 5,
      user: userWithDifferentProperties,
    };

    // Users with null/undefined properties should be similar to users with missing properties
    assertEquals(isEntitySimilar(entity1, entity2), true);
    assertEquals(isEntitySimilar(entity1, entity3), true);
    assertEquals(isEntitySimilar(entity2, entity3), true);

    // Users with different non-null properties should not be similar
    assertEquals(isEntitySimilar(entity1, entity4), false);
    assertEquals(isEntitySimilar(entity3, entity4), false);

    // Test with deeply nested null/undefined scenarios
    const userWithNestedNulls = {
      id: 123,
      is_bot: false,
      first_name: "John",
      last_name: null as any,
      username: null as any,
    };
    const userWithNestedUndefined = {
      id: 123,
      is_bot: false,
      first_name: "John",
      last_name: undefined as any,
      username: undefined as any,
    };

    const entity5: MessageEntity = {
      type: "text_mention",
      offset: 0,
      length: 5,
      user: userWithNestedNulls,
    };
    const entity6: MessageEntity = {
      type: "text_mention",
      offset: 0,
      length: 5,
      user: userWithNestedUndefined,
    };

    // Nested null vs undefined should be similar (treated as absent)
    assertEquals(isEntitySimilar(entity5, entity6), true);
  });
});
