import { assertEquals } from "./deps.test.ts";
import {
  consolidateEntities,
  isEntityEqual,
  isEntitySimilar,
  isUserEqual,
} from "../src/util.ts";
import type { MessageEntity, User } from "../src/deps.deno.ts";

// Entity comparison method tests
Deno.test("isEntitySimilar - basic functionality", () => {
  const entity1: MessageEntity = { type: "bold", offset: 0, length: 5 };
  const entity2: MessageEntity = { type: "bold", offset: 10, length: 3 };
  const entity3: MessageEntity = { type: "italic", offset: 0, length: 5 };

  // Same type, different offset/length should be similar
  assertEquals(isEntitySimilar(entity1, entity2), true);

  // Different type should not be similar
  assertEquals(isEntitySimilar(entity1, entity3), false);
});

Deno.test("isEntitySimilar - with text_link entities", () => {
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

Deno.test("isEntitySimilar - with pre entities", () => {
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

Deno.test("isEntitySimilar - with custom_emoji entities", () => {
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

Deno.test("isEntitySimilar - with text_mention entities", () => {
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

Deno.test("isEntityEqual - basic functionality", () => {
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

Deno.test("isEntityEqual - with text_link entities", () => {
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

Deno.test("isEntityEqual - comprehensive comparison", () => {
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

  // Different language should not be equal even with same position
  assertEquals(isEntityEqual(entity1, entity3), false);
});

// User comparison method tests
Deno.test("isUserEqual - identical users", () => {
  const user1: User = {
    id: 123,
    is_bot: false,
    first_name: "John",
    last_name: "Doe",
    username: "johndoe",
  };
  const user2: User = {
    id: 123,
    is_bot: false,
    first_name: "John",
    last_name: "Doe",
    username: "johndoe",
  };

  assertEquals(isUserEqual(user1, user2), true);
});

Deno.test("isUserEqual - different users", () => {
  const user1: User = {
    id: 123,
    is_bot: false,
    first_name: "John",
  };
  const user2: User = {
    id: 456,
    is_bot: false,
    first_name: "Jane",
  };

  assertEquals(isUserEqual(user1, user2), false);
});

Deno.test("isUserEqual - same properties but different values", () => {
  const user1: User = {
    id: 123,
    is_bot: false,
    first_name: "John",
  };
  const user2: User = {
    id: 123,
    is_bot: true,
    first_name: "John",
  };

  assertEquals(isUserEqual(user1, user2), false);
});

Deno.test("isUserEqual - null and undefined handling", () => {
  const user1 = {
    id: 123,
    is_bot: false,
    first_name: "John",
    last_name: null,
    username: undefined,
  } as unknown as User;
  const user2: User = {
    id: 123,
    is_bot: false,
    first_name: "John",
  };

  // null and undefined properties should be considered equal to absent properties
  assertEquals(isUserEqual(user1, user2), true);
});

Deno.test("isUserEqual - undefined vs null equivalence", () => {
  const user1 = {
    id: 123,
    is_bot: false,
    first_name: "John",
    last_name: null,
  } as unknown as User;
  const user2: User = {
    id: 123,
    is_bot: false,
    first_name: "John",
    last_name: undefined,
  };

  // null and undefined should be considered equal
  assertEquals(isUserEqual(user1, user2), true);
});

Deno.test("isUserEqual - extra properties with null/undefined", () => {
  const user1: User = {
    id: 123,
    is_bot: false,
    first_name: "John",
    last_name: "Doe",
  };
  const user2 = {
    id: 123,
    is_bot: false,
    first_name: "John",
    last_name: "Doe",
    username: null,
    language_code: undefined,
  } as unknown as User;

  // Extra null/undefined properties should not affect equality
  assertEquals(isUserEqual(user1, user2), true);
});

Deno.test("isUserEqual - missing vs present property", () => {
  const user1: User = {
    id: 123,
    is_bot: false,
    first_name: "John",
  };
  const user2: User = {
    id: 123,
    is_bot: false,
    first_name: "John",
    username: "johndoe",
  };

  // user2 has a non-null property that user1 doesn't have
  assertEquals(isUserEqual(user1, user2), false);
});

Deno.test("isUserEqual - different property sets", () => {
  const user1: User = {
    id: 123,
    is_bot: false,
    first_name: "John",
    username: "johndoe",
  };
  const user2: User = {
    id: 123,
    is_bot: false,
    first_name: "John",
    last_name: "Doe",
  };

  // Different non-null properties should make users unequal
  assertEquals(isUserEqual(user1, user2), false);
});

Deno.test("isUserEqual - empty object equivalence", () => {
  const user1: User = { id: 123, is_bot: false, first_name: "Test" };
  const user2: User = { id: 123, is_bot: false, first_name: "Test" };

  assertEquals(isUserEqual(user1, user2), true);
});

Deno.test("isUserEqual - complex scenario with mixed null/undefined", () => {
  const user1 = {
    id: 123,
    is_bot: false,
    first_name: "John",
    last_name: null,
    username: "johndoe",
    language_code: undefined,
  } as unknown as User;
  const user2: User = {
    id: 123,
    is_bot: false,
    first_name: "John",
    username: "johndoe",
  };

  // Should be equal despite null/undefined differences
  assertEquals(isUserEqual(user1, user2), true);
});

Deno.test("isUserEqual - boolean properties", () => {
  const user1: User = {
    id: 123,
    is_bot: false,
    first_name: "John",
  };
  const user2: User = {
    id: 123,
    is_bot: false,
    first_name: "John",
  };

  assertEquals(isUserEqual(user1, user2), true);

  const user3: User = {
    id: 123,
    is_bot: true,
    first_name: "John",
  };

  assertEquals(isUserEqual(user1, user3), false);
});

Deno.test("Entity comparison methods consistency", () => {
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

Deno.test("consolidateEntities method", () => {
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

Deno.test("consolidateEntities with complex overlapping", () => {
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
});
