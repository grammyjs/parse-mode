import { assertEquals, assertInstanceOf, describe, it } from "./deps.test.ts";
import { FormattedString } from "../src/format.ts";

describe("FormattedString - pre formatting methods", () => {
  it("Static pre method", () => {
    const text = "console.log('hello');";
    const language = "javascript";

    const preFormatted = FormattedString.pre(text, language);

    assertInstanceOf(preFormatted, FormattedString);
    assertEquals(preFormatted.rawText, text);

    // Test entity properties
    assertEquals(preFormatted.rawEntities.length, 1);
    assertEquals(preFormatted.rawEntities[0]?.type, "pre");
    assertEquals(preFormatted.rawEntities[0]?.offset, 0);
    assertEquals(preFormatted.rawEntities[0]?.length, text.length);
    //@ts-expect-error quick test
    assertEquals(preFormatted.rawEntities[0]?.language, language);
  });
  it("Instance pre method", () => {
    const initialText = "Code example:\n";
    const preText = "console.log('hello');";
    const language = "javascript";
    const initialFormatted = new FormattedString(initialText);

    const preResult = initialFormatted.pre(preText, language);

    assertInstanceOf(preResult, FormattedString);
    assertEquals(preResult.rawText, `${initialText}${preText}`);

    // Test entity properties
    assertEquals(preResult.rawEntities.length, 1);
    assertEquals(preResult.rawEntities[0]?.type, "pre");
    assertEquals(preResult.rawEntities[0]?.offset, initialText.length);
    assertEquals(preResult.rawEntities[0]?.length, preText.length);
    //@ts-expect-error quick test
    assertEquals(preResult.rawEntities[0]?.language, language);
  });
});
