import { assertEquals, assertInstanceOf, describe, it } from "./deps.test.ts";
import { FormattedString } from "../src/format.ts";
import type { MessageEntity } from "../src/deps.deno.ts";

describe("FormattedString - find method", () => {
  it("find method basic functionality", () => {
    // Test finding a simple text match
    const text = "Hello world, hello universe";
    const source = new FormattedString(text, []);
    const pattern = new FormattedString("hello", []);

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
    const pattern = new FormattedString("world", []);

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
    const source = new FormattedString("Hello world", []);
    const pattern = new FormattedString("foo", []);

    const result = source.find(pattern);
    assertEquals(result, -1); // Should return -1 when not found
  });

  it("find method empty pattern", () => {
    const source = new FormattedString("Hello world", []);
    const pattern = new FormattedString("", []);

    const result = source.find(pattern);
    assertEquals(result, 0); // Empty string should match at the beginning
  });

  it("find method pattern longer than source", () => {
    const source = new FormattedString("Hi", []);
    const pattern = new FormattedString("Hello world", []);

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

  it("find method with special entity properties", () => {
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

  it("find method different URL should not match", () => {
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
    const source = new FormattedString("Hello World", []);
    const pattern = new FormattedString("hello", []);

    const result = source.find(pattern);
    assertEquals(result, -1); // Should be case sensitive and not find "hello" in "Hello"
  });

  it("find method overlapping matches", () => {
    // Test that it finds the first match when there are overlapping possibilities
    const sourceText = "aaaa";
    const source = new FormattedString(sourceText, []);
    const pattern = new FormattedString("aa", []);

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

describe("FormattedString - findAll method", () => {
  it("findAll method basic functionality", () => {
    // Test finding multiple simple text matches
    const text = "Hello world, hello universe, hello galaxy";
    const source = new FormattedString(text, []);
    const pattern = new FormattedString("hello", []);

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
    const source = new FormattedString("Hello world", []);
    const pattern = new FormattedString("foo", []);

    const results = source.findAll(pattern);
    assertEquals(results.length, 0); // Should return empty array when not found
  });

  it("findAll method empty pattern", () => {
    const source = new FormattedString("Hello world", []);
    const pattern = new FormattedString("", []);

    const results = source.findAll(pattern);
    assertEquals(results.length, 1); // Empty string should match once at the beginning
    assertEquals(results[0], 0);
  });

  it("findAll method pattern longer than source", () => {
    const source = new FormattedString("Hi", []);
    const pattern = new FormattedString("Hello world", []);

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
    const source = new FormattedString(sourceText, []);
    const pattern = new FormattedString("aa", []);

    const results = source.findAll(pattern, true);
    assertEquals(results.length, 3); // Should find "aa" at positions 0, 1, 2
    assertEquals(results[0], 0);
    assertEquals(results[1], 1);
    assertEquals(results[2], 2);
  });

  it("findAll method non-overlapping patterns (default)", () => {
    // Test that it finds only non-overlapping matches by default
    const sourceText = "aaaa";
    const source = new FormattedString(sourceText, []);
    const pattern = new FormattedString("aa", []);

    const results = source.findAll(pattern);
    assertEquals(results.length, 2); // Should find "aa" at positions 0, 2 (non-overlapping)
    assertEquals(results[0], 0);
    assertEquals(results[1], 2);
  });

  it("findAll method non-overlapping patterns explicit", () => {
    // Test that it finds only non-overlapping matches when explicitly specified
    const sourceText = "aaaa";
    const source = new FormattedString(sourceText, []);
    const pattern = new FormattedString("aa", []);

    const results = source.findAll(pattern, false);
    assertEquals(results.length, 2); // Should find "aa" at positions 0, 2 (non-overlapping)
    assertEquals(results[0], 0);
    assertEquals(results[1], 2);
  });

  it("findAll method with complex entities", () => {
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
    // Test finding plain text when some instances have entities
    const sourceText = "Hello world test world end world";
    const sourceEntities = [
      { type: "bold" as const, offset: 6, length: 5 }, // first "world" is bold
    ];
    const source = new FormattedString(sourceText, sourceEntities);

    // Pattern for plain "world" (no entities)
    const pattern = new FormattedString("world", []);

    const results = source.findAll(pattern);
    assertEquals(results.length, 2); // Should find 2 plain "world" instances
    assertEquals(results[0], 17); // Second "world" at position 17
    assertEquals(results[1], 27); // Third "world" at position 27
  });
});

describe("FormattedString - startsWith and endsWith methods", () => {
  it("Static startsWith - basic functionality", () => {
    const source = new FormattedString("Hello World");
    const pattern1 = new FormattedString("Hello");
    const pattern2 = new FormattedString("World");
    const pattern3 = new FormattedString("Hi");

    assertEquals(FormattedString.startsWith(source, pattern1), true);
    assertEquals(FormattedString.startsWith(source, pattern2), false);
    assertEquals(FormattedString.startsWith(source, pattern3), false);
  });

  it("Static startsWith - empty pattern", () => {
    const source = new FormattedString("Hello World");
    const emptyPattern = new FormattedString("");

    assertEquals(FormattedString.startsWith(source, emptyPattern), true);
  });

  it("Static startsWith - empty source", () => {
    const emptySource = new FormattedString("");
    const pattern = new FormattedString("Hello");
    const emptyPattern = new FormattedString("");

    assertEquals(FormattedString.startsWith(emptySource, pattern), false);
    assertEquals(FormattedString.startsWith(emptySource, emptyPattern), true);
  });

  it("Static startsWith - pattern longer than source", () => {
    const source = new FormattedString("Hi");
    const pattern = new FormattedString("Hello World");

    assertEquals(FormattedString.startsWith(source, pattern), false);
  });

  it("Static startsWith - exact match", () => {
    const source = new FormattedString("Hello World");
    const pattern = new FormattedString("Hello World");

    assertEquals(FormattedString.startsWith(source, pattern), true);
  });

  it("Static startsWith - with entities matching", () => {
    const source = FormattedString.bold("Hello").concat(
      new FormattedString(" World"),
    );
    const pattern = FormattedString.bold("Hello");

    assertEquals(FormattedString.startsWith(source, pattern), true);
  });

  it("Static startsWith - with entities not matching", () => {
    const source = FormattedString.bold("Hello World");
    const pattern = new FormattedString("Hello"); // no bold entity

    assertEquals(FormattedString.startsWith(source, pattern), false);
  });

  it("Static startsWith - complex entities matching", () => {
    const boldHello = FormattedString.bold("Hello");
    const space = new FormattedString(" ");
    const italicWorld = FormattedString.italic("World");
    const source = FormattedString.join([boldHello, space, italicWorld]);

    const pattern1 = FormattedString.join([boldHello, space]);
    const pattern2 = FormattedString.join([
      new FormattedString("Hello"),
      space,
    ]);

    assertEquals(FormattedString.startsWith(source, pattern1), true);
    assertEquals(FormattedString.startsWith(source, pattern2), false);
  });

  it("Instance startsWith - basic functionality", () => {
    const source = new FormattedString("Hello World");
    const pattern1 = new FormattedString("Hello");
    const pattern2 = new FormattedString("World");

    assertEquals(source.startsWith(pattern1), true);
    assertEquals(source.startsWith(pattern2), false);
  });

  it("Static endsWith - basic functionality", () => {
    const source = new FormattedString("Hello World");
    const pattern1 = new FormattedString("World");
    const pattern2 = new FormattedString("Hello");
    const pattern3 = new FormattedString("Earth");

    assertEquals(FormattedString.endsWith(source, pattern1), true);
    assertEquals(FormattedString.endsWith(source, pattern2), false);
    assertEquals(FormattedString.endsWith(source, pattern3), false);
  });

  it("Static endsWith - empty pattern", () => {
    const source = new FormattedString("Hello World");
    const emptyPattern = new FormattedString("");

    assertEquals(FormattedString.endsWith(source, emptyPattern), true);
  });

  it("Static endsWith - empty source", () => {
    const emptySource = new FormattedString("");
    const pattern = new FormattedString("World");
    const emptyPattern = new FormattedString("");

    assertEquals(FormattedString.endsWith(emptySource, pattern), false);
    assertEquals(FormattedString.endsWith(emptySource, emptyPattern), true);
  });

  it("Static endsWith - pattern longer than source", () => {
    const source = new FormattedString("Hi");
    const pattern = new FormattedString("Hello World");

    assertEquals(FormattedString.endsWith(source, pattern), false);
  });

  it("Static endsWith - exact match", () => {
    const source = new FormattedString("Hello World");
    const pattern = new FormattedString("Hello World");

    assertEquals(FormattedString.endsWith(source, pattern), true);
  });

  it("Static endsWith - with entities matching", () => {
    const source = new FormattedString("Hello ").concat(
      FormattedString.italic("World"),
    );
    const pattern = FormattedString.italic("World");

    assertEquals(FormattedString.endsWith(source, pattern), true);
  });

  it("Static endsWith - with entities not matching", () => {
    const source = FormattedString.italic("Hello World");
    const pattern = new FormattedString("World"); // no italic entity

    assertEquals(FormattedString.endsWith(source, pattern), false);
  });

  it("Static endsWith - complex entities matching", () => {
    const boldHello = FormattedString.bold("Hello");
    const space = new FormattedString(" ");
    const italicWorld = FormattedString.italic("World");
    const source = FormattedString.join([boldHello, space, italicWorld]);

    const pattern1 = FormattedString.join([space, italicWorld]);
    const pattern2 = FormattedString.join([
      space,
      new FormattedString("World"),
    ]);

    assertEquals(FormattedString.endsWith(source, pattern1), true);
    assertEquals(FormattedString.endsWith(source, pattern2), false);
  });

  it("Instance endsWith - basic functionality", () => {
    const source = new FormattedString("Hello World");
    const pattern1 = new FormattedString("World");
    const pattern2 = new FormattedString("Hello");

    assertEquals(source.endsWith(pattern1), true);
    assertEquals(source.endsWith(pattern2), false);
  });

  it("startsWith and endsWith - single character", () => {
    const source = new FormattedString("Hello");
    const hPattern = new FormattedString("H");
    const oPattern = new FormattedString("o");

    assertEquals(source.startsWith(hPattern), true);
    assertEquals(source.endsWith(oPattern), true);
    assertEquals(source.startsWith(oPattern), false);
    assertEquals(source.endsWith(hPattern), false);
  });

  it("startsWith and endsWith - with link entities", () => {
    const linkText = FormattedString.link("click here", "https://example.com");
    const source = new FormattedString("Visit ").concat(linkText).concat(
      new FormattedString(" now"),
    );

    const startsPattern = new FormattedString("Visit ");
    const endsPattern = new FormattedString(" now");
    const linkPattern = FormattedString.link(
      "click here",
      "https://example.com",
    );

    assertEquals(source.startsWith(startsPattern), true);
    assertEquals(source.endsWith(endsPattern), true);
    assertEquals(source.startsWith(linkPattern), false);
    assertEquals(source.endsWith(linkPattern), false);
  });

  it("startsWith and endsWith - overlapping patterns", () => {
    const source = new FormattedString("abcabc");
    const abcPattern = new FormattedString("abc");

    assertEquals(source.startsWith(abcPattern), true);
    assertEquals(source.endsWith(abcPattern), true);
  });
});