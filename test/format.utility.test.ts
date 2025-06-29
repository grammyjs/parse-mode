import { assertEquals, assertInstanceOf, describe, it } from "./deps.test.ts";
import { FormattedString } from "../src/format.ts";
import type { MessageEntity } from "../src/deps.deno.ts";

describe("FormattedString - Utility Methods", () => {
  describe("Plain text methods", () => {
    it("Instance plain method", () => {
      const initialText = "Hello";
      const plainText = " World";
      const initialFormatted = new FormattedString(initialText, []);

      const plainResult = initialFormatted.plain(plainText);

      assertInstanceOf(plainResult, FormattedString);
      assertEquals(plainResult.rawText, `${initialText}${plainText}`);

      // Test entity properties - plain text should not add any entities
      assertEquals(plainResult.rawEntities.length, 0);
    });

    it("Stringable object as input", () => {
      const stringableObject = {
        toString: () => "custom string",
      };

      const result = FormattedString.bold(stringableObject);

      assertInstanceOf(result, FormattedString);
      assertEquals(result.rawText, "custom string");

      // Test entity properties
      assertEquals(result.rawEntities.length, 1);
      assertEquals(result.rawEntities[0]?.type, "bold");
      assertEquals(result.rawEntities[0]?.offset, 0);
      assertEquals(result.rawEntities[0]?.length, "custom string".length);
    });
  });

  describe("Complex chaining", () => {
    it("Complex chaining", () => {
      const result = new FormattedString("Start: ", [])
        .bold("Bold")
        .plain(" then ")
        .italic("Italic")
        .plain(" and ")
        .code("code");

      assertInstanceOf(result, FormattedString);
      assertEquals(result.rawText, "Start: Bold then Italic and code");

      // Test exact entity count and properties
      assertEquals(result.rawEntities.length, 3);

      // Test bold entity
      assertEquals(result.rawEntities[0]?.type, "bold");
      assertEquals(result.rawEntities[0]?.offset, 7); // After "Start: "
      assertEquals(result.rawEntities[0]?.length, 4); // "Bold"

      // Test italic entity
      assertEquals(result.rawEntities[1]?.type, "italic");
      assertEquals(result.rawEntities[1]?.offset, 17); // After "Start: Bold then "
      assertEquals(result.rawEntities[1]?.length, 6); // "Italic"

      // Test code entity
      assertEquals(result.rawEntities[2]?.type, "code");
      assertEquals(result.rawEntities[2]?.offset, 28); // After "Start: Bold then Italic and "
      assertEquals(result.rawEntities[2]?.length, 4); // "code"
    });
  });

  describe("Entity array handling", () => {
    it("Empty entities array", () => {
      const text = "Plain text";
      const formatted = new FormattedString(text, []);

      assertEquals(formatted.text, text);
      assertEquals(formatted.entities.length, 0);
      assertEquals(formatted.caption_entities.length, 0);
    });

    it("Multiple entities", () => {
      const text = "Hello World";
      const entities: MessageEntity[] = [
        { type: "bold" as const, offset: 0, length: 5 },
        { type: "italic" as const, offset: 6, length: 5 },
      ];

      const formatted = new FormattedString(text, entities);

      assertEquals(formatted.entities.length, 2);
      assertEquals(formatted.entities[0]?.type, "bold");
      assertEquals(formatted.entities[1]?.type, "italic");
    });
  });

  describe("Static join method", () => {
    it("Static join method", () => {
      // Test empty array
      const emptyResult = FormattedString.join([]);
      assertInstanceOf(emptyResult, FormattedString);
      assertEquals(emptyResult.rawText, "");
      assertEquals(emptyResult.rawEntities.length, 0);

      // Test array of strings
      const stringsResult = FormattedString.join(["Hello", " ", "World"]);
      assertInstanceOf(stringsResult, FormattedString);
      assertEquals(stringsResult.rawText, "Hello World");
      assertEquals(stringsResult.rawEntities.length, 0);

      // Test mixed array
      const boldText = FormattedString.bold("Bold");
      const italicText = FormattedString.italic("Italic");
      const plainText = " and ";

      const mixedResult = FormattedString.join([
        "Start: ",
        boldText,
        " then ",
        italicText,
        plainText,
        "plain",
      ]);

      assertInstanceOf(mixedResult, FormattedString);
      assertEquals(mixedResult.rawText, "Start: Bold then Italic and plain");

      // Test exact entity count and properties
      assertEquals(mixedResult.rawEntities.length, 2);

      // Test bold entity
      assertEquals(mixedResult.rawEntities[0]?.type, "bold");
      assertEquals(mixedResult.rawEntities[0]?.offset, 7); // After "Start: "
      assertEquals(mixedResult.rawEntities[0]?.length, 4); // "Bold"

      // Test italic entity
      assertEquals(mixedResult.rawEntities[1]?.type, "italic");
      assertEquals(mixedResult.rawEntities[1]?.offset, 17); // After "Start: Bold then "
      assertEquals(mixedResult.rawEntities[1]?.length, 6); // "Italic"

      // Test TextWithEntities and CaptionWithEntities
      const textWithEntities = {
        text: "TextWithEntities",
        entities: [{ type: "bold" as const, offset: 0, length: 4 }],
      };

      const captionWithEntities = {
        caption: "CaptionWithEntities",
        caption_entities: [{ type: "italic" as const, offset: 0, length: 7 }],
      };

      const combinedResult = FormattedString.join([
        "Start: ",
        textWithEntities,
        " and ",
        captionWithEntities,
      ]);

      assertInstanceOf(combinedResult, FormattedString);
      assertEquals(
        combinedResult.rawText,
        "Start: TextWithEntities and CaptionWithEntities",
      );

      // Test entity count
      assertEquals(combinedResult.rawEntities.length, 2);

      // Test first entity from TextWithEntities
      assertEquals(combinedResult.rawEntities[0]?.type, "bold");
      assertEquals(combinedResult.rawEntities[0]?.offset, 7); // After "Start: "
      assertEquals(combinedResult.rawEntities[0]?.length, 4); // "Text" part of "TextWithEntities"

      // Test second entity from CaptionWithEntities
      assertEquals(combinedResult.rawEntities[1]?.type, "italic");
      assertEquals(combinedResult.rawEntities[1]?.offset, 28); // After "Start: TextWithEntities and "
      assertEquals(combinedResult.rawEntities[1]?.length, 7); // "Caption"
    });

    it("Static join method with separator", () => {
      // Test basic string separator
      const result1 = FormattedString.join(["a", "b", "c"], " ");
      assertInstanceOf(result1, FormattedString);
      assertEquals(result1.rawText, "a b c");
      assertEquals(result1.rawEntities.length, 0);

      // Test different separator
      const result2 = FormattedString.join(["Hello", "World"], " - ");
      assertInstanceOf(result2, FormattedString);
      assertEquals(result2.rawText, "Hello - World");
      assertEquals(result2.rawEntities.length, 0);

      // Test with empty separator (should be same as no separator)
      const result3 = FormattedString.join(["a", "b", "c"], "");
      const result4 = FormattedString.join(["a", "b", "c"]);
      assertEquals(result3.rawText, result4.rawText);

      // Test with single item and separator
      const result5 = FormattedString.join(["single"], " - ");
      assertEquals(result5.rawText, "single");

      // Test with empty array and separator
      const result6 = FormattedString.join([], " - ");
      assertEquals(result6.rawText, "");

      // Test with formatted strings and separator
      const boldText = FormattedString.bold("Bold");
      const italicText = FormattedString.italic("Italic");
      const result7 = FormattedString.join([boldText, italicText], " | ");

      assertInstanceOf(result7, FormattedString);
      assertEquals(result7.rawText, "Bold | Italic");
      assertEquals(result7.rawEntities.length, 2);

      // Test entity positions with separator
      assertEquals(result7.rawEntities[0]?.type, "bold");
      assertEquals(result7.rawEntities[0]?.offset, 0);
      assertEquals(result7.rawEntities[0]?.length, 4); // "Bold"

      assertEquals(result7.rawEntities[1]?.type, "italic");
      assertEquals(result7.rawEntities[1]?.offset, 7); // After "Bold | "
      assertEquals(result7.rawEntities[1]?.length, 6); // "Italic"

      // Test with FormattedString as separator
      const separatorFormatted = FormattedString.underline(" - ");
      const result8 = FormattedString.join(
        ["Hello", "World"],
        separatorFormatted,
      );

      assertInstanceOf(result8, FormattedString);
      assertEquals(result8.rawText, "Hello - World");
      assertEquals(result8.rawEntities.length, 1);
      assertEquals(result8.rawEntities[0]?.type, "underline");
      assertEquals(result8.rawEntities[0]?.offset, 5); // After "Hello"
      assertEquals(result8.rawEntities[0]?.length, 3); // " - "

      // Test with TextWithEntities as separator
      const textSeparator = {
        text: " -> ",
        entities: [{ type: "code" as const, offset: 1, length: 2 }], // "->"
      };
      const result9 = FormattedString.join(["A", "B"], textSeparator);

      assertInstanceOf(result9, FormattedString);
      assertEquals(result9.rawText, "A -> B");
      assertEquals(result9.rawEntities.length, 1);
      assertEquals(result9.rawEntities[0]?.type, "code");
      assertEquals(result9.rawEntities[0]?.offset, 2); // After "A "
      assertEquals(result9.rawEntities[0]?.length, 2); // "->"
    });

    it("Static join method entity behavior", () => {
      // Test entity behavior when joining FormattedStrings
      const boldText1 = FormattedString.bold("Hello");
      const boldText2 = FormattedString.bold("World");

      const result = FormattedString.join([boldText1, boldText2], " ");

      assertInstanceOf(result, FormattedString);
      assertEquals(result.rawText, "Hello World");

      // Should have two separate bold entities because the space separator is not bold
      assertEquals(result.rawEntities.length, 2);
      assertEquals(result.rawEntities[0]?.type, "bold");
      assertEquals(result.rawEntities[0]?.offset, 0);
      assertEquals(result.rawEntities[0]?.length, 5); // "Hello"
      assertEquals(result.rawEntities[1]?.type, "bold");
      assertEquals(result.rawEntities[1]?.offset, 6);
      assertEquals(result.rawEntities[1]?.length, 5); // "World"

      // Test without separator - should also consolidate
      const resultNoSep = FormattedString.join([boldText1, boldText2]);

      assertInstanceOf(resultNoSep, FormattedString);
      assertEquals(resultNoSep.rawText, "HelloWorld");
      assertEquals(resultNoSep.rawEntities.length, 1);
      assertEquals(resultNoSep.rawEntities[0]?.type, "bold");
      assertEquals(resultNoSep.rawEntities[0]?.offset, 0);
      assertEquals(resultNoSep.rawEntities[0]?.length, 10); // "HelloWorld"

      // Test with different entity types - should NOT consolidate
      const boldText = FormattedString.bold("Hello");
      const italicText = FormattedString.italic("World");

      const mixedResult = FormattedString.join([boldText, italicText], " ");

      assertInstanceOf(mixedResult, FormattedString);
      assertEquals(mixedResult.rawText, "Hello World");
      assertEquals(mixedResult.rawEntities.length, 2); // Should remain separate
      assertEquals(mixedResult.rawEntities[0]?.type, "bold");
      assertEquals(mixedResult.rawEntities[1]?.type, "italic");

      // Test with FormattedString separator between same entity types
      const boldSeparator = FormattedString.bold(" | ");
      const resultWithBoldSep = FormattedString.join(
        [boldText1, boldText2],
        boldSeparator,
      );

      assertInstanceOf(resultWithBoldSep, FormattedString);
      assertEquals(resultWithBoldSep.rawText, "Hello | World");
      assertEquals(resultWithBoldSep.rawEntities.length, 1); // All bold parts should be consolidated
      assertEquals(resultWithBoldSep.rawEntities[0]?.type, "bold");
      assertEquals(resultWithBoldSep.rawEntities[0]?.offset, 0);
      assertEquals(resultWithBoldSep.rawEntities[0]?.length, 13); // "Hello | World"

      // Test that single item doesn't go through consolidation path
      const singleResult = FormattedString.join([boldText1]);
      assertInstanceOf(singleResult, FormattedString);
      assertEquals(singleResult.rawText, "Hello");
      assertEquals(singleResult.rawEntities.length, 1);
      assertEquals(singleResult.rawEntities[0]?.type, "bold");

      // Test empty array
      const emptyResult = FormattedString.join([]);
      assertInstanceOf(emptyResult, FormattedString);
      assertEquals(emptyResult.rawText, "");
      assertEquals(emptyResult.rawEntities.length, 0);
    });
  });

  describe("Slice operations", () => {
    it("Instance slice method", () => {
      // Test the example from the problem statement
      const originalText = "hello bold and italic world";
      const entities: MessageEntity[] = [
        { type: "bold" as const, offset: 6, length: 4 },
        { type: "italic" as const, offset: 15, length: 6 },
      ];
      const original = new FormattedString(originalText, entities);

      const sliced = original.slice(6, 20);

      assertInstanceOf(sliced, FormattedString);
      assertEquals(sliced.rawText, "bold and itali");
      assertEquals(sliced.rawEntities.length, 2);

      // Test bold entity adjustment
      assertEquals(sliced.rawEntities[0]?.type, "bold");
      assertEquals(sliced.rawEntities[0]?.offset, 0);
      assertEquals(sliced.rawEntities[0]?.length, 4);

      // Test italic entity adjustment
      assertEquals(sliced.rawEntities[1]?.type, "italic");
      assertEquals(sliced.rawEntities[1]?.offset, 9);
      assertEquals(sliced.rawEntities[1]?.length, 5);
    });

    it("slice method edge cases", () => {
      const text = "Hello World Test";
      const entities: MessageEntity[] = [
        { type: "bold" as const, offset: 0, length: 5 }, // "Hello"
        { type: "italic" as const, offset: 6, length: 5 }, // "World"
        { type: "code" as const, offset: 12, length: 4 }, // "Test"
      ];
      const original = new FormattedString(text, entities);

      // Test slice without parameters (should return full copy)
      const fullSlice = original.slice();
      assertInstanceOf(fullSlice, FormattedString);
      assertEquals(fullSlice.rawText, text);
      assertEquals(fullSlice.rawEntities.length, 3);
      assertEquals(fullSlice.rawEntities[0]?.type, "bold");
      assertEquals(fullSlice.rawEntities[1]?.type, "italic");
      assertEquals(fullSlice.rawEntities[2]?.type, "code");

      // Test slice with only start parameter
      const partialSlice = original.slice(6);
      assertEquals(partialSlice.rawText, "World Test");
      assertEquals(partialSlice.rawEntities.length, 2);
      assertEquals(partialSlice.rawEntities[0]?.type, "italic");
      assertEquals(partialSlice.rawEntities[0]?.offset, 0);
      assertEquals(partialSlice.rawEntities[0]?.length, 5);

      // Test slice that partially overlaps entities
      const overlappingSlice = original.slice(3, 9);
      assertEquals(overlappingSlice.rawText, "lo Wor");
      assertEquals(overlappingSlice.rawEntities.length, 2);

      // Bold entity should be partially included
      assertEquals(overlappingSlice.rawEntities[0]?.type, "bold");
      assertEquals(overlappingSlice.rawEntities[0]?.offset, 0);
      assertEquals(overlappingSlice.rawEntities[0]?.length, 2); // "lo"

      // Italic entity should be partially included
      assertEquals(overlappingSlice.rawEntities[1]?.type, "italic");
      assertEquals(overlappingSlice.rawEntities[1]?.offset, 3);
      assertEquals(overlappingSlice.rawEntities[1]?.length, 3); // "Wor"

      // Test slice that excludes all entities
      const noEntitiesSlice = original.slice(1, 2);
      assertEquals(noEntitiesSlice.rawText, "e");
      assertEquals(noEntitiesSlice.rawEntities.length, 1);
      assertEquals(noEntitiesSlice.rawEntities[0]?.type, "bold");
      assertEquals(noEntitiesSlice.rawEntities[0]?.offset, 0);
      assertEquals(noEntitiesSlice.rawEntities[0]?.length, 1);
    });

    it("slice method with empty string", () => {
      const empty = new FormattedString("", []);
      const sliced = empty.slice(0, 0);

      assertInstanceOf(sliced, FormattedString);
      assertEquals(sliced.rawText, "");
      assertEquals(sliced.rawEntities.length, 0);
    });

    it("slice method boundary conditions", () => {
      const text = "abcdef";
      const entities: MessageEntity[] = [
        { type: "bold" as const, offset: 1, length: 4 }, // "bcde"
      ];
      const original = new FormattedString(text, entities);

      // Test slice at entity boundaries
      const exactSlice = original.slice(1, 5);
      assertEquals(exactSlice.rawText, "bcde");
      assertEquals(exactSlice.rawEntities.length, 1);
      assertEquals(exactSlice.rawEntities[0]?.type, "bold");
      assertEquals(exactSlice.rawEntities[0]?.offset, 0);
      assertEquals(exactSlice.rawEntities[0]?.length, 4);

      // Test slice that goes beyond text length
      const beyondSlice = original.slice(0, 100);
      assertEquals(beyondSlice.rawText, text);
      assertEquals(beyondSlice.rawEntities.length, 1);

      // Test slice with negative start (should be treated as 0)
      const negativeStart = original.slice(-5, 3);
      assertEquals(negativeStart.rawText, "abc");
      assertEquals(negativeStart.rawEntities.length, 1);
      assertEquals(negativeStart.rawEntities[0]?.type, "bold");
      assertEquals(negativeStart.rawEntities[0]?.offset, 1);
      assertEquals(negativeStart.rawEntities[0]?.length, 2); // "bc"
    });

    it("slice method creates deep copy", () => {
      const original = new FormattedString("hello world", [
        { type: "bold" as const, offset: 0, length: 5 },
      ]);

      const sliced = original.slice(0, 7);

      // Verify it's a different object
      assertInstanceOf(sliced, FormattedString);
      assertEquals(sliced !== original, true);
      assertEquals(sliced.rawEntities !== original.rawEntities, true);
      assertEquals(sliced.rawEntities[0] !== original.rawEntities[0], true);

      // Verify the sliced result has the correct content
      assertEquals(sliced.rawText, "hello w");
      assertEquals(sliced.rawEntities.length, 1);
      assertEquals(sliced.rawEntities[0]?.type, "bold");
      assertEquals(sliced.rawEntities[0]?.offset, 0);
      assertEquals(sliced.rawEntities[0]?.length, 5);
    });
  });
});
