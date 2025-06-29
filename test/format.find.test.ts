import { assertEquals, describe, it } from "./deps.test.ts";
import { FormattedString } from "../src/format.ts";

describe("FormattedString - find method", () => {
  it("find method basic functionality", () => {
    // Test finding a simple text match
    const text = "Hello world, hello universe";
    const source = new FormattedString(text);
    const pattern = new FormattedString("hello");

    const result = source.find(pattern);
    assertEquals(result, 13); // Should find "hello" at position 13
  });

  it("find method with entities", () => {
    // Create a source with bold "world" at position 6
    const sourceText = "Hello world test";
    const sourceEntities = [{ type: "bold" as const, offset: 6, length: 5 }]; // "world"
    const source = new FormattedString(sourceText, sourceEntities);

    // Create pattern for bold "world"
    const patternText = "world";
    const patternEntities = [{ type: "bold" as const, offset: 0, length: 5 }];
    const pattern = new FormattedString(patternText, patternEntities);

    const result = source.find(pattern);
    assertEquals(result, 6); // Should find bold "world" at position 6
  });

  it("find method entities must match exactly", () => {
    // Create source with bold "world"
    const sourceText = "Hello world test world end";
    const sourceEntities = [{ type: "bold" as const, offset: 6, length: 5 }]; // first "world"
    const source = new FormattedString(sourceText, sourceEntities);

    // Create pattern for italic "world" (different formatting)
    const patternText = "world";
    const patternEntities = [{ type: "italic" as const, offset: 0, length: 5 }];
    const pattern = new FormattedString(patternText, patternEntities);

    const result = source.find(pattern);
    assertEquals(result, -1); // Should not find because entities don't match
  });

  it("find method text without entities", () => {
    // Create source with bold "world"
    const sourceText = "Hello world test world end";
    const sourceEntities = [{ type: "bold" as const, offset: 6, length: 5 }]; // first "world"
    const source = new FormattedString(sourceText, sourceEntities);

    // Create pattern for plain "world" (no entities)
    const pattern = new FormattedString("world");

    const result = source.find(pattern);
    assertEquals(result, 17); // Should find the second "world" at position 17 (plain text)
  });

  it("find method multiple entities", () => {
    // Create source with multiple formatting
    const sourceText = "Hello bold italic world";
    const sourceEntities = [
      { type: "bold" as const, offset: 6, length: 4 }, // "bold"
      { type: "italic" as const, offset: 11, length: 6 }, // "italic"
    ];
    const source = new FormattedString(sourceText, sourceEntities);

    // Create pattern matching the "bold italic" part
    const patternText = "bold italic";
    const patternEntities = [
      { type: "bold" as const, offset: 0, length: 4 }, // "bold"
      { type: "italic" as const, offset: 5, length: 6 }, // "italic"
    ];
    const pattern = new FormattedString(patternText, patternEntities);

    const result = source.find(pattern);
    assertEquals(result, 6); // Should find the pattern starting at position 6
  });

  it("find method not found", () => {
    const source = new FormattedString("Hello world");
    const pattern = new FormattedString("foo");

    const result = source.find(pattern);
    assertEquals(result, -1); // Should return -1 when not found
  });

  it("find method empty pattern", () => {
    const source = new FormattedString("Hello world");
    const pattern = new FormattedString("");

    const result = source.find(pattern);
    assertEquals(result, 0); // Empty string should match at the beginning
  });

  it("find method pattern longer than source", () => {
    const source = new FormattedString("Hi");
    const pattern = new FormattedString("Hello world");

    const result = source.find(pattern);
    assertEquals(result, -1); // Should return -1 when pattern is longer than source
  });

  it("find method exact match", () => {
    const text = "Hello world";
    const entities = [{ type: "bold" as const, offset: 0, length: 5 }];
    const source = new FormattedString(text, entities);
    const pattern = new FormattedString(text, entities);

    const result = source.find(pattern);
    assertEquals(result, 0); // Should find exact match at position 0
  });

  it("find method with text_link entity exact match", () => {
    // Test with entities that have additional properties like URL
    const sourceText = "Click here to visit example.com";
    const sourceEntities = [{
      type: "text_link" as const,
      offset: 6,
      length: 4,
      url: "https://example.com",
    }]; // "here"
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

    const result = source.find(pattern);
    assertEquals(result, 6); // Should find the link at position 6
  });

  it("find method with text_link entity but different url", () => {
    // Test with entities that have different URLs
    const sourceText = "Click here to visit example.com";
    const sourceEntities = [{
      type: "text_link" as const,
      offset: 6,
      length: 4,
      url: "https://example.com",
    }]; // "here"
    const source = new FormattedString(sourceText, sourceEntities);

    // Pattern with different URL
    const patternText = "here";
    const patternEntities = [{
      type: "text_link" as const,
      offset: 0,
      length: 4,
      url: "https://different.com",
    }];
    const pattern = new FormattedString(patternText, patternEntities);

    const result = source.find(pattern);
    assertEquals(result, -1); // Should not find because URLs are different
  });

  it("find method case sensitive", () => {
    const source = new FormattedString("Hello World");
    const pattern = new FormattedString("hello");

    const result = source.find(pattern);
    assertEquals(result, -1); // Should be case sensitive and not find "hello" in "Hello"
  });

  it("find method overlapping matches", () => {
    // Test that it finds the first match when there are overlapping possibilities
    const sourceText = "aaaa";
    const source = new FormattedString(sourceText);
    const pattern = new FormattedString("aa");

    const result = source.find(pattern);
    assertEquals(result, 0); // Should find the first "aa" at position 0
  });

  it("find method complex entity overlap", () => {
    // Test with entities that span across the search pattern boundaries
    const sourceText = "prefix bold and italic suffix";
    const sourceEntities = [
      { type: "bold" as const, offset: 7, length: 15 }, // "bold and italic"
      { type: "italic" as const, offset: 16, length: 6 }, // "italic"
    ];
    const source = new FormattedString(sourceText, sourceEntities);

    // Look for "and italic" with both bold on entire text and italic on "italic" part
    const patternText = "and italic";
    const patternEntities = [
      { type: "bold" as const, offset: 0, length: 10 }, // bold on entire "and italic"
      { type: "italic" as const, offset: 4, length: 6 }, // italic on "italic" part
    ];
    const pattern = new FormattedString(patternText, patternEntities);

    const result = source.find(pattern);
    assertEquals(result, 12); // Should find at position 12 where "and italic" starts
  });
});
