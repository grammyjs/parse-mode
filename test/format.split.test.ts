import { assertEquals, assertInstanceOf, describe, it } from "./deps.test.ts";
import { FormattedString } from "../src/format.ts";

describe("FormattedString - Split and Concat Methods", () => {
  describe("Split methods", () => {
    it("Static split method - basic functionality", () => {
      // Test basic string split with plain separator
      const text = new FormattedString("a,b,c");
      const separator = new FormattedString(",");
      const result = FormattedString.split(text, separator);

      assertEquals(result.length, 3);
      assertEquals(result[0]?.rawText, "a");
      assertEquals(result[1]?.rawText, "b");
      assertEquals(result[2]?.rawText, "c");
      assertEquals(result[0]?.rawEntities.length, 0);
      assertEquals(result[1]?.rawEntities.length, 0);
      assertEquals(result[2]?.rawEntities.length, 0);
    });

    it("Static split method - no separator found", () => {
      // Test when separator is not found
      const text = new FormattedString("hello world");
      const separator = new FormattedString(",");
      const result = FormattedString.split(text, separator);

      assertEquals(result.length, 1);
      assertEquals(result[0]?.rawText, "hello world");
      assertEquals(result[0]?.rawEntities.length, 0);
    });

    it("Static split method - empty separator", () => {
      // Test with empty separator - should return array of individual characters
      const text = new FormattedString("abc");
      const separator = new FormattedString("");
      const result = FormattedString.split(text, separator);

      assertEquals(result.length, 3);
      assertEquals(result[0]?.rawText, "a");
      assertEquals(result[1]?.rawText, "b");
      assertEquals(result[2]?.rawText, "c");
    });

    it("Static split method - empty text", () => {
      // Test with empty text
      const text = new FormattedString("");
      const separator = new FormattedString(",");
      const result = FormattedString.split(text, separator);

      assertEquals(result.length, 1);
      assertEquals(result[0]?.rawText, "");
      assertEquals(result[0]?.rawEntities.length, 0);
    });

    it("Static split method - empty text and empty separator", () => {
      // Test with both empty text and empty separator
      const text = new FormattedString("");
      const separator = new FormattedString("");
      const result = FormattedString.split(text, separator);

      assertEquals(result.length, 1);
      assertEquals(result[0]?.rawText, "");
      assertEquals(result[0]?.rawEntities.length, 0);
    });

    it("Static split method - separator at beginning/end", () => {
      // Test separator at beginning and end
      const text = new FormattedString(",a,b,");
      const separator = new FormattedString(",");
      const result = FormattedString.split(text, separator);

      assertEquals(result.length, 4);
      assertEquals(result[0]?.rawText, "");
      assertEquals(result[1]?.rawText, "a");
      assertEquals(result[2]?.rawText, "b");
      assertEquals(result[3]?.rawText, "");
    });

    it("Static split method - with entities", () => {
      // Test split with entities in text and separator
      const boldText = FormattedString.bold("Hello");
      const separator = FormattedString.italic(" | ");
      const italicText = FormattedString.italic("World");
      const text = FormattedString.join([boldText, separator, italicText]);

      const result = FormattedString.split(text, separator);

      assertEquals(result.length, 2);
      assertEquals(result[0]?.rawText, "Hello");
      assertEquals(result[1]?.rawText, "World");

      // First segment should have bold entity
      assertEquals(result[0]?.rawEntities.length, 1);
      assertEquals(result[0]?.rawEntities[0]?.type, "bold");
      assertEquals(result[0]?.rawEntities[0]?.offset, 0);
      assertEquals(result[0]?.rawEntities[0]?.length, 5);

      // Second segment should have italic entity
      assertEquals(result[1]?.rawEntities.length, 1);
      assertEquals(result[1]?.rawEntities[0]?.type, "italic");
      assertEquals(result[1]?.rawEntities[0]?.offset, 0);
      assertEquals(result[1]?.rawEntities[0]?.length, 5);
    });

    it("Static split method - separator with entities must match exactly", () => {
      // Test that separator entities must match exactly
      const text = new FormattedString("Hello | World | Test");
      const plainSeparator = new FormattedString(" | ");
      const boldSeparator = FormattedString.bold(" | ");

      // Plain separator should split successfully
      const result1 = FormattedString.split(text, plainSeparator);
      assertEquals(result1.length, 3);
      assertEquals(result1[0]?.rawText, "Hello");
      assertEquals(result1[1]?.rawText, "World");
      assertEquals(result1[2]?.rawText, "Test");

      // Bold separator should not find matches (no bold entities in text)
      const result2 = FormattedString.split(text, boldSeparator);
      assertEquals(result2.length, 1);
      assertEquals(result2[0]?.rawText, "Hello | World | Test");
    });

    it("Instance split method", () => {
      // Test instance split method
      const text = new FormattedString("a,b,c");
      const separator = new FormattedString(",");
      const result = text.split(separator);

      assertEquals(result.length, 3);
      assertEquals(result[0]?.rawText, "a");
      assertEquals(result[1]?.rawText, "b");
      assertEquals(result[2]?.rawText, "c");
    });

    it("Instance split method - with entities", () => {
      // Test instance split with entities
      const boldA = FormattedString.bold("A");
      const separator = new FormattedString(",");
      const italicB = FormattedString.italic("B");
      const text = FormattedString.join([boldA, separator, italicB]);

      const result = text.split(separator);

      assertEquals(result.length, 2);
      assertEquals(result[0]?.rawText, "A");
      assertEquals(result[1]?.rawText, "B");

      // Check entities are preserved
      assertEquals(result[0]?.rawEntities[0]?.type, "bold");
      assertEquals(result[1]?.rawEntities[0]?.type, "italic");
    });

    it("Static split method - consecutive separators", () => {
      // Test consecutive separators create empty segments
      const text = new FormattedString("a,,b");
      const separator = new FormattedString(",");
      const result = FormattedString.split(text, separator);

      assertEquals(result.length, 3);
      assertEquals(result[0]?.rawText, "a");
      assertEquals(result[1]?.rawText, ""); // empty segment
      assertEquals(result[2]?.rawText, "b");
    });

    it("Static split method - separator equals entire text", () => {
      // Test when separator is the entire text
      const text = new FormattedString(",");
      const separator = new FormattedString(",");
      const result = FormattedString.split(text, separator);

      assertEquals(result.length, 2);
      assertEquals(result[0]?.rawText, ""); // empty before
      assertEquals(result[1]?.rawText, ""); // empty after
    });

    it("Static split method - entity coverage affects matching", () => {
      // Test that entity coverage affects separator matching
      const boldText = FormattedString.bold("Hello World"); // bold covers entire text including space
      const plainSeparator = new FormattedString(" "); // space without entities

      // Should not match because space in bold text has bold entity but separator doesn't
      const result1 = FormattedString.split(boldText, plainSeparator);
      assertEquals(result1.length, 1);
      assertEquals(result1[0]?.rawText, "Hello World");

      // Should match if separator also has bold entity covering the space
      const boldSeparator = FormattedString.bold(" ");
      const result2 = FormattedString.split(boldText, boldSeparator);
      assertEquals(result2.length, 2);
      assertEquals(result2[0]?.rawText, "Hello");
      assertEquals(result2[1]?.rawText, "World");
    });
  });

  describe("SplitByText methods", () => {
    it("Static splitByText method - basic functionality", () => {
      // Test basic string split with plain separator
      const text = new FormattedString("a,b,c");
      const separator = new FormattedString(",");
      const result = FormattedString.splitByText(text, separator);

      assertEquals(result.length, 3);
      assertEquals(result[0]?.rawText, "a");
      assertEquals(result[1]?.rawText, "b");
      assertEquals(result[2]?.rawText, "c");
      assertEquals(result[0]?.rawEntities.length, 0);
      assertEquals(result[1]?.rawEntities.length, 0);
      assertEquals(result[2]?.rawEntities.length, 0);
    });

    it("Static splitByText method - ignores entity differences", () => {
      // Test that entity differences are ignored, unlike regular split
      const boldText = FormattedString.bold("Hello World"); // bold covers entire text including space
      const plainSeparator = new FormattedString(" "); // space without entities

      // Regular split should not match because space in bold text has bold entity but separator doesn't
      const regularResult = FormattedString.split(boldText, plainSeparator);
      assertEquals(regularResult.length, 1);
      assertEquals(regularResult[0]?.rawText, "Hello World");

      // splitByText should match because it ignores entity differences
      const plainTextResult = FormattedString.splitByText(
        boldText,
        plainSeparator,
      );
      assertEquals(plainTextResult.length, 2);
      assertEquals(plainTextResult[0]?.rawText, "Hello");
      assertEquals(plainTextResult[1]?.rawText, "World");

      // Entities should be preserved in the segments
      assertEquals(plainTextResult[0]?.rawEntities.length, 1);
      assertEquals(plainTextResult[0]?.rawEntities[0]?.type, "bold");
      assertEquals(plainTextResult[0]?.rawEntities[0]?.offset, 0);
      assertEquals(plainTextResult[0]?.rawEntities[0]?.length, 5);

      assertEquals(plainTextResult[1]?.rawEntities.length, 1);
      assertEquals(plainTextResult[1]?.rawEntities[0]?.type, "bold");
      assertEquals(plainTextResult[1]?.rawEntities[0]?.offset, 0);
      assertEquals(plainTextResult[1]?.rawEntities[0]?.length, 5);
    });

    it("Static splitByText method - complex entity preservation", () => {
      // Test with complex text that has different entities
      const part1 = FormattedString.bold("Hello");
      const separator = new FormattedString(" | ");
      const part2 = FormattedString.italic("Beautiful");
      const part3 = FormattedString.underline("World");
      const text = FormattedString.join([
        part1,
        separator,
        part2,
        separator,
        part3,
      ]);

      // Use a plain separator for splitByText
      const plainSeparator = new FormattedString(" | ");
      const result = FormattedString.splitByText(text, plainSeparator);

      assertEquals(result.length, 3);
      assertEquals(result[0]?.rawText, "Hello");
      assertEquals(result[1]?.rawText, "Beautiful");
      assertEquals(result[2]?.rawText, "World");

      // First segment should have bold entity
      assertEquals(result[0]?.rawEntities.length, 1);
      assertEquals(result[0]?.rawEntities[0]?.type, "bold");

      // Second segment should have italic entity
      assertEquals(result[1]?.rawEntities.length, 1);
      assertEquals(result[1]?.rawEntities[0]?.type, "italic");

      // Third segment should have underline entity
      assertEquals(result[2]?.rawEntities.length, 1);
      assertEquals(result[2]?.rawEntities[0]?.type, "underline");
    });

    it("Static splitByText method - no separator found", () => {
      // Test when separator is not found
      const text = new FormattedString("hello world");
      const separator = new FormattedString(",");
      const result = FormattedString.splitByText(text, separator);

      assertEquals(result.length, 1);
      assertEquals(result[0]?.rawText, "hello world");
      assertEquals(result[0]?.rawEntities.length, 0);
    });

    it("Static splitByText method - empty separator", () => {
      // Test with empty separator - should return array of individual characters
      const text = new FormattedString("abc");
      const separator = new FormattedString("");
      const result = FormattedString.splitByText(text, separator);

      assertEquals(result.length, 3);
      assertEquals(result[0]?.rawText, "a");
      assertEquals(result[1]?.rawText, "b");
      assertEquals(result[2]?.rawText, "c");
    });

    it("Static splitByText method - empty text", () => {
      // Test with empty text
      const text = new FormattedString("");
      const separator = new FormattedString(",");
      const result = FormattedString.splitByText(text, separator);

      assertEquals(result.length, 1);
      assertEquals(result[0]?.rawText, "");
      assertEquals(result[0]?.rawEntities.length, 0);
    });

    it("Static splitByText method - empty text and empty separator", () => {
      // Test with both empty text and empty separator
      const text = new FormattedString("");
      const separator = new FormattedString("");
      const result = FormattedString.splitByText(text, separator);

      assertEquals(result.length, 1);
      assertEquals(result[0]?.rawText, "");
      assertEquals(result[0]?.rawEntities.length, 0);
    });

    it("Static splitByText method - separator at beginning/end", () => {
      // Test separator at beginning and end
      const text = new FormattedString(",a,b,");
      const separator = new FormattedString(",");
      const result = FormattedString.splitByText(text, separator);

      assertEquals(result.length, 4);
      assertEquals(result[0]?.rawText, "");
      assertEquals(result[1]?.rawText, "a");
      assertEquals(result[2]?.rawText, "b");
      assertEquals(result[3]?.rawText, "");
    });

    it("Static splitByText method - consecutive separators", () => {
      // Test consecutive separators create empty segments
      const text = new FormattedString("a,,b");
      const separator = new FormattedString(",");
      const result = FormattedString.splitByText(text, separator);

      assertEquals(result.length, 3);
      assertEquals(result[0]?.rawText, "a");
      assertEquals(result[1]?.rawText, ""); // empty segment
      assertEquals(result[2]?.rawText, "b");
    });

    it("Static splitByText method - separator equals entire text", () => {
      // Test when separator is the entire text
      const text = new FormattedString(",");
      const separator = new FormattedString(",");
      const result = FormattedString.splitByText(text, separator);

      assertEquals(result.length, 2);
      assertEquals(result[0]?.rawText, ""); // empty before
      assertEquals(result[1]?.rawText, ""); // empty after
    });

    it("Instance splitByText method", () => {
      // Test instance splitByText method
      const text = new FormattedString("a,b,c");
      const separator = new FormattedString(",");
      const result = text.splitByText(separator);

      assertEquals(result.length, 3);
      assertEquals(result[0]?.rawText, "a");
      assertEquals(result[1]?.rawText, "b");
      assertEquals(result[2]?.rawText, "c");
    });

    it("Instance splitByText method - with entities", () => {
      // Test instance splitByText with entities that differ from separator
      const boldText = FormattedString.bold("A,B,C"); // bold covers entire text including commas
      const plainSeparator = new FormattedString(","); // comma without entities

      const result = boldText.splitByText(plainSeparator);

      assertEquals(result.length, 3);
      assertEquals(result[0]?.rawText, "A");
      assertEquals(result[1]?.rawText, "B");
      assertEquals(result[2]?.rawText, "C");

      // All segments should preserve their bold entity
      assertEquals(result[0]?.rawEntities[0]?.type, "bold");
      assertEquals(result[1]?.rawEntities[0]?.type, "bold");
      assertEquals(result[2]?.rawEntities[0]?.type, "bold");
    });

    it("splitByText vs split - comparison test", () => {
      // Direct comparison showing the difference between split and splitByText
      const sourceText = "Hello | World | Test";
      const sourceEntities = [
        { type: "bold" as const, offset: 8, length: 5 }, // "World" is bold
      ];
      const text = new FormattedString(sourceText, sourceEntities);
      const separator = new FormattedString(" | ");

      // Regular split should work fine (no entity conflicts)
      const splitResult = FormattedString.split(text, separator);
      assertEquals(splitResult.length, 3);
      assertEquals(splitResult[1]?.rawText, "World");
      assertEquals(splitResult[1]?.rawEntities[0]?.type, "bold");

      // splitByText should work the same in this case
      const splitByTextResult = FormattedString.splitByText(text, separator);
      assertEquals(splitByTextResult.length, 3);
      assertEquals(splitByTextResult[1]?.rawText, "World");
      assertEquals(splitByTextResult[1]?.rawEntities[0]?.type, "bold");

      // But with a bold separator, they should behave differently
      const boldSeparator = FormattedString.bold(" | ");

      // Regular split should not find matches (entity mismatch)
      const splitWithBoldSep = FormattedString.split(text, boldSeparator);
      assertEquals(splitWithBoldSep.length, 1);
      assertEquals(splitWithBoldSep[0]?.rawText, sourceText);

      // splitByText should still find matches (ignores entities)
      const splitByTextWithBoldSep = FormattedString.splitByText(
        text,
        boldSeparator,
      );
      assertEquals(splitByTextWithBoldSep.length, 3);
      assertEquals(splitByTextWithBoldSep[1]?.rawText, "World");
      assertEquals(splitByTextWithBoldSep[1]?.rawEntities[0]?.type, "bold");
    });
  });

  describe("Concat methods", () => {
    it("Instance concat method - single argument", () => {
      const first = FormattedString.bold("Hello");
      const second = FormattedString.italic("World");

      const result = first.concat(second);

      assertInstanceOf(result, FormattedString);
      assertEquals(result.rawText, "HelloWorld");
      assertEquals(result.rawEntities.length, 2);
      assertEquals(result.rawEntities[0]?.type, "bold");
      assertEquals(result.rawEntities[0]?.offset, 0);
      assertEquals(result.rawEntities[0]?.length, 5);
      assertEquals(result.rawEntities[1]?.type, "italic");
      assertEquals(result.rawEntities[1]?.offset, 5);
      assertEquals(result.rawEntities[1]?.length, 5);
    });

    it("Instance concat method - multiple arguments", () => {
      const first = FormattedString.bold("Hello");
      const second = new FormattedString(" ");
      const third = FormattedString.italic("Beautiful");
      const fourth = new FormattedString(" ");
      const fifth = FormattedString.code("World");

      const result = first.concat(second, third, fourth, fifth);

      assertInstanceOf(result, FormattedString);
      assertEquals(result.rawText, "Hello Beautiful World");
      assertEquals(result.rawEntities.length, 3);
      assertEquals(result.rawEntities[0]?.type, "bold");
      assertEquals(result.rawEntities[0]?.offset, 0);
      assertEquals(result.rawEntities[0]?.length, 5);
      assertEquals(result.rawEntities[1]?.type, "italic");
      assertEquals(result.rawEntities[1]?.offset, 6);
      assertEquals(result.rawEntities[1]?.length, 9);
      assertEquals(result.rawEntities[2]?.type, "code");
      assertEquals(result.rawEntities[2]?.offset, 16);
      assertEquals(result.rawEntities[2]?.length, 5);
    });

    it("Instance concat method - empty arguments", () => {
      const first = FormattedString.bold("Hello");
      const empty = new FormattedString("");

      const result = first.concat(empty);

      assertInstanceOf(result, FormattedString);
      assertEquals(result.rawText, "Hello");
      assertEquals(result.rawEntities.length, 1);
      assertEquals(result.rawEntities[0]?.type, "bold");
      assertEquals(result.rawEntities[0]?.offset, 0);
      assertEquals(result.rawEntities[0]?.length, 5);
    });

    it("Instance concat method - entity consolidation", () => {
      const first = FormattedString.bold("Hello");
      const second = FormattedString.bold("World");

      const result = first.concat(second);

      assertInstanceOf(result, FormattedString);
      assertEquals(result.rawText, "HelloWorld");
      // Should consolidate adjacent bold entities
      assertEquals(result.rawEntities.length, 1);
      assertEquals(result.rawEntities[0]?.type, "bold");
      assertEquals(result.rawEntities[0]?.offset, 0);
      assertEquals(result.rawEntities[0]?.length, 10);
    });

    it("Instance concat method - no arguments", () => {
      const first = FormattedString.bold("Hello");

      const result = first.concat();

      assertInstanceOf(result, FormattedString);
      assertEquals(result.rawText, "Hello");
      assertEquals(result.rawEntities.length, 1);
      assertEquals(result.rawEntities[0]?.type, "bold");
      assertEquals(result.rawEntities[0]?.offset, 0);
      assertEquals(result.rawEntities[0]?.length, 5);
    });
  });
});