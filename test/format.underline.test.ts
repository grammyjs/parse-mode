import { assertEquals, assertInstanceOf, describe, it } from "./deps.test.ts";
import { FormattedString } from "../src/format.ts";

describe("FormattedString - Static formatting methods", () => {
  it("Static underline methods", () => {
    const text = "underline text";

    const underlineFormatted = FormattedString.underline(text);
    const uFormatted = FormattedString.u(text);

    assertInstanceOf(underlineFormatted, FormattedString);
    assertInstanceOf(uFormatted, FormattedString);
    assertEquals(underlineFormatted.rawText, text);
    assertEquals(uFormatted.rawText, text);

    // Test entity properties
    assertEquals(underlineFormatted.rawEntities.length, 1);
    assertEquals(underlineFormatted.rawEntities[0]?.type, "underline");
    assertEquals(underlineFormatted.rawEntities[0]?.offset, 0);
    assertEquals(underlineFormatted.rawEntities[0]?.length, text.length);

    assertEquals(uFormatted.rawEntities.length, 1);
    assertEquals(uFormatted.rawEntities[0]?.type, "underline");
    assertEquals(uFormatted.rawEntities[0]?.offset, 0);
    assertEquals(uFormatted.rawEntities[0]?.length, text.length);
  });
});

describe("FormattedString", () => {
  it("Instance underline methods", () => {
    const initialText = "Hello ";
    const underlineText = "World";
    const initialFormatted = new FormattedString(initialText, []);

    const underlineResult = initialFormatted.underline(underlineText);
    const uResult = initialFormatted.u(underlineText);

    assertInstanceOf(underlineResult, FormattedString);
    assertInstanceOf(uResult, FormattedString);
    assertEquals(underlineResult.rawText, `${initialText}${underlineText}`);
    assertEquals(uResult.rawText, `${initialText}${underlineText}`);

    // Test entity properties
    assertEquals(underlineResult.rawEntities.length, 1);
    assertEquals(underlineResult.rawEntities[0]?.type, "underline");
    assertEquals(underlineResult.rawEntities[0]?.offset, initialText.length);
    assertEquals(underlineResult.rawEntities[0]?.length, underlineText.length);

    assertEquals(uResult.rawEntities.length, 1);
    assertEquals(uResult.rawEntities[0]?.type, "underline");
    assertEquals(uResult.rawEntities[0]?.offset, initialText.length);
    assertEquals(uResult.rawEntities[0]?.length, underlineText.length);
  });
});
