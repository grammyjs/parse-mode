import { assertEquals, assertInstanceOf, describe, it } from "./deps.test.ts";
import { FormattedString } from "../src/format.ts";

describe("FormattedString - Static formatting methods", () => {
  it("Static bold methods", () => {
    const text = "bold text";

    const boldFormatted = FormattedString.bold(text);
    const bFormatted = FormattedString.b(text);

    assertInstanceOf(boldFormatted, FormattedString);
    assertInstanceOf(bFormatted, FormattedString);
    assertEquals(boldFormatted.rawText, text);
    assertEquals(bFormatted.rawText, text);

    // Test entity properties
    assertEquals(boldFormatted.rawEntities.length, 1);
    assertEquals(boldFormatted.rawEntities[0]?.type, "bold");
    assertEquals(boldFormatted.rawEntities[0]?.offset, 0);
    assertEquals(boldFormatted.rawEntities[0]?.length, text.length);

    assertEquals(bFormatted.rawEntities.length, 1);
    assertEquals(bFormatted.rawEntities[0]?.type, "bold");
    assertEquals(bFormatted.rawEntities[0]?.offset, 0);
    assertEquals(bFormatted.rawEntities[0]?.length, text.length);
  });
});

describe("FormattedString", () => {
  it("Instance bold methods", () => {
    const initialText = "Hello ";
    const boldText = "World";
    const initialFormatted = new FormattedString(initialText, []);

    const boldResult = initialFormatted.bold(boldText);
    const bResult = initialFormatted.b(boldText);

    assertInstanceOf(boldResult, FormattedString);
    assertInstanceOf(bResult, FormattedString);
    assertEquals(boldResult.rawText, `${initialText}${boldText}`);
    assertEquals(bResult.rawText, `${initialText}${boldText}`);

    // Test entity properties
    assertEquals(boldResult.rawEntities.length, 1);
    assertEquals(boldResult.rawEntities[0]?.type, "bold");
    assertEquals(boldResult.rawEntities[0]?.offset, initialText.length);
    assertEquals(boldResult.rawEntities[0]?.length, boldText.length);

    assertEquals(bResult.rawEntities.length, 1);
    assertEquals(bResult.rawEntities[0]?.type, "bold");
    assertEquals(bResult.rawEntities[0]?.offset, initialText.length);
    assertEquals(bResult.rawEntities[0]?.length, boldText.length);
  });
});