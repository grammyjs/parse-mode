import { assertEquals, describe, it } from "./deps.test.ts";
import { FormattedString } from "../src/format.ts";

describe("FormattedString - findAll method", () => {
  it("findAll method basic functionality", () => {
    // Test finding multiple simple text matches
    const text = "Hello world, hello universe, hello galaxy";
    const source = new FormattedString(text);
    const pattern = new FormattedString("hello");

    const results = source.findAll(pattern);
    assertEquals(results.length, 2); // Should find 2 matches
    assertEquals(results[0], 13); // First "hello" at position 13
    assertEquals(results[1], 29); // Second "hello" at position 29
  });

  it("findAll method with entities", () => {
    // Create a source with multiple bold "world" instances
    const sourceText = "Hello world test world end world";
    const sourceEntities = [
      { type: "bold" as const, offset: 6, length: 5 }, // first "world"
      { type: "bold" as const, offset: 27, length: 5 }, // third "world"
    ];
    const source = new FormattedString(sourceText, sourceEntities);

    // Create pattern for bold "world"
    const patternText = "world";
    const patternEntities = [{ type: "bold" as const, offset: 0, length: 5 }];
    const pattern = new FormattedString(patternText, patternEntities);

    const results = source.findAll(pattern);
    assertEquals(results.length, 2); // Should find 2 bold "world" instances
    assertEquals(results[0], 6); // First bold "world" at position 6
    assertEquals(results[1], 27); // Third bold "world" at position 27
  });

  it("findAll method no matches", () => {
    const source = new FormattedString("Hello world");
    const pattern = new FormattedString("foo");

    const results = source.findAll(pattern);
    assertEquals(results.length, 0); // Should return empty array when not found
  });

  it("findAll method empty pattern", () => {
    const source = new FormattedString("Hello world");
    const pattern = new FormattedString("");

    const results = source.findAll(pattern);
    assertEquals(results.length, 1); // Empty string should match once at the beginning
    assertEquals(results[0], 0);
  });

  it("findAll method pattern longer than source", () => {
    const source = new FormattedString("Hi");
    const pattern = new FormattedString("Hello world");

    const results = source.findAll(pattern);
    assertEquals(results.length, 0); // Should return empty array when pattern is longer than source
  });

  it("findAll method exact match", () => {
    const text = "Hello world";
    const entities = [{ type: "bold" as const, offset: 0, length: 5 }];
    const source = new FormattedString(text, entities);
    const pattern = new FormattedString(text, entities);

    const results = source.findAll(pattern);
    assertEquals(results.length, 1); // Should find one exact match
    assertEquals(results[0], 0); // Should find exact match at position 0
  });

  it("findAll method overlapping patterns", () => {
    // Test that it finds all overlapping matches
    const sourceText = "aaaa";
    const source = new FormattedString(sourceText);
    const pattern = new FormattedString("aa");

    const results = source.findAll(pattern, true);
    assertEquals(results.length, 3); // Should find "aa" at positions 0, 1, 2
    assertEquals(results[0], 0);
    assertEquals(results[1], 1);
    assertEquals(results[2], 2);
  });

  it("findAll method non-overlapping patterns (default)", () => {
    // Test that it finds only non-overlapping matches by default
    const sourceText = "aaaa";
    const source = new FormattedString(sourceText);
    const pattern = new FormattedString("aa");

    const results = source.findAll(pattern);
    assertEquals(results.length, 2); // Should find "aa" at positions 0, 2 (non-overlapping)
    assertEquals(results[0], 0);
    assertEquals(results[1], 2);
  });

  it("findAll method non-overlapping patterns explicit", () => {
    // Test that it finds only non-overlapping matches when explicitly specified
    const sourceText = "aaaa";
    const source = new FormattedString(sourceText);
    const pattern = new FormattedString("aa");

    const results = source.findAll(pattern, false);
    assertEquals(results.length, 2); // Should find "aa" at positions 0, 2 (non-overlapping)
    assertEquals(results[0], 0);
    assertEquals(results[1], 2);
  });

  it("findAll method with text_link entity exact match", () => {
    // Test with entities that have additional properties like URL
    const sourceText = "Click here to visit example.com and here again";
    const sourceEntities = [
      {
        type: "text_link" as const,
        offset: 6,
        length: 4,
        url: "https://example.com",
      }, // first "here"
      {
        type: "text_link" as const,
        offset: 36,
        length: 4,
        url: "https://example.com",
      }, // second "here"
    ];
    const source = new FormattedString(sourceText, sourceEntities);

    // Pattern that matches the link with same URL
    const patternText = "here";
    const patternEntities = [{
      type: "text_link" as const,
      offset: 0,
      length: 4,
      url: "https://example.com",
    }];
    const pattern = new FormattedString(patternText, patternEntities);

    const results = source.findAll(pattern);
    assertEquals(results.length, 2); // Should find both links
    assertEquals(results[0], 6); // Should find the first link at position 6
    assertEquals(results[1], 36); // Should find the second link at position 36
  });

  it("findAll method mixed entity matches", () => {
    // Test finding formatted text when some instances have different or no entities
    const sourceText = "Hello bold and italic world test bold and italic world";
    const sourceEntities = [
      { type: "bold" as const, offset: 6, length: 15 }, // first "bold and italic"
      { type: "italic" as const, offset: 15, length: 6 }, // first "italic"
       { type: "bold" as const, offset: 33, length: 15 }, // second "bold and italic"
      { type: "italic" as const, offset: 42, length: 6 }, // second "italic"
    ];
    const source = new FormattedString(sourceText, sourceEntities);

    // Pattern for "bold world" with bold formatting
    const patternText = "and italic";
    const patternEntities = [
      { type: "bold" as const, offset: 0, length: 10 }, // "and italic"
      { type: "italic" as const, offset: 4, length: 6 }, // "italic"
    ];
    const pattern = new FormattedString(patternText, patternEntities);

    const results = source.findAll(pattern);
    assertEquals(results.length, 2); // Should find 2 "and italic" instances
    assertEquals(results[0], 11); // First "and italic" at position 11
    assertEquals(results[1], 38); // Second "and italic" at position 38
  });
});
