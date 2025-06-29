import { assertEquals, assertInstanceOf, describe, it } from "./deps.test.ts";
import { FormattedString } from "../src/format.ts";

describe("FormattedString - Static link methods", () => {
  it("Static link methods", () => {
    const text = "link text";
    const url = "https://example.com";

    const linkFormatted = FormattedString.link(text, url);
    const aFormatted = FormattedString.a(text, url);

    assertInstanceOf(linkFormatted, FormattedString);
    assertInstanceOf(aFormatted, FormattedString);
    assertEquals(linkFormatted.rawText, text);
    assertEquals(aFormatted.rawText, text);

    // Test entity properties
    assertEquals(linkFormatted.rawEntities.length, 1);
    assertEquals(linkFormatted.rawEntities[0]?.type, "text_link");
    assertEquals(linkFormatted.rawEntities[0]?.offset, 0);
    assertEquals(linkFormatted.rawEntities[0]?.length, text.length);
    //@ts-expect-error quick test
    assertEquals(linkFormatted.rawEntities[0]?.url, url);

    assertEquals(aFormatted.rawEntities.length, 1);
    assertEquals(aFormatted.rawEntities[0]?.type, "text_link");
    assertEquals(aFormatted.rawEntities[0]?.offset, 0);
    assertEquals(aFormatted.rawEntities[0]?.length, text.length);
    //@ts-expect-error quick test
    assertEquals(aFormatted.rawEntities[0]?.url, url);
  });
});

describe("FormattedString - Instance link methods", () => {
  it("Instance link methods", () => {
    const initialText = "Visit ";
    const linkText = "our website";
    const url = "https://example.com";
    const initialFormatted = new FormattedString(initialText, []);

    const linkResult = initialFormatted.link(linkText, url);
    const aResult = initialFormatted.a(linkText, url);

    assertInstanceOf(linkResult, FormattedString);
    assertInstanceOf(aResult, FormattedString);
    assertEquals(linkResult.rawText, `${initialText}${linkText}`);
    assertEquals(aResult.rawText, `${initialText}${linkText}`);

    // Test entity properties
    assertEquals(linkResult.rawEntities.length, 1);
    assertEquals(linkResult.rawEntities[0]?.type, "text_link");
    assertEquals(linkResult.rawEntities[0]?.offset, initialText.length);
    assertEquals(linkResult.rawEntities[0]?.length, linkText.length);
    //@ts-expect-error quick test
    assertEquals(linkResult.rawEntities[0]?.url, url);

    assertEquals(aResult.rawEntities.length, 1);
    assertEquals(aResult.rawEntities[0]?.type, "text_link");
    assertEquals(aResult.rawEntities[0]?.offset, initialText.length);
    assertEquals(aResult.rawEntities[0]?.length, linkText.length);
    //@ts-expect-error quick test
    assertEquals(aResult.rawEntities[0]?.url, url);
  });
});
