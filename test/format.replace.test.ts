import { assertEquals, describe, it } from "./deps.test.ts";
import { FormattedString } from "../src/format.ts";
import type { MessageEntity } from "../src/deps.deno.ts";

describe("FormattedString - Replace methods", () => {
  it("replace method basic functionality", () => {
    // Test replacing a simple text match
    const text = "Hello world, hello universe";
    const source = new FormattedString(text);
    const pattern = new FormattedString("hello");
    const replacement = new FormattedString("hi");

    const result = source.replace(pattern, replacement);
    assertEquals(result.rawText, "Hello world, hi universe");
    assertEquals(result.rawEntities.length, 0);
  });

  it("replace method with entities", () => {
    // Test replacing text with matching entities
    const sourceText = "Hello bold world and normal text";
    const sourceEntities: MessageEntity[] = [
      { type: "bold", offset: 6, length: 10 }, // "bold world"
    ];
    const source = new FormattedString(sourceText, sourceEntities);

    const pattern = new FormattedString("bold world", [
      { type: "bold", offset: 0, length: 10 },
    ]);
    const replacement = new FormattedString("italic text", [
      { type: "italic", offset: 0, length: 11 },
    ]);

    const result = source.replace(pattern, replacement);
    assertEquals(result.rawText, "Hello italic text and normal text");
    assertEquals(result.rawEntities.length, 1);
    assertEquals(result.rawEntities[0]?.type, "italic");
    assertEquals(result.rawEntities[0]?.offset, 6);
    assertEquals(result.rawEntities[0]?.length, 11);
  });

  it("does not replace if pattern entities do not match", () => {
    // Test that entities must match exactly for replacement
    const sourceText = "Hello bold world";
    const sourceEntities: MessageEntity[] = [
      { type: "bold", offset: 6, length: 10 }, // "bold world"
    ];
    const source = new FormattedString(sourceText, sourceEntities);

    // Pattern with different entities (italic instead of bold)
    const pattern = new FormattedString("bold world", [
      { type: "italic", offset: 0, length: 10 },
    ]);
    const replacement = new FormattedString("new text");

    const result = source.replace(pattern, replacement);
    // Should not replace because entities don't match
    assertEquals(result.rawText, "Hello bold world");
    assertEquals(result.rawEntities.length, 1);
    assertEquals(result.rawEntities[0]?.type, "bold");
  });

  it("does not replace if pattern text does not match", () => {
    // Test replacement when pattern is not found
    const source = new FormattedString("Hello world");
    const pattern = new FormattedString("goodbye");
    const replacement = new FormattedString("hi");

    const result = source.replace(pattern, replacement);
    assertEquals(result.rawText, "Hello world");
    assertEquals(result.rawEntities.length, 0);
  });

  it("replace preserves surrounding entities", () => {
    // Test that entities before and after replacement are preserved
    const sourceText = "Hello bold world and italic text";
    const sourceEntities = [
      { type: "bold" as const, offset: 6, length: 4 }, // "bold"
      { type: "italic" as const, offset: 21, length: 11 }, // "italic text"
    ];
    const source = new FormattedString(sourceText, sourceEntities);

    const pattern = new FormattedString("world");
    const replacement = new FormattedString("universe");

    const result = source.replace(pattern, replacement);
    assertEquals(result.rawText, "Hello bold universe and italic text");
    assertEquals(result.rawEntities.length, 2);

    // Check that "bold" entity is preserved
    assertEquals(result.rawEntities[0]?.type, "bold");
    assertEquals(result.rawEntities[0]?.offset, 6);
    assertEquals(result.rawEntities[0]?.length, 4);

    // Check that "italic text" entity is preserved and offset adjusted
    assertEquals(result.rawEntities[1]?.type, "italic");
    assertEquals(result.rawEntities[1]?.offset, 24); // offset shifted by +3 ("universe" vs "world")
    assertEquals(result.rawEntities[1]?.length, 11);
  });

  it("replace method complex entity replacement", () => {
    // Test replacing a complex pattern with multiple entities
    const sourceText = "Start bold and italic end";
    const sourceEntities = [
      { type: "bold" as const, offset: 6, length: 4 }, // "bold"
      { type: "italic" as const, offset: 15, length: 6 }, // "italic"
    ];
    const source = new FormattedString(sourceText, sourceEntities);

    const patternText = "bold and italic";
    const patternEntities = [
      { type: "bold" as const, offset: 0, length: 4 }, // "bold"
      { type: "italic" as const, offset: 9, length: 6 }, // "italic"
    ];
    const pattern = new FormattedString(patternText, patternEntities);

    const replacementText = "underlined text";
    const replacementEntities = [
      { type: "underline" as const, offset: 0, length: 15 },
    ];
    const replacement = new FormattedString(
      replacementText,
      replacementEntities,
    );

    const result = source.replace(pattern, replacement);
    assertEquals(result.rawText, "Start underlined text end");
    assertEquals(result.rawEntities.length, 1);
    assertEquals(result.rawEntities[0]?.type, "underline");
    assertEquals(result.rawEntities[0]?.offset, 6);
    assertEquals(result.rawEntities[0]?.length, 15);
  });

  it("replaceAll method basic functionality", () => {
    // Test replacing multiple simple text matches
    const text = "Hello world, hello universe, hello galaxy";
    const source = new FormattedString(text);
    const pattern = new FormattedString("hello");
    const replacement = new FormattedString("hi");

    const result = source.replaceAll(pattern, replacement);
    assertEquals(result.rawText, "Hello world, hi universe, hi galaxy");
    assertEquals(result.rawEntities.length, 0);
  });

  it("replaceAll method with entities", () => {
    // Test replacing multiple text matches with entities
    const sourceText = "Hello bold world and bold text";
    const sourceEntities = [
      { type: "bold" as const, offset: 6, length: 4 }, // first "bold"
      { type: "bold" as const, offset: 21, length: 4 }, // second "bold"
    ];
    const source = new FormattedString(sourceText, sourceEntities);

    const pattern = new FormattedString("bold", [
      { type: "bold" as const, offset: 0, length: 4 },
    ]);
    const replacement = new FormattedString("italic", [
      { type: "italic" as const, offset: 0, length: 6 },
    ]);

    const result = source.replaceAll(pattern, replacement);
    assertEquals(result.rawText, "Hello italic world and italic text");
    assertEquals(result.rawEntities.length, 2);

    // Check first replacement
    assertEquals(result.rawEntities[0]?.type, "italic");
    assertEquals(result.rawEntities[0]?.offset, 6);
    assertEquals(result.rawEntities[0]?.length, 6);

    // Check second replacement
    assertEquals(result.rawEntities[1]?.type, "italic");
    assertEquals(result.rawEntities[1]?.offset, 23); // offset adjusted for length difference
    assertEquals(result.rawEntities[1]?.length, 6);
  });

  it("replaceAll method no matches", () => {
    // Test replaceAll when pattern is not found
    const source = new FormattedString("Hello world");
    const pattern = new FormattedString("goodbye");
    const replacement = new FormattedString("hi");

    const result = source.replaceAll(pattern, replacement);
    assertEquals(result.rawText, "Hello world");
    assertEquals(result.rawEntities.length, 0);
  });

  it("replaceAll method overlapping prevention", () => {
    // Test that replaceAll doesn't create overlapping matches
    const text = "aaaa";
    const source = new FormattedString(text);
    const pattern = new FormattedString("aa");
    const replacement = new FormattedString("b");

    const result = source.replaceAll(pattern, replacement);
    // Should replace non-overlapping matches: "aa|aa" -> "b|b"
    assertEquals(result.rawText, "bb");
    assertEquals(result.rawEntities.length, 0);
  });

  it("replaceAll method empty replacement", () => {
    // Test replacing with empty string (deletion)
    const text = "Hello, world! Hello, universe!";
    const source = new FormattedString(text);
    const pattern = new FormattedString("Hello, ");
    const replacement = new FormattedString("");

    const result = source.replaceAll(pattern, replacement);
    assertEquals(result.rawText, "world! universe!");
    assertEquals(result.rawEntities.length, 0);
  });

  it("replace method replacement inside longer formatted string", () => {
    // Test the scenario from the issue: replace part of a longer formatted string
    // "Hello bolded world" where entire string is bolded, replace "bolded" with italicized "italics"
    const sourceText = "Hello bolded world";
    const sourceEntities: MessageEntity[] = [
      { type: "bold", offset: 0, length: 18 }, // entire string is bolded
    ];
    const source = new FormattedString(sourceText, sourceEntities);

    // Pattern is "bolded" with bold formatting to match the source formatting
    const pattern = new FormattedString("bolded", [
      { type: "bold", offset: 0, length: 6 },
    ]);

    // Replacement is "italics" with italic formatting
    const replacement = new FormattedString("italics", [
      { type: "italic", offset: 0, length: 7 },
    ]);

    const result = source.replace(pattern, replacement);
    assertEquals(result.rawText, "Hello italics world");
    assertEquals(result.rawEntities.length, 3);

    // Check that "Hello " remains bolded
    assertEquals(result.rawEntities[0]?.type, "bold");
    assertEquals(result.rawEntities[0]?.offset, 0);
    assertEquals(result.rawEntities[0]?.length, 6); // "Hello "

    // Check that "italics" is italicized
    assertEquals(result.rawEntities[1]?.type, "italic");
    assertEquals(result.rawEntities[1]?.offset, 6);
    assertEquals(result.rawEntities[1]?.length, 7); // "italics"

    // Check that " world" remains bolded
    assertEquals(result.rawEntities[2]?.type, "bold");
    assertEquals(result.rawEntities[2]?.offset, 13);
    assertEquals(result.rawEntities[2]?.length, 6); // " world"
  });

  it("replaceAll method replacement inside longer formatted string", () => {
    // Test replaceAll with the same scenario: multiple replacements inside longer formatted strings
    const sourceText = "Hello bolded world and bolded universe";
    const sourceEntities = [
      { type: "bold" as const, offset: 0, length: 38 }, // entire string is bolded
    ];
    const source = new FormattedString(sourceText, sourceEntities);

    // Pattern is "bolded" with bold formatting to match the source formatting
    const pattern = new FormattedString("bolded", [
      { type: "bold" as const, offset: 0, length: 6 },
    ]);

    // Replacement is "italics" with italic formatting
    const replacement = new FormattedString("italics", [
      { type: "italic" as const, offset: 0, length: 7 },
    ]);

    const result = source.replaceAll(pattern, replacement);
    assertEquals(result.rawText, "Hello italics world and italics universe");
    assertEquals(result.rawEntities.length, 5);

    // Check that "Hello " remains bolded
    assertEquals(result.rawEntities[0]?.type, "bold");
    assertEquals(result.rawEntities[0]?.offset, 0);
    assertEquals(result.rawEntities[0]?.length, 6); // "Hello "

    // Check that first "italics" is italicized
    assertEquals(result.rawEntities[1]?.type, "italic");
    assertEquals(result.rawEntities[1]?.offset, 6);
    assertEquals(result.rawEntities[1]?.length, 7); // "italics"

    // Check that " world and " remains bolded
    assertEquals(result.rawEntities[2]?.type, "bold");
    assertEquals(result.rawEntities[2]?.offset, 13);
    assertEquals(result.rawEntities[2]?.length, 11); // " world and "

    // Check that second "italics" is italicized
    assertEquals(result.rawEntities[3]?.type, "italic");
    assertEquals(result.rawEntities[3]?.offset, 24);
    assertEquals(result.rawEntities[3]?.length, 7); // "italics"

    // Check that " universe" remains bolded
    assertEquals(result.rawEntities[4]?.type, "bold");
    assertEquals(result.rawEntities[4]?.offset, 31);
    assertEquals(result.rawEntities[4]?.length, 9); // " universe"
  });
});
