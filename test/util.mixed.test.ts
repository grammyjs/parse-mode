import { assertEquals, describe, it } from "./deps.test.ts";
import { isEntityEqual, isEntitySimilar } from "../src/util.ts";
import type { MessageEntity } from "../src/deps.deno.ts";

describe("Utility method tests", () => {
  it("Entity comparison methods consistency", () => {
    const entity1: MessageEntity = { type: "italic", offset: 5, length: 10 };
    const entity2: MessageEntity = { type: "italic", offset: 5, length: 10 };
    const entity3: MessageEntity = { type: "italic", offset: 15, length: 8 };

    // If entities are equal, they should also be similar
    assertEquals(isEntityEqual(entity1, entity2), true);
    assertEquals(isEntitySimilar(entity1, entity2), true);

    // Entities can be similar but not equal
    assertEquals(isEntitySimilar(entity1, entity3), true);
    assertEquals(isEntityEqual(entity1, entity3), false);
  });
});
