import { assertEquals, assertInstanceOf, describe, it } from "./deps.test.ts";
import { FormattedString } from "../src/format.ts";

describe("FormattedString - mentionUser formatting methods", () => {
  it("Static mentionUser method", () => {
    const text = "Name of the User";
    const userId = 123456789;

    const mentionFormatted = FormattedString.mentionUser(text, userId);

    assertInstanceOf(mentionFormatted, FormattedString);
    assertEquals(mentionFormatted.rawText, text);

    // Test entity properties
    assertEquals(mentionFormatted.rawEntities.length, 1);
    assertEquals(mentionFormatted.rawEntities[0]?.type, "text_link");
    assertEquals(mentionFormatted.rawEntities[0]?.offset, 0);
    assertEquals(mentionFormatted.rawEntities[0]?.length, text.length);
    assertEquals(
      //@ts-expect-error quick test
      mentionFormatted.rawEntities[0]?.url,
      `tg://user?id=123456789`,
    );
  });
  it("Instance mentionUser method", () => {
    const initialText = "Hello ";
    const mentionText = "Name of the User";
    const userId = 123456789;
    const initialFormatted = new FormattedString(initialText);

    const mentionResult = initialFormatted.mentionUser(mentionText, userId);

    assertInstanceOf(mentionResult, FormattedString);
    assertEquals(mentionResult.rawText, `${initialText}${mentionText}`);

    // Test entity properties
    assertEquals(mentionResult.rawEntities.length, 1);
    assertEquals(mentionResult.rawEntities[0]?.type, "text_link");
    assertEquals(mentionResult.rawEntities[0]?.offset, initialText.length);
    assertEquals(mentionResult.rawEntities[0]?.length, mentionText.length);
    //@ts-expect-error quick test
    assertEquals(mentionResult.rawEntities[0]?.url, `tg://user?id=123456789`);
  });
});
