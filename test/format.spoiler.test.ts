import { assertEquals, assertInstanceOf, describe, it } from "./deps.test.ts";
import { FormattedString } from "../src/format.ts";

describe("FormattedString - spoiler formatting methods", () => {
  it("Static spoiler method", () => {
    const text = "spoiler text";

    const spoilerFormatted = FormattedString.spoiler(text);

    assertInstanceOf(spoilerFormatted, FormattedString);
    assertEquals(spoilerFormatted.rawText, text);

    // Test entity properties
    assertEquals(spoilerFormatted.rawEntities.length, 1);
    assertEquals(spoilerFormatted.rawEntities[0]?.type, "spoiler");
    assertEquals(spoilerFormatted.rawEntities[0]?.offset, 0);
    assertEquals(spoilerFormatted.rawEntities[0]?.length, text.length);
  });
  it("Instance spoiler method", () => {
    const initialText = "Spoiler alert: ";
    const spoilerText = "secret text";
    const initialFormatted = new FormattedString(initialText);

    const spoilerResult = initialFormatted.spoiler(spoilerText);

    assertInstanceOf(spoilerResult, FormattedString);
    assertEquals(spoilerResult.rawText, `${initialText}${spoilerText}`);

    // Test entity properties
    assertEquals(spoilerResult.rawEntities.length, 1);
    assertEquals(spoilerResult.rawEntities[0]?.type, "spoiler");
    assertEquals(spoilerResult.rawEntities[0]?.offset, initialText.length);
    assertEquals(spoilerResult.rawEntities[0]?.length, spoilerText.length);
  });
});
