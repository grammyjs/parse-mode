import { assertEquals, describe, it } from "./deps.test.ts";
import { isEntitiesEqual } from "../src/util.ts";
import type { MessageEntity } from "../src/deps.deno.ts";

describe("isEntitiesEqual", () => {
  it("empty arrays comparison", () => {
    const empty1: MessageEntity[] = [];
    const empty2: MessageEntity[] = [];

    assertEquals(isEntitiesEqual(empty1, empty2), true);
  });

  it("arrays of different lengths", () => {
    const entities1: MessageEntity[] = [
      { type: "bold", offset: 0, length: 5 },
    ];
    const entities2: MessageEntity[] = [
      { type: "bold", offset: 0, length: 5 },
      { type: "italic", offset: 10, length: 3 },
    ];
    const empty: MessageEntity[] = [];

    assertEquals(isEntitiesEqual(entities1, entities2), false);
    assertEquals(isEntitiesEqual(entities2, entities1), false);
    assertEquals(isEntitiesEqual(entities1, empty), false);
    assertEquals(isEntitiesEqual(empty, entities1), false);
  });

  it("arrays with same entities in same order", () => {
    const entities1: MessageEntity[] = [
      { type: "bold", offset: 0, length: 5 },
      { type: "italic", offset: 10, length: 3 },
      { type: "code", offset: 20, length: 7 },
    ];
    const entities2: MessageEntity[] = [
      { type: "bold", offset: 0, length: 5 },
      { type: "italic", offset: 10, length: 3 },
      { type: "code", offset: 20, length: 7 },
    ];

    assertEquals(isEntitiesEqual(entities1, entities2), true);
  });

  it("arrays with same entities in different order", () => {
    const entities1: MessageEntity[] = [
      { type: "bold", offset: 0, length: 5 },
      { type: "italic", offset: 10, length: 3 },
    ];
    const entities2: MessageEntity[] = [
      { type: "italic", offset: 10, length: 3 },
      { type: "bold", offset: 0, length: 5 },
    ];

    // Order matters - entities must be in same positions
    assertEquals(isEntitiesEqual(entities1, entities2), false);
  });

  it("arrays with different entities", () => {
    const entities1: MessageEntity[] = [
      { type: "bold", offset: 0, length: 5 },
      { type: "italic", offset: 10, length: 3 },
    ];
    const entities2: MessageEntity[] = [
      { type: "bold", offset: 0, length: 5 },
      { type: "strikethrough", offset: 10, length: 3 },
    ];

    assertEquals(isEntitiesEqual(entities1, entities2), false);
  });

  it("arrays with partially matching entities", () => {
    const entities1: MessageEntity[] = [
      { type: "bold", offset: 0, length: 5 },
      { type: "italic", offset: 10, length: 3 },
      { type: "code", offset: 20, length: 4 },
    ];
    const entities2: MessageEntity[] = [
      { type: "bold", offset: 0, length: 5 },
      { type: "italic", offset: 10, length: 3 },
      { type: "code", offset: 20, length: 5 }, // Different length
    ];

    assertEquals(isEntitiesEqual(entities1, entities2), false);
  });

  it("single entity arrays", () => {
    const entities1: MessageEntity[] = [
      { type: "bold", offset: 0, length: 5 },
    ];
    const entities2: MessageEntity[] = [
      { type: "bold", offset: 0, length: 5 },
    ];
    const entities3: MessageEntity[] = [
      { type: "bold", offset: 1, length: 5 },
    ];

    assertEquals(isEntitiesEqual(entities1, entities2), true);
    assertEquals(isEntitiesEqual(entities1, entities3), false);
  });

  it("arrays with complex entity types - text_link", () => {
    const entities1: MessageEntity[] = [
      {
        type: "text_link",
        offset: 0,
        length: 5,
        url: "https://example.com",
      },
      {
        type: "text_link",
        offset: 10,
        length: 8,
        url: "https://github.com",
      },
    ];
    const entities2: MessageEntity[] = [
      {
        type: "text_link",
        offset: 0,
        length: 5,
        url: "https://example.com",
      },
      {
        type: "text_link",
        offset: 10,
        length: 8,
        url: "https://github.com",
      },
    ];
    const entities3: MessageEntity[] = [
      {
        type: "text_link",
        offset: 0,
        length: 5,
        url: "https://example.com",
      },
      {
        type: "text_link",
        offset: 10,
        length: 8,
        url: "https://different.com", // Different URL
      },
    ];

    assertEquals(isEntitiesEqual(entities1, entities2), true);
    assertEquals(isEntitiesEqual(entities1, entities3), false);
  });

  it("arrays with complex entity types - pre", () => {
    const entities1: MessageEntity[] = [
      {
        type: "pre",
        offset: 0,
        length: 10,
        language: "typescript",
      },
      {
        type: "pre",
        offset: 20,
        length: 15,
        language: "python",
      },
    ];
    const entities2: MessageEntity[] = [
      {
        type: "pre",
        offset: 0,
        length: 10,
        language: "typescript",
      },
      {
        type: "pre",
        offset: 20,
        length: 15,
        language: "python",
      },
    ];
    const entities3: MessageEntity[] = [
      {
        type: "pre",
        offset: 0,
        length: 10,
        language: "typescript",
      },
      {
        type: "pre",
        offset: 20,
        length: 15,
        language: "javascript", // Different language
      },
    ];

    assertEquals(isEntitiesEqual(entities1, entities2), true);
    assertEquals(isEntitiesEqual(entities1, entities3), false);
  });

  it("arrays with complex entity types - custom_emoji", () => {
    const entities1: MessageEntity[] = [
      {
        type: "custom_emoji",
        offset: 0,
        length: 5,
        custom_emoji_id: "emoji1",
      },
      {
        type: "custom_emoji",
        offset: 10,
        length: 4,
        custom_emoji_id: "emoji2",
      },
    ];
    const entities2: MessageEntity[] = [
      {
        type: "custom_emoji",
        offset: 0,
        length: 5,
        custom_emoji_id: "emoji1",
      },
      {
        type: "custom_emoji",
        offset: 10,
        length: 4,
        custom_emoji_id: "emoji2",
      },
    ];
    const entities3: MessageEntity[] = [
      {
        type: "custom_emoji",
        offset: 0,
        length: 5,
        custom_emoji_id: "emoji1",
      },
      {
        type: "custom_emoji",
        offset: 10,
        length: 4,
        custom_emoji_id: "emoji3", // Different emoji ID
      },
    ];

    assertEquals(isEntitiesEqual(entities1, entities2), true);
    assertEquals(isEntitiesEqual(entities1, entities3), false);
  });

  it("arrays with complex entity types - text_mention", () => {
    const entities1: MessageEntity[] = [
      {
        type: "text_mention",
        offset: 0,
        length: 8,
        user: {
          id: 123456789,
          is_bot: false,
          first_name: "John",
        },
      },
      {
        type: "text_mention",
        offset: 15,
        length: 6,
        user: {
          id: 987654321,
          is_bot: true,
          first_name: "Bot",
          username: "testbot",
        },
      },
    ];
    const entities2: MessageEntity[] = [
      {
        type: "text_mention",
        offset: 0,
        length: 8,
        user: {
          id: 123456789,
          is_bot: false,
          first_name: "John",
        },
      },
      {
        type: "text_mention",
        offset: 15,
        length: 6,
        user: {
          id: 987654321,
          is_bot: true,
          first_name: "Bot",
          username: "testbot",
        },
      },
    ];
    const entities3: MessageEntity[] = [
      {
        type: "text_mention",
        offset: 0,
        length: 8,
        user: {
          id: 123456789,
          is_bot: false,
          first_name: "John",
        },
      },
      {
        type: "text_mention",
        offset: 15,
        length: 6,
        user: {
          id: 999999999, // Different user ID
          is_bot: true,
          first_name: "Bot",
          username: "testbot",
        },
      },
    ];

    assertEquals(isEntitiesEqual(entities1, entities2), true);
    assertEquals(isEntitiesEqual(entities1, entities3), false);
  });

  it("mixed complex entity types", () => {
    const entities1: MessageEntity[] = [
      { type: "bold", offset: 0, length: 5 },
      {
        type: "text_link",
        offset: 10,
        length: 8,
        url: "https://example.com",
      },
      {
        type: "pre",
        offset: 25,
        length: 10,
        language: "typescript",
      },
      {
        type: "custom_emoji",
        offset: 40,
        length: 3,
        custom_emoji_id: "smile",
      },
    ];
    const entities2: MessageEntity[] = [
      { type: "bold", offset: 0, length: 5 },
      {
        type: "text_link",
        offset: 10,
        length: 8,
        url: "https://example.com",
      },
      {
        type: "pre",
        offset: 25,
        length: 10,
        language: "typescript",
      },
      {
        type: "custom_emoji",
        offset: 40,
        length: 3,
        custom_emoji_id: "smile",
      },
    ];

    assertEquals(isEntitiesEqual(entities1, entities2), true);
  });
});
