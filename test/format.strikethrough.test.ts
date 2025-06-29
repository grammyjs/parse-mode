import { assertEquals, assertInstanceOf, describe, it } from "./deps.test.ts";
import { FormattedString } from "../src/format.ts";

describe("FormattedString - Static formatting methods", () => {
  it("Static strikethrough methods", () => {
    const text = "strikethrough text";

    const strikethroughFormatted = FormattedString.strikethrough(text);
    const sFormatted = FormattedString.s(text);

    assertInstanceOf(strikethroughFormatted, FormattedString);
    assertInstanceOf(sFormatted, FormattedString);
    assertEquals(strikethroughFormatted.rawText, text);
    assertEquals(sFormatted.rawText, text);

    // Test entity properties
    assertEquals(strikethroughFormatted.rawEntities.length, 1);
    assertEquals(strikethroughFormatted.rawEntities[0]?.type, "strikethrough");
    assertEquals(strikethroughFormatted.rawEntities[0]?.offset, 0);
    assertEquals(strikethroughFormatted.rawEntities[0]?.length, text.length);

    assertEquals(sFormatted.rawEntities.length, 1);
    assertEquals(sFormatted.rawEntities[0]?.type, "strikethrough");
    assertEquals(sFormatted.rawEntities[0]?.offset, 0);
    assertEquals(sFormatted.rawEntities[0]?.length, text.length);
  });
});

describe("FormattedString - Instance methods", () => {
  it("Instance strikethrough methods", () => {
    const initialText = "Hello ";
    const strikeText = "World";
    const initialFormatted = new FormattedString(initialText, []);

    const strikeResult = initialFormatted.strikethrough(strikeText);
    const sResult = initialFormatted.s(strikeText);

    assertInstanceOf(strikeResult, FormattedString);
    assertInstanceOf(sResult, FormattedString);
    assertEquals(strikeResult.rawText, `${initialText}${strikeText}`);
    assertEquals(sResult.rawText, `${initialText}${strikeText}`);

    // Test entity properties
    assertEquals(strikeResult.rawEntities.length, 1);
    assertEquals(strikeResult.rawEntities[0]?.type, "strikethrough");
    assertEquals(strikeResult.rawEntities[0]?.offset, initialText.length);
    assertEquals(strikeResult.rawEntities[0]?.length, strikeText.length);

    assertEquals(sResult.rawEntities.length, 1);
    assertEquals(sResult.rawEntities[0]?.type, "strikethrough");
    assertEquals(sResult.rawEntities[0]?.offset, initialText.length);
    assertEquals(sResult.rawEntities[0]?.length, strikeText.length);
  });
});
