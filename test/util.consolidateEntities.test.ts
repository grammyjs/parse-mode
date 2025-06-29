import { assertEquals, describe, it } from "./deps.test.ts";
import { consolidateEntities, sortEntities } from "../src/util.ts";
import type { MessageEntity } from "../src/deps.deno.ts";

describe("consolidateEntities", () => {
  it("consolidateEntities method", () => {
    const overlappingBoldEntities: MessageEntity[] = [
      { type: "bold" as const, offset: 0, length: 5 },
      { type: "bold" as const, offset: 3, length: 7 },
    ];

    const consolidatedBold = consolidateEntities(
      overlappingBoldEntities,
    );
    assertEquals(consolidatedBold.length, 1);
    assertEquals(consolidatedBold[0]?.type, "bold");
    assertEquals(consolidatedBold[0]?.offset, 0);
    assertEquals(consolidatedBold[0]?.length, 10);

    // Test adjacent entities (touching but not overlapping)
    const adjacentEntities: MessageEntity[] = [
      { type: "italic" as const, offset: 0, length: 5 },
      { type: "italic" as const, offset: 5, length: 3 },
    ];

    const consolidatedAdjacent = consolidateEntities(
      adjacentEntities,
    );
    assertEquals(consolidatedAdjacent.length, 1);
    assertEquals(consolidatedAdjacent[0]?.type, "italic");
    assertEquals(consolidatedAdjacent[0]?.offset, 0);
    assertEquals(consolidatedAdjacent[0]?.length, 8);

    // Test non-overlapping entities of same type
    const nonOverlappingEntities: MessageEntity[] = [
      { type: "bold" as const, offset: 0, length: 3 },
      { type: "bold" as const, offset: 5, length: 3 },
    ];

    const nonOverlappingResult = consolidateEntities(
      nonOverlappingEntities,
    );
    assertEquals(nonOverlappingResult.length, 2);
    assertEquals(nonOverlappingResult[0]?.offset, 0);
    assertEquals(nonOverlappingResult[0]?.length, 3);
    assertEquals(nonOverlappingResult[1]?.offset, 5);
    assertEquals(nonOverlappingResult[1]?.length, 3);

    // Test different entity types (should not be consolidated)
    const differentTypeEntities: MessageEntity[] = [
      { type: "bold" as const, offset: 0, length: 5 },
      { type: "italic" as const, offset: 3, length: 7 },
    ];

    const differentTypesResult = consolidateEntities(
      differentTypeEntities,
    );
    assertEquals(differentTypesResult.length, 2);
    assertEquals(differentTypesResult[0]?.type, "bold");
    assertEquals(differentTypesResult[1]?.type, "italic");

    // Test entities with different URLs (text_link type)
    const differentUrlEntities: MessageEntity[] = [
      {
        type: "text_link" as const,
        offset: 0,
        length: 5,
        url: "https://example.com",
      },
      {
        type: "text_link" as const,
        offset: 3,
        length: 7,
        url: "https://different.com",
      },
    ];

    const differentUrlResult = consolidateEntities(
      differentUrlEntities,
    );
    assertEquals(differentUrlResult.length, 2); // Should not consolidate different URLs

    // Test entities with same URLs (text_link type)
    const sameUrlEntities: MessageEntity[] = [
      {
        type: "text_link" as const,
        offset: 0,
        length: 5,
        url: "https://example.com",
      },
      {
        type: "text_link" as const,
        offset: 3,
        length: 7,
        url: "https://example.com",
      },
    ];

    const sameUrlResult = consolidateEntities(sameUrlEntities);
    assertEquals(sameUrlResult.length, 1); // Should consolidate same URLs
    assertEquals(sameUrlResult[0]?.length, 10);

    // Test empty array
    const emptyResult = consolidateEntities([]);
    assertEquals(emptyResult.length, 0);

    // Test single entity
    const singleEntity: MessageEntity[] = [
      { type: "bold" as const, offset: 0, length: 5 },
    ];

    const singleResult = consolidateEntities(singleEntity);
    assertEquals(singleResult.length, 1);
    assertEquals(singleResult[0]?.type, "bold");
    assertEquals(singleResult[0]?.offset, 0);
    assertEquals(singleResult[0]?.length, 5);

    // Test unsorted entities (implementation should handle this)
    const unsortedEntities: MessageEntity[] = [
      { type: "bold" as const, offset: 5, length: 3 },
      { type: "bold" as const, offset: 0, length: 6 },
    ];

    const unsortedResult = consolidateEntities(unsortedEntities);
    assertEquals(unsortedResult.length, 1);
    assertEquals(unsortedResult[0]?.offset, 0);
    assertEquals(unsortedResult[0]?.length, 8); // Should span from 0 to 8
  });

  it("consolidateEntities with complex overlapping", () => {
    // Test multiple overlapping entities of the same type
    const multipleOverlapping: MessageEntity[] = [
      { type: "bold" as const, offset: 0, length: 3 },
      { type: "bold" as const, offset: 2, length: 4 },
      { type: "bold" as const, offset: 5, length: 2 },
    ];

    const multipleResult = consolidateEntities(
      multipleOverlapping,
    );
    assertEquals(multipleResult.length, 1);
    assertEquals(multipleResult[0]?.offset, 0);
    assertEquals(multipleResult[0]?.length, 7); // Should span from 0 to 7

    // Test entities that are completely contained within others
    const containedEntities: MessageEntity[] = [
      { type: "italic" as const, offset: 0, length: 10 },
      { type: "italic" as const, offset: 2, length: 3 },
      { type: "italic" as const, offset: 7, length: 2 },
    ];

    const containedResult = consolidateEntities(
      containedEntities,
    );
    assertEquals(containedResult.length, 1);
    assertEquals(containedResult[0]?.offset, 0);
    assertEquals(containedResult[0]?.length, 10); // Should keep the largest span

    // Test 3 overlapping bold entities with 1 italic entity positioned between them
    const mixedOverlapping: MessageEntity[] = [
      { type: "bold" as const, offset: 0, length: 9 }, // bold: 0-9
      { type: "bold" as const, offset: 8, length: 4 }, // bold: 8-12
      { type: "bold" as const, offset: 10, length: 6 }, // bold: 10-16
      { type: "italic" as const, offset: 3, length: 4 }, // italic: 3-7
      { type: "italic" as const, offset: 7, length: 4 }, // italic: 7-11
    ];

    const mixedResult = consolidateEntities(mixedOverlapping);
    assertEquals(mixedResult.length, 2); // Should have 2 entities: 1 bold, 1 italic

    // Find the bold and italic entities in the result
    const boldEntity = mixedResult.find((e) => e.type === "bold");
    const italicEntity = mixedResult.find((e) => e.type === "italic");

    assertEquals(boldEntity?.offset, 0);
    assertEquals(boldEntity?.length, 16); // Should span from 0 to 16 (consolidating all bold entities)
    assertEquals(italicEntity?.offset, 3);
    assertEquals(italicEntity?.length, 8); // Should remain unchanged as it's a different type
  });

  it("consolidateEntities with pre entities and different languages", () => {
    // Test entities with different languages (should not consolidate)
    const differentLanguageEntities: MessageEntity[] = [
      {
        type: "pre" as const,
        offset: 0,
        length: 5,
        language: "javascript",
      },
      {
        type: "pre" as const,
        offset: 3,
        length: 7,
        language: "python",
      },
    ];

    const differentLanguageResult = consolidateEntities(
      differentLanguageEntities,
    );
    assertEquals(differentLanguageResult.length, 2); // Should not consolidate different languages

    // Test entities with same language (should consolidate)
    const sameLanguageEntities: MessageEntity[] = [
      {
        type: "pre" as const,
        offset: 0,
        length: 5,
        language: "javascript",
      },
      {
        type: "pre" as const,
        offset: 3,
        length: 7,
        language: "javascript",
      },
    ];

    const sameLanguageResult = consolidateEntities(sameLanguageEntities);
    assertEquals(sameLanguageResult.length, 1); // Should consolidate same languages
    assertEquals(sameLanguageResult[0]?.length, 10);

    // Test mixed consolidation with overlapping pre entities having different languages
    const mixedLanguageEntities: MessageEntity[] = [
      {
        type: "pre",
        offset: 0,
        length: 5,
        language: "javascript",
      },
      {
        type: "pre",
        offset: 2,
        length: 4,
        language: "javascript",
      },
      {
        type: "pre",
        offset: 7,
        length: 3,
        language: "python",
      },
    ];

    const mixedLanguageResult = consolidateEntities(mixedLanguageEntities);
    assertEquals(mixedLanguageResult.length, 2); // Should have 2 entities: 1 for each language

    const jsEntity = mixedLanguageResult.find((e) =>
      e.type === "pre" && e.language === "javascript"
    );
    const pythonEntity = mixedLanguageResult.find((e) =>
      e.type === "pre" && e.language === "python"
    );

    assertEquals(jsEntity?.offset, 0);
    assertEquals(jsEntity?.length, 6); // Should consolidate overlapping JS entities (0-6)
    assertEquals(pythonEntity?.offset, 7);
    assertEquals(pythonEntity?.length, 3); // Python entity should remain unchanged
  });

  it("consolidateEntities with custom_emoji entities and different IDs", () => {
    // Test entities with different custom_emoji_id (should not consolidate)
    const differentEmojiIdEntities: MessageEntity[] = [
      {
        type: "custom_emoji" as const,
        offset: 0,
        length: 5,
        custom_emoji_id: "emoji_123",
      },
      {
        type: "custom_emoji" as const,
        offset: 3,
        length: 7,
        custom_emoji_id: "emoji_456",
      },
    ];

    const differentEmojiIdResult = consolidateEntities(
      differentEmojiIdEntities,
    );
    assertEquals(differentEmojiIdResult.length, 2); // Should not consolidate different emoji IDs

    // Test entities with same custom_emoji_id (should consolidate)
    const sameEmojiIdEntities: MessageEntity[] = [
      {
        type: "custom_emoji" as const,
        offset: 0,
        length: 5,
        custom_emoji_id: "emoji_123",
      },
      {
        type: "custom_emoji" as const,
        offset: 3,
        length: 7,
        custom_emoji_id: "emoji_123",
      },
    ];

    const sameEmojiIdResult = consolidateEntities(sameEmojiIdEntities);
    assertEquals(sameEmojiIdResult.length, 1); // Should consolidate same emoji IDs
    assertEquals(sameEmojiIdResult[0]?.length, 10);

    // Test mixed consolidation scenarios with custom_emoji entities
    const mixedEmojiEntities: MessageEntity[] = [
      {
        type: "custom_emoji" as const,
        offset: 0,
        length: 5,
        custom_emoji_id: "emoji_123",
      },
      {
        type: "custom_emoji" as const,
        offset: 2,
        length: 4,
        custom_emoji_id: "emoji_123",
      },
      {
        type: "custom_emoji" as const,
        offset: 7,
        length: 3,
        custom_emoji_id: "emoji_456",
      },
    ];

    const mixedEmojiResult = consolidateEntities(mixedEmojiEntities);
    assertEquals(mixedEmojiResult.length, 2); // Should have 2 entities: 1 for each emoji ID

    const emoji123Entity = mixedEmojiResult.find((e) =>
      e.type === "custom_emoji" &&
      (e as MessageEntity & { custom_emoji_id: string }).custom_emoji_id ===
        "emoji_123"
    );
    const emoji456Entity = mixedEmojiResult.find((e) =>
      e.type === "custom_emoji" &&
      (e as MessageEntity & { custom_emoji_id: string }).custom_emoji_id ===
        "emoji_456"
    );

    assertEquals(emoji123Entity?.offset, 0);
    assertEquals(emoji123Entity?.length, 6); // Should consolidate overlapping entities with same ID (0-6)
    assertEquals(emoji456Entity?.offset, 7);
    assertEquals(emoji456Entity?.length, 3); // Different emoji ID entity should remain unchanged
  });

  it("consolidateEntities with text_mention entities and different users", () => {
    // Test entities with different users (should not consolidate)
    const differentUserEntities: MessageEntity[] = [
      {
        type: "text_mention" as const,
        offset: 0,
        length: 5,
        user: { id: 123, is_bot: false, first_name: "Alice" },
      },
      {
        type: "text_mention" as const,
        offset: 3,
        length: 7,
        user: { id: 456, is_bot: false, first_name: "Bob" },
      },
    ];

    const differentUserResult = consolidateEntities(
      differentUserEntities,
    );
    assertEquals(differentUserResult.length, 2); // Should not consolidate different users

    // Test entities with same user (should consolidate)
    const sameUserEntities: MessageEntity[] = [
      {
        type: "text_mention" as const,
        offset: 0,
        length: 5,
        user: { id: 123, is_bot: false, first_name: "Alice" },
      },
      {
        type: "text_mention" as const,
        offset: 3,
        length: 7,
        user: { id: 123, is_bot: false, first_name: "Alice" },
      },
    ];

    const sameUserResult = consolidateEntities(sameUserEntities);
    assertEquals(sameUserResult.length, 1); // Should consolidate same users
    assertEquals(sameUserResult[0]?.length, 10);

    // Test mixed consolidation scenarios with text_mention entities
    const mixedUserEntities: MessageEntity[] = [
      {
        type: "text_mention" as const,
        offset: 0,
        length: 5,
        user: { id: 123, is_bot: false, first_name: "Alice" },
      },
      {
        type: "text_mention" as const,
        offset: 2,
        length: 4,
        user: { id: 123, is_bot: false, first_name: "Alice" },
      },
      {
        type: "text_mention" as const,
        offset: 7,
        length: 3,
        user: { id: 456, is_bot: false, first_name: "Bob" },
      },
    ];

    const mixedUserResult = consolidateEntities(mixedUserEntities);
    assertEquals(mixedUserResult.length, 2); // Should have 2 entities: 1 for each user

    const aliceEntity = mixedUserResult.find((e) =>
      e.type === "text_mention" &&
      (e as MessageEntity & { user: import("../src/deps.deno.ts").User }).user
          ?.id === 123
    );
    const bobEntity = mixedUserResult.find((e) =>
      e.type === "text_mention" &&
      (e as MessageEntity & { user: import("../src/deps.deno.ts").User }).user
          ?.id === 456
    );

    assertEquals(aliceEntity?.offset, 0);
    assertEquals(aliceEntity?.length, 6); // Should consolidate overlapping Alice entities (0-6)
    assertEquals(bobEntity?.offset, 7);
    assertEquals(bobEntity?.length, 3); // Bob entity should remain unchanged
  });

  it("consolidateEntities uses same sorting logic as sortEntities", () => {
    // Test mixed entity types with overlapping positions to verify deterministic sorting
    const entities: MessageEntity[] = [
      { type: "text_link", offset: 5, length: 5, url: "https://z.com" },
      { type: "bold", offset: 5, length: 5 },
      { type: "italic", offset: 5, length: 5 },
      { type: "text_link", offset: 5, length: 5, url: "https://a.com" },
      { type: "pre", offset: 5, length: 5, language: "python" },
      { type: "pre", offset: 5, length: 5, language: "javascript" },
    ];

    const consolidated = consolidateEntities(entities);
    const sorted = sortEntities(entities);

    // Since these entities don't overlap (same offset and length but different types/properties),
    // consolidateEntities should return all entities, and they should be in the same order as sortEntities
    assertEquals(consolidated.length, entities.length);
    assertEquals(sorted.length, entities.length);

    // Verify the order matches between consolidated and sorted results
    for (let i = 0; i < consolidated.length; i++) {
      assertEquals(consolidated[i].type, sorted[i].type);
      assertEquals(consolidated[i].offset, sorted[i].offset);
      assertEquals(consolidated[i].length, sorted[i].length);

      // Check type-specific properties
      if (
        consolidated[i].type === "text_link" && sorted[i].type === "text_link"
      ) {
        assertEquals(
          (consolidated[i] as MessageEntity & { url: string }).url,
          (sorted[i] as MessageEntity & { url: string }).url,
        );
      }
      if (consolidated[i].type === "pre" && sorted[i].type === "pre") {
        assertEquals(
          (consolidated[i] as MessageEntity & { language?: string }).language,
          (sorted[i] as MessageEntity & { language?: string }).language,
        );
      }
    }

    // Test with consolidatable entities to ensure final sort is deterministic
    const consolidatableEntities: MessageEntity[] = [
      { type: "bold", offset: 0, length: 3 },
      { type: "bold", offset: 2, length: 4 }, // overlaps with first bold
      { type: "italic", offset: 10, length: 5 },
      { type: "text_link", offset: 15, length: 3, url: "https://example.com" },
      { type: "text_link", offset: 20, length: 2, url: "https://test.com" },
    ];

    const consolidatedMixed = consolidateEntities(consolidatableEntities);

    // Should have 4 entities: 1 consolidated bold + 1 italic + 2 text_links
    assertEquals(consolidatedMixed.length, 4);

    // Verify they are sorted deterministically by offset first
    assertEquals(consolidatedMixed[0].type, "bold");
    assertEquals(consolidatedMixed[0].offset, 0);
    assertEquals(consolidatedMixed[0].length, 6); // consolidated from 0-6

    assertEquals(consolidatedMixed[1].type, "italic");
    assertEquals(consolidatedMixed[1].offset, 10);

    assertEquals(consolidatedMixed[2].type, "text_link");
    assertEquals(consolidatedMixed[2].offset, 15);

    assertEquals(consolidatedMixed[3].type, "text_link");
    assertEquals(consolidatedMixed[3].offset, 20);
  });
});
