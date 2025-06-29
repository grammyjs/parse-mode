import { assertEquals, assertInstanceOf, describe, it } from "./deps.test.ts";
import { FormattedString } from "../src/format.ts";

describe("FormattedString - expandableBlockquote formatting methods", () => {
  it("Static expandableBlockquote method", () => {
    const text = "expandable quoted text";

    const expandableBlockquoteFormatted = FormattedString.expandableBlockquote(
      text,
    );

    assertInstanceOf(expandableBlockquoteFormatted, FormattedString);
    assertEquals(expandableBlockquoteFormatted.rawText, text);

    // Test entity properties
    assertEquals(expandableBlockquoteFormatted.rawEntities.length, 1);
    assertEquals(
      expandableBlockquoteFormatted.rawEntities[0]?.type,
      "expandable_blockquote",
    );
    assertEquals(expandableBlockquoteFormatted.rawEntities[0]?.offset, 0);
    assertEquals(
      expandableBlockquoteFormatted.rawEntities[0]?.length,
      text.length,
    );
  });
  it("Instance expandableBlockquote method", () => {
    const initialText = "Long quote: ";
    const quoteText = "This is a very long quote that should be expandable";
    const initialFormatted = new FormattedString(initialText);

    const quoteResult = initialFormatted.expandableBlockquote(quoteText);

    assertInstanceOf(quoteResult, FormattedString);
    assertEquals(quoteResult.rawText, `${initialText}${quoteText}`);

    // Test entity properties
    assertEquals(quoteResult.rawEntities.length, 1);
    assertEquals(quoteResult.rawEntities[0]?.type, "expandable_blockquote");
    assertEquals(quoteResult.rawEntities[0]?.offset, initialText.length);
    assertEquals(quoteResult.rawEntities[0]?.length, quoteText.length);
  });
});
