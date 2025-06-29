import { assertEquals, describe, it } from "./deps.test.ts";
import { consolidateEntities, sortEntities } from "../src/util.ts";
import type { MessageEntity } from "../src/deps.deno.ts";

describe("consolidateEntities", () => {
  it("consolidates overlapping entities of the same type", () => {
    const overlappingBoldEntities: MessageEntity[] = [
      { type: "bold", offset: 0, length: 6 },
      { type: "bold", offset: 2, length: 2 },
      { type: "bold", offset: 5, length: 3 },
    ];

    const consolidatedBold = consolidateEntities(
      overlappingBoldEntities,
    );
    assertEquals(consolidatedBold.length, 1);
    assertEquals(consolidatedBold[0]?.type, "bold");
    assertEquals(consolidatedBold[0]?.offset, 0);
    assertEquals(consolidatedBold[0]?.length, 8);
  });

  it("consolidates adjavent entities of the same type", () => {
    // Test adjacent entities (touching but not overlapping)
    const adjacentEntities: MessageEntity[] = [
      { type: "italic", offset: 0, length: 5 },
      { type: "italic", offset: 5, length: 3 },
    ];

    const consolidatedAdjacent = consolidateEntities(
      adjacentEntities,
    );
    assertEquals(consolidatedAdjacent.length, 1);
    assertEquals(consolidatedAdjacent[0]?.type, "italic");
    assertEquals(consolidatedAdjacent[0]?.offset, 0);
    assertEquals(consolidatedAdjacent[0]?.length, 8);
  });

  it("does not consolidate non-overlapping entities of the same type", () => {
    // Test non-overlapping entities of same type
    const nonOverlappingEntities: MessageEntity[] = [
      { type: "bold", offset: 0, length: 3 },
      { type: "bold", offset: 5, length: 3 },
    ];

    const nonOverlappingResult = consolidateEntities(
      nonOverlappingEntities,
    );
    assertEquals(nonOverlappingResult.length, 2);
    assertEquals(nonOverlappingResult[0]?.offset, 0);
    assertEquals(nonOverlappingResult[0]?.length, 3);
    assertEquals(nonOverlappingResult[1]?.offset, 5);
    assertEquals(nonOverlappingResult[1]?.length, 3);
  });

  it("does not consolidate overlapping entities of different types", () => {
    // Test different entity types (should not be consolidated)
    const differentTypeEntities: MessageEntity[] = [
      { type: "bold", offset: 0, length: 5 },
      { type: "italic", offset: 3, length: 7 },
    ];

    const differentTypesResult = consolidateEntities(
      differentTypeEntities,
    );
    assertEquals(differentTypesResult.length, 2);
    assertEquals(differentTypesResult[0]?.type, "bold");
    assertEquals(differentTypesResult[1]?.type, "italic");
  });

  it("does not consolidate overlapping entities of the same type but different type-specific property", () => {
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
  });

  it("consolidates overlapping entities of the same type with equal type-specific property", () => {
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
  });

  it("returns an empty array unchanged", () => {
    // Test empty array
    const emptyResult = consolidateEntities([]);
    assertEquals(emptyResult.length, 0);
  });

  it("returns a single-element array unchanged", () => {
    // Test single entity
    const singleEntity: MessageEntity[] = [
      { type: "bold", offset: 0, length: 5 },
    ];

    const singleResult = consolidateEntities(singleEntity);
    assertEquals(singleResult.length, 1);
    assertEquals(singleResult[0]?.type, "bold");
    assertEquals(singleResult[0]?.offset, 0);
    assertEquals(singleResult[0]?.length, 5);
  });

  it("consolidates overlapping entities of the same type given in reverse order", () => {
    const unsortedEntities: MessageEntity[] = [
      { type: "bold" as const, offset: 5, length: 3 },
      { type: "bold" as const, offset: 0, length: 6 },
    ];

    const unsortedResult = consolidateEntities(unsortedEntities);
    assertEquals(unsortedResult.length, 1);
    assertEquals(unsortedResult[0]?.offset, 0);
    assertEquals(unsortedResult[0]?.length, 8); // Should span from 0 to 8
  });

  it("consolidates entities and returns in same sort order as sortEntities", () => {
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
      const consolidatedEntity = consolidated[i];
      const sortedEntity = sorted[i];
      if (
        consolidatedEntity.type === "text_link" &&
        sortedEntity.type === "text_link"
      ) {
        assertEquals(consolidatedEntity.url, sortedEntity.url);
      }
      if (consolidatedEntity.type === "pre" && sortedEntity.type === "pre") {
        assertEquals(consolidatedEntity.language, sortedEntity.language);
      }
    }
  });
});
