import { assertEquals, describe, it } from "./deps.test.ts";
import { sortEntities as sortEntities } from "../src/util.ts";
import type { MessageEntity } from "../src/deps.deno.ts";

describe("sortEntities", () => {
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

    const sorted = sortEntities(
      entities,
    ) as (MessageEntity & { type: "text_link" })[];
    assertEquals(sorted[0].url, "https://a.com");
    assertEquals(sorted[1].url, "https://m.com");
    assertEquals(sorted[2].url, "https://z.com");
  });

  it("sorts pre entities by language", () => {
    const entities: MessageEntity[] = [
      { type: "pre", offset: 0, length: 10, language: "typescript" },
      { type: "pre", offset: 0, length: 10, language: "javascript" },
      { type: "pre", offset: 0, length: 10 },
    ];

    const sorted = sortEntities(
      entities,
    ) as (MessageEntity & { type: "pre" })[];
    // Entity with undefined language uses empty string for comparison, and so will come first
    assertEquals(sorted[0].language, undefined);
    assertEquals(sorted[1].language, "javascript");
    assertEquals(sorted[2].language, "typescript");
  });

  it("sorts custom_emoji entities by emoji ID", () => {
    const entities: MessageEntity[] = [
      { type: "custom_emoji", offset: 0, length: 2, custom_emoji_id: "999" },
      { type: "custom_emoji", offset: 0, length: 2, custom_emoji_id: "111" },
      { type: "custom_emoji", offset: 0, length: 2, custom_emoji_id: "555" },
    ];

    const sorted = sortEntities(
      entities,
    ) as (MessageEntity & { type: "custom_emoji" })[];
    assertEquals(sorted[0].custom_emoji_id, "111");
    assertEquals(sorted[1].custom_emoji_id, "555");
    assertEquals(sorted[2].custom_emoji_id, "999");
  });

  it("sorts text_mention entities by user id", () => {
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

    const sorted = sortEntities(
      entities,
    ) as (MessageEntity & { type: "text_mention" })[];
    assertEquals(sorted[0].user.id, 100);
    assertEquals(sorted[1].user.id, 200);
    assertEquals(sorted[2].user.id, 300);
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
});
