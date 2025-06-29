import { assertEquals, assertInstanceOf, describe, it } from "./deps.test.ts";
import { FormattedString } from "../src/format.ts";

describe("FormattedString - customEmoji formatting methods", () => {
  it("Static customEmoji method", () => {
    const placeholder = "😀";
    const emojiId = "5123456789123456789";

    const emojiFormatted = FormattedString.customEmoji(placeholder, emojiId);

    assertInstanceOf(emojiFormatted, FormattedString);
    assertEquals(emojiFormatted.rawText, placeholder);

    // Test entity properties
    assertEquals(emojiFormatted.rawEntities.length, 1);
    assertEquals(emojiFormatted.rawEntities[0]?.type, "text_link");
    assertEquals(emojiFormatted.rawEntities[0]?.offset, 0);
    assertEquals(emojiFormatted.rawEntities[0]?.length, placeholder.length);
    assertEquals(
      //@ts-expect-error quick test
      emojiFormatted.rawEntities[0]?.url,
      `tg://emoji?id=5123456789123456789`,
    );
  });
  it("Instance customEmoji method", () => {
    const initialText = "Check this out ";
    const placeholder = "😀";
    const emojiId = "5123456789123456789";
    const initialFormatted = new FormattedString(initialText);

    const emojiResult = initialFormatted.customEmoji(placeholder, emojiId);

    assertInstanceOf(emojiResult, FormattedString);
    assertEquals(emojiResult.rawText, `${initialText}${placeholder}`);

    // Test entity properties
    assertEquals(emojiResult.rawEntities.length, 1);
    assertEquals(emojiResult.rawEntities[0]?.type, "text_link");
    assertEquals(emojiResult.rawEntities[0]?.offset, initialText.length);
    assertEquals(emojiResult.rawEntities[0]?.length, placeholder.length);
    assertEquals(
      //@ts-expect-error quick test
      emojiResult.rawEntities[0]?.url,
      `tg://emoji?id=5123456789123456789`,
    );
  });
});
