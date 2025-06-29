import { assertEquals, describe, it } from "./deps.test.ts";
import { sortEntities as sortEntities } from "../src/util.ts";
import type { MessageEntity } from "../src/deps.deno.ts";

describe("sortEntitiesDeterministically", () => {
  it("sorts entities by offset", () => {
    const entities: MessageEntity[] = [
      { type: "bold", offset: 10, length: 5 },
      { type: "italic", offset: 0, length: 3 },
      { type: "code", offset: 15, length: 2 },
    ];

    const sorted = sortEntities(entities);
    assertEquals(sorted[0].offset, 0);
    assertEquals(sorted[1].offset, 10);
    assertEquals(sorted[2].offset, 15);
  });

  it("sorts entities by length when offset is same", () => {
    const entities: MessageEntity[] = [
      { type: "bold", offset: 5, length: 10 },
      { type: "italic", offset: 5, length: 3 },
      { type: "code", offset: 5, length: 7 },
    ];

    const sorted = sortEntities(entities);
    assertEquals(sorted[0].length, 3);
    assertEquals(sorted[1].length, 7);
    assertEquals(sorted[2].length, 10);
  });

  it("sorts entities by type when offset and length are same", () => {
    const entities: MessageEntity[] = [
      { type: "underline", offset: 5, length: 5 },
      { type: "bold", offset: 5, length: 5 },
      { type: "italic", offset: 5, length: 5 },
    ];

    const sorted = sortEntities(entities);
    assertEquals(sorted[0].type, "bold");
    assertEquals(sorted[1].type, "italic");
    assertEquals(sorted[2].type, "underline");
  });

  it("sorts text_link entities by URL", () => {
    const entities: MessageEntity[] = [
      { type: "text_link", offset: 0, length: 5, url: "https://z.com" },
      { type: "text_link", offset: 0, length: 5, url: "https://a.com" },
      { type: "text_link", offset: 0, length: 5, url: "https://m.com" },
    ];

    const sorted = sortEntities(entities);
    assertEquals(
      (sorted[0] as MessageEntity & { type: "text_link" }).url,
      "https://a.com",
    );
    assertEquals(
      (sorted[1] as MessageEntity & { type: "text_link" }).url,
      "https://m.com",
    );
    assertEquals(
      (sorted[2] as MessageEntity & { type: "text_link" }).url,
      "https://z.com",
    );
  });

  it("sorts pre entities by language", () => {
    const entities: MessageEntity[] = [
      { type: "pre", offset: 0, length: 10, language: "typescript" },
      { type: "pre", offset: 0, length: 10, language: "javascript" },
      { type: "pre", offset: 0, length: 10, language: "python" },
    ];

    const sorted = sortEntities(entities);
    assertEquals(
      (sorted[0] as MessageEntity & { type: "pre" }).language,
      "javascript",
    );
    assertEquals(
      (sorted[1] as MessageEntity & { type: "pre" }).language,
      "python",
    );
    assertEquals(
      (sorted[2] as MessageEntity & { type: "pre" }).language,
      "typescript",
    );
  });

  it("sorts custom_emoji entities by emoji ID", () => {
    const entities: MessageEntity[] = [
      { type: "custom_emoji", offset: 0, length: 2, custom_emoji_id: "999" },
      { type: "custom_emoji", offset: 0, length: 2, custom_emoji_id: "111" },
      { type: "custom_emoji", offset: 0, length: 2, custom_emoji_id: "555" },
    ];

    const sorted = sortEntities(entities);
    assertEquals(
      (sorted[0] as MessageEntity & { type: "custom_emoji" }).custom_emoji_id,
      "111",
    );
    assertEquals(
      (sorted[1] as MessageEntity & { type: "custom_emoji" }).custom_emoji_id,
      "555",
    );
    assertEquals(
      (sorted[2] as MessageEntity & { type: "custom_emoji" }).custom_emoji_id,
      "999",
    );
  });

  it("sorts text_mention entities by user properties", () => {
    const entities: MessageEntity[] = [
      {
        type: "text_mention",
        offset: 0,
        length: 5,
        user: { id: 300, is_bot: false, first_name: "Charlie" },
      },
      {
        type: "text_mention",
        offset: 0,
        length: 5,
        user: { id: 100, is_bot: false, first_name: "Alice" },
      },
      {
        type: "text_mention",
        offset: 0,
        length: 5,
        user: { id: 200, is_bot: false, first_name: "Bob" },
      },
    ];

    const sorted = sortEntities(entities);
    assertEquals(
      (sorted[0] as MessageEntity & { type: "text_mention" }).user.id,
      100,
    );
    assertEquals(
      (sorted[1] as MessageEntity & { type: "text_mention" }).user.id,
      200,
    );
    assertEquals(
      (sorted[2] as MessageEntity & { type: "text_mention" }).user.id,
      300,
    );
  });

  it("sorts text_mention entities by username when user ID is same", () => {
    const entities: MessageEntity[] = [
      {
        type: "text_mention",
        offset: 0,
        length: 5,
        user: { id: 100, is_bot: false, first_name: "Test", username: "zebra" },
      },
      {
        type: "text_mention",
        offset: 0,
        length: 5,
        user: { id: 100, is_bot: false, first_name: "Test", username: "alpha" },
      },
    ];

    const sorted = sortEntities(entities);
    assertEquals(
      (sorted[0] as MessageEntity & { type: "text_mention" }).user.username,
      "alpha",
    );
    assertEquals(
      (sorted[1] as MessageEntity & { type: "text_mention" }).user.username,
      "zebra",
    );
  });

  it("sorts text_mention entities by first_name when ID and username are same", () => {
    const entities: MessageEntity[] = [
      {
        type: "text_mention",
        offset: 0,
        length: 5,
        user: { id: 100, is_bot: false, first_name: "Zoe", username: "same" },
      },
      {
        type: "text_mention",
        offset: 0,
        length: 5,
        user: { id: 100, is_bot: false, first_name: "Alice", username: "same" },
      },
    ];

    const sorted = sortEntities(entities);
    assertEquals(
      (sorted[0] as MessageEntity & { type: "text_mention" }).user.first_name,
      "Alice",
    );
    assertEquals(
      (sorted[1] as MessageEntity & { type: "text_mention" }).user.first_name,
      "Zoe",
    );
  });

  it("sorts text_mention entities by last_name when other properties are same", () => {
    const entities: MessageEntity[] = [
      {
        type: "text_mention",
        offset: 0,
        length: 5,
        user: {
          id: 100,
          is_bot: false,
          first_name: "John",
          last_name: "Smith",
          username: "same",
        },
      },
      {
        type: "text_mention",
        offset: 0,
        length: 5,
        user: {
          id: 100,
          is_bot: false,
          first_name: "John",
          last_name: "Doe",
          username: "same",
        },
      },
    ];

    const sorted = sortEntities(entities);
    assertEquals(
      (sorted[0] as MessageEntity & { type: "text_mention" }).user.last_name,
      "Doe",
    );
    assertEquals(
      (sorted[1] as MessageEntity & { type: "text_mention" }).user.last_name,
      "Smith",
    );
  });

  it("handles missing optional properties in text_link entities", () => {
    const entities: MessageEntity[] = [
      { type: "text_link", offset: 0, length: 5, url: "https://b.com" },
      { type: "text_link", offset: 0, length: 5, url: "" }, // missing url - use empty string instead
      { type: "text_link", offset: 0, length: 5, url: "https://a.com" },
    ];

    const sorted = sortEntities(entities);
    // Entity with empty URL should come first (empty string comparison)
    assertEquals((sorted[0] as MessageEntity & { type: "text_link" }).url, "");
    assertEquals(
      (sorted[1] as MessageEntity & { type: "text_link" }).url,
      "https://a.com",
    );
    assertEquals(
      (sorted[2] as MessageEntity & { type: "text_link" }).url,
      "https://b.com",
    );
  });

  it("handles missing optional properties in pre entities", () => {
    const entities: MessageEntity[] = [
      { type: "pre", offset: 0, length: 10, language: "python" },
      { type: "pre", offset: 0, length: 10, language: "" }, // missing language - use empty string
      { type: "pre", offset: 0, length: 10, language: "javascript" },
    ];

    const sorted = sortEntities(entities);
    // Entity with empty language should come first
    assertEquals((sorted[0] as MessageEntity & { type: "pre" }).language, "");
    assertEquals(
      (sorted[1] as MessageEntity & { type: "pre" }).language,
      "javascript",
    );
    assertEquals(
      (sorted[2] as MessageEntity & { type: "pre" }).language,
      "python",
    );
  });

  it("comprehensive sorting with mixed entity types", () => {
    const entities: MessageEntity[] = [
      { type: "text_link", offset: 5, length: 3, url: "https://example.com" },
      { type: "bold", offset: 0, length: 5 },
      { type: "italic", offset: 5, length: 3 },
      { type: "text_link", offset: 0, length: 3, url: "https://test.com" },
      { type: "pre", offset: 5, length: 3, language: "typescript" },
    ];

    const sorted = sortEntities(entities);

    // First by offset: 0, 0, 5, 5, 5
    assertEquals(sorted[0].offset, 0);
    assertEquals(sorted[1].offset, 0);
    assertEquals(sorted[2].offset, 5);
    assertEquals(sorted[3].offset, 5);
    assertEquals(sorted[4].offset, 5);

    // Among offset 0: length 3, 5
    assertEquals(sorted[0].length, 3);
    assertEquals(sorted[1].length, 5);

    // Among offset 5: length all 3, so by type alphabetically
    assertEquals(sorted[2].type, "italic");
    assertEquals(sorted[3].type, "pre");
    assertEquals(sorted[4].type, "text_link");
  });

  it("returns new array without modifying original", () => {
    const entities: MessageEntity[] = [
      { type: "bold", offset: 10, length: 5 },
      { type: "italic", offset: 5, length: 3 },
    ];

    const originalOrder = entities.map((e) => ({ ...e }));
    const sorted = sortEntities(entities);

    // Original array should be unchanged
    assertEquals(entities[0].offset, 10);
    assertEquals(entities[1].offset, 5);

    // But sorted array should be different
    assertEquals(sorted[0].offset, 5);
    assertEquals(sorted[1].offset, 10);

    // Verify they are different array references
    assertEquals(entities === sorted, false);
  });

  it("handles empty array", () => {
    const entities: MessageEntity[] = [];
    const sorted = sortEntities(entities);
    assertEquals(sorted.length, 0);
  });

  it("handles single entity array", () => {
    const entities: MessageEntity[] = [
      { type: "bold", offset: 5, length: 3 },
    ];
    const sorted = sortEntities(entities);
    assertEquals(sorted.length, 1);
    assertEquals(sorted[0].type, "bold");
    assertEquals(sorted[0].offset, 5);
    assertEquals(sorted[0].length, 3);
  });

  it("produces deterministic results with multiple calls", () => {
    const entities: MessageEntity[] = [
      { type: "underline", offset: 8, length: 2 },
      { type: "bold", offset: 3, length: 7 },
      { type: "italic", offset: 12, length: 4 },
      { type: "code", offset: 1, length: 2 },
    ];

    const sorted1 = sortEntities(entities);
    const sorted2 = sortEntities(entities);
    const sorted3 = sortEntities([...entities].reverse());

    // All calls should produce identical results
    assertEquals(sorted1.length, sorted2.length);
    assertEquals(sorted2.length, sorted3.length);

    for (let i = 0; i < sorted1.length; i++) {
      assertEquals(sorted1[i].type, sorted2[i].type);
      assertEquals(sorted1[i].offset, sorted2[i].offset);
      assertEquals(sorted1[i].length, sorted2[i].length);

      assertEquals(sorted2[i].type, sorted3[i].type);
      assertEquals(sorted2[i].offset, sorted3[i].offset);
      assertEquals(sorted2[i].length, sorted3[i].length);
    }
  });
});
