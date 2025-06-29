import { assertEquals, assertInstanceOf, describe, it } from "./deps.test.ts";
import { FormattedString } from "../src/format.ts";

describe("FormattedString - Static formatting methods", () => {
  it("Static code method", () => {
    const text = "code text";

    const codeFormatted = FormattedString.code(text);

    assertInstanceOf(codeFormatted, FormattedString);
    assertEquals(codeFormatted.rawText, text);

    // Test entity properties
    assertEquals(codeFormatted.rawEntities.length, 1);
    assertEquals(codeFormatted.rawEntities[0]?.type, "code");
    assertEquals(codeFormatted.rawEntities[0]?.offset, 0);
    assertEquals(codeFormatted.rawEntities[0]?.length, text.length);
  });
});

describe("FormattedString", () => {
  it("Instance code method", () => {
    const initialText = "Run ";
    const codeText = "npm install";
    const initialFormatted = new FormattedString(initialText, []);

    const codeResult = initialFormatted.code(codeText);

    assertInstanceOf(codeResult, FormattedString);
    assertEquals(codeResult.rawText, `${initialText}${codeText}`);

    // Test entity properties
    assertEquals(codeResult.rawEntities.length, 1);
    assertEquals(codeResult.rawEntities[0]?.type, "code");
    assertEquals(codeResult.rawEntities[0]?.offset, initialText.length);
    assertEquals(codeResult.rawEntities[0]?.length, codeText.length);
  });
});