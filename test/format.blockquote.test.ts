import { assertEquals, assertInstanceOf, describe, it } from "./deps.test.ts";
import { FormattedString } from "../src/format.ts";

describe("FormattedString - blockquote formatting methods", () => {
  it("Static blockquote method", () => {
    const text = "quoted text";

    const blockquoteFormatted = FormattedString.blockquote(text);

    assertInstanceOf(blockquoteFormatted, FormattedString);
    assertEquals(blockquoteFormatted.rawText, text);

    // Test entity properties
    assertEquals(blockquoteFormatted.rawEntities.length, 1);
    assertEquals(blockquoteFormatted.rawEntities[0]?.type, "blockquote");
    assertEquals(blockquoteFormatted.rawEntities[0]?.offset, 0);
    assertEquals(blockquoteFormatted.rawEntities[0]?.length, text.length);
  });
  it("Instance blockquote method", () => {
    const initialText = "As they say: ";
    const quoteText = "To be or not to be";
    const initialFormatted = new FormattedString(initialText, []);

    const quoteResult = initialFormatted.blockquote(quoteText);

    assertInstanceOf(quoteResult, FormattedString);
    assertEquals(quoteResult.rawText, `${initialText}${quoteText}`);

    // Test entity properties
    assertEquals(quoteResult.rawEntities.length, 1);
    assertEquals(quoteResult.rawEntities[0]?.type, "blockquote");
    assertEquals(quoteResult.rawEntities[0]?.offset, initialText.length);
    assertEquals(quoteResult.rawEntities[0]?.length, quoteText.length);
  });
});
