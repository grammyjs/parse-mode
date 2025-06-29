import { assertEquals, assertInstanceOf, describe, it } from "./deps.test.ts";
import { FormattedString } from "../src/format.ts";

describe("FormattedString - italic formatting methods", () => {
  it("Static italic methods", () => {
    const text = "italic text";

    const italicFormatted = FormattedString.italic(text);
    const iFormatted = FormattedString.i(text);

    assertInstanceOf(italicFormatted, FormattedString);
    assertInstanceOf(iFormatted, FormattedString);
    assertEquals(italicFormatted.rawText, text);
    assertEquals(iFormatted.rawText, text);

    // Test entity properties
    assertEquals(italicFormatted.rawEntities.length, 1);
    assertEquals(italicFormatted.rawEntities[0]?.type, "italic");
    assertEquals(italicFormatted.rawEntities[0]?.offset, 0);
    assertEquals(italicFormatted.rawEntities[0]?.length, text.length);

    assertEquals(iFormatted.rawEntities.length, 1);
    assertEquals(iFormatted.rawEntities[0]?.type, "italic");
    assertEquals(iFormatted.rawEntities[0]?.offset, 0);
    assertEquals(iFormatted.rawEntities[0]?.length, text.length);
  });
  it("Instance italic methods", () => {
    const initialText = "Hello ";
    const italicText = "World";
    const initialFormatted = new FormattedString(initialText);

    const italicResult = initialFormatted.italic(italicText);
    const iResult = initialFormatted.i(italicText);

    assertInstanceOf(italicResult, FormattedString);
    assertInstanceOf(iResult, FormattedString);
    assertEquals(italicResult.rawText, `${initialText}${italicText}`);
    assertEquals(iResult.rawText, `${initialText}${italicText}`);

    // Test entity properties
    assertEquals(italicResult.rawEntities.length, 1);
    assertEquals(italicResult.rawEntities[0]?.type, "italic");
    assertEquals(italicResult.rawEntities[0]?.offset, initialText.length);
    assertEquals(italicResult.rawEntities[0]?.length, italicText.length);

    assertEquals(iResult.rawEntities.length, 1);
    assertEquals(iResult.rawEntities[0]?.type, "italic");
    assertEquals(iResult.rawEntities[0]?.offset, initialText.length);
    assertEquals(iResult.rawEntities[0]?.length, italicText.length);
  });
});
