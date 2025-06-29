import { assertEquals, describe, it } from "./deps.test.ts";
import { canConsolidateEntities } from "../src/util.ts";
import type { MessageEntity } from "../src/deps.deno.ts";

describe("canConsolidateEntities", () => {
  it("same type entities that overlap", () => {
    const entity1: MessageEntity = { type: "bold", offset: 0, length: 5 };
    const entity2: MessageEntity = { type: "bold", offset: 3, length: 4 };

    assertEquals(canConsolidateEntities(entity1, entity2), true);
  });

  it("same type entities that are adjacent", () => {
    const entity1: MessageEntity = { type: "italic", offset: 0, length: 5 };
    const entity2: MessageEntity = { type: "italic", offset: 5, length: 3 };

    assertEquals(canConsolidateEntities(entity1, entity2), true);
  });

  it("same type entities with gap between them", () => {
    const entity1: MessageEntity = { type: "bold", offset: 0, length: 3 };
    const entity2: MessageEntity = { type: "bold", offset: 5, length: 3 };

    assertEquals(canConsolidateEntities(entity1, entity2), false);
  });

  it("different type entities", () => {
    const entity1: MessageEntity = { type: "bold", offset: 0, length: 5 };
    const entity2: MessageEntity = { type: "italic", offset: 3, length: 4 };

    assertEquals(canConsolidateEntities(entity1, entity2), false);
  });

  it("text_link entities with same URLs", () => {
    const entity1: MessageEntity = {
      type: "text_link",
      offset: 0,
      length: 5,
      url: "https://example.com",
    };
    const entity2: MessageEntity = {
      type: "text_link",
      offset: 3,
      length: 7,
      url: "https://example.com",
    };

    assertEquals(canConsolidateEntities(entity1, entity2), true);
  });

  it("text_link entities with different URLs", () => {
    const entity1: MessageEntity = {
      type: "text_link",
      offset: 0,
      length: 5,
      url: "https://example.com",
    };
    const entity2: MessageEntity = {
      type: "text_link",
      offset: 3,
      length: 7,
      url: "https://different.com",
    };

    assertEquals(canConsolidateEntities(entity1, entity2), false);
  });

  it("pre entities with same languages", () => {
    const entity1: MessageEntity = {
      type: "pre",
      offset: 0,
      length: 10,
      language: "typescript",
    };
    const entity2: MessageEntity = {
      type: "pre",
      offset: 8,
      length: 5,
      language: "typescript",
    };

    assertEquals(canConsolidateEntities(entity1, entity2), true);
  });

  it("pre entities with different languages", () => {
    const entity1: MessageEntity = {
      type: "pre",
      offset: 0,
      length: 10,
      language: "typescript",
    };
    const entity2: MessageEntity = {
      type: "pre",
      offset: 8,
      length: 5,
      language: "javascript",
    };

    assertEquals(canConsolidateEntities(entity1, entity2), false);
  });

  it("custom_emoji entities with same IDs", () => {
    const entity1: MessageEntity = {
      type: "custom_emoji",
      offset: 0,
      length: 5,
      custom_emoji_id: "emoji123",
    };
    const entity2: MessageEntity = {
      type: "custom_emoji",
      offset: 3,
      length: 4,
      custom_emoji_id: "emoji123",
    };

    assertEquals(canConsolidateEntities(entity1, entity2), true);
  });

  it("custom_emoji entities with different IDs", () => {
    const entity1: MessageEntity = {
      type: "custom_emoji",
      offset: 0,
      length: 5,
      custom_emoji_id: "emoji123",
    };
    const entity2: MessageEntity = {
      type: "custom_emoji",
      offset: 3,
      length: 4,
      custom_emoji_id: "emoji456",
    };

    assertEquals(canConsolidateEntities(entity1, entity2), false);
  });

  it("text_mention entities with same users", () => {
    const user = {
      id: 123456789,
      is_bot: false,
      first_name: "John",
      username: "johndoe",
    };

    const entity1: MessageEntity = {
      type: "text_mention",
      offset: 0,
      length: 8,
      user: user,
    };
    const entity2: MessageEntity = {
      type: "text_mention",
      offset: 6,
      length: 5,
      user: user,
    };

    assertEquals(canConsolidateEntities(entity1, entity2), true);
  });

  it("text_mention entities with different users", () => {
    const user1 = {
      id: 123456789,
      is_bot: false,
      first_name: "John",
      username: "johndoe",
    };
    const user2 = {
      id: 987654321,
      is_bot: false,
      first_name: "Jane",
      username: "janedoe",
    };

    const entity1: MessageEntity = {
      type: "text_mention",
      offset: 0,
      length: 8,
      user: user1,
    };
    const entity2: MessageEntity = {
      type: "text_mention",
      offset: 6,
      length: 5,
      user: user2,
    };

    assertEquals(canConsolidateEntities(entity1, entity2), false);
  });

  it("edge cases with zero-length entities", () => {
    const entity1: MessageEntity = { type: "bold", offset: 5, length: 0 };
    const entity2: MessageEntity = { type: "bold", offset: 5, length: 3 };

    assertEquals(canConsolidateEntities(entity1, entity2), true);

    const entity3: MessageEntity = { type: "bold", offset: 0, length: 5 };
    const entity4: MessageEntity = { type: "bold", offset: 5, length: 0 };

    assertEquals(canConsolidateEntities(entity3, entity4), true);
  });

  it("entities in different order with gaps", () => {
    // The function checks if entity2.offset <= entity1.offset + entity1.length
    // So even if entity2 comes before entity1, if entity2.offset <= entity1End, they can consolidate
    const entity1: MessageEntity = { type: "bold", offset: 10, length: 5 }; // 10-15
    const entity2: MessageEntity = { type: "bold", offset: 3, length: 4 }; // 3-7

    // entity2.offset (3) <= entity1End (15)? Yes, so they can consolidate
    assertEquals(canConsolidateEntities(entity1, entity2), true);
  });

  it("entities that exactly touch at boundaries", () => {
    const entity1: MessageEntity = { type: "italic", offset: 0, length: 5 };
    const entity2: MessageEntity = { type: "italic", offset: 5, length: 3 };

    assertEquals(canConsolidateEntities(entity1, entity2), true);
  });

  it("entities with one completely inside another", () => {
    const entity1: MessageEntity = { type: "bold", offset: 0, length: 10 };
    const entity2: MessageEntity = { type: "bold", offset: 3, length: 4 };

    assertEquals(canConsolidateEntities(entity1, entity2), true);
  });

  it("entities that share single character", () => {
    const entity1: MessageEntity = { type: "code", offset: 0, length: 5 };
    const entity2: MessageEntity = { type: "code", offset: 4, length: 3 };

    assertEquals(canConsolidateEntities(entity1, entity2), true);
  });

  it("basic entity types consolidation", () => {
    // Test all basic types that should consolidate with themselves
    const basicTypes = [
      "bold",
      "italic",
      "underline",
      "strikethrough",
      "spoiler",
      "code",
    ] as const;

    for (const type of basicTypes) {
      const entity1: MessageEntity = { type, offset: 0, length: 5 };
      const entity2: MessageEntity = { type, offset: 3, length: 4 };

      assertEquals(
        canConsolidateEntities(entity1, entity2),
        true,
        `${type} entities should consolidate when overlapping`,
      );
    }
  });

  it("mixed entity types that should not consolidate", () => {
    const types = ["bold", "italic", "underline", "code"] as const;

    for (let i = 0; i < types.length; i++) {
      for (let j = i + 1; j < types.length; j++) {
        const entity1: MessageEntity = {
          type: types[i],
          offset: 0,
          length: 5,
        };
        const entity2: MessageEntity = {
          type: types[j],
          offset: 3,
          length: 4,
        };

        assertEquals(
          canConsolidateEntities(entity1, entity2),
          false,
          `${types[i]} and ${types[j]} should not consolidate`,
        );
      }
    }
  });

  it("pre entities without language should consolidate", () => {
    const entity1: MessageEntity = {
      type: "pre",
      offset: 0,
      length: 5,
    };
    const entity2: MessageEntity = {
      type: "pre",
      offset: 3,
      length: 4,
    };

    assertEquals(canConsolidateEntities(entity1, entity2), true);
  });

  it("pre entities with one having language and other not", () => {
    const entity1: MessageEntity = {
      type: "pre",
      offset: 0,
      length: 5,
      language: "typescript",
    };
    const entity2: MessageEntity = {
      type: "pre",
      offset: 3,
      length: 4,
    };

    assertEquals(canConsolidateEntities(entity1, entity2), false);
  });

  it("complex overlapping scenarios", () => {
    // Entity1 completely contains entity2
    const entity1: MessageEntity = { type: "bold", offset: 0, length: 20 };
    const entity2: MessageEntity = { type: "bold", offset: 5, length: 5 };
    assertEquals(canConsolidateEntities(entity1, entity2), true);

    // Entity2 extends beyond entity1
    const entity3: MessageEntity = { type: "italic", offset: 0, length: 10 };
    const entity4: MessageEntity = { type: "italic", offset: 8, length: 15 };
    assertEquals(canConsolidateEntities(entity3, entity4), true);

    // Entities share exact same position and length
    const entity5: MessageEntity = { type: "code", offset: 5, length: 10 };
    const entity6: MessageEntity = { type: "code", offset: 5, length: 10 };
    assertEquals(canConsolidateEntities(entity5, entity6), true);
  });
});
