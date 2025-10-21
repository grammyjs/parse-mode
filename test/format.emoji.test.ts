import { assertEquals, assertInstanceOf, describe, it } from "./deps.test.ts";
import { FormattedString } from "../src/format.ts";

describe("FormattedString - emoji formatting methods", () => {
  it("Static emoji method", () => {
    const text = "😀";
    const emojiId = "5123456789123456789";

    const emojiFormatted = FormattedString.emoji(text, emojiId);

    assertInstanceOf(emojiFormatted, FormattedString);
    assertEquals(emojiFormatted.rawText, text);

    // Test entity properties
    assertEquals(emojiFormatted.rawEntities.length, 1);
    assertEquals(emojiFormatted.rawEntities[0]?.type, "custom_emoji");
    assertEquals(emojiFormatted.rawEntities[0]?.offset, 0);
    assertEquals(emojiFormatted.rawEntities[0]?.length, text.length);
    assertEquals(
      //@ts-expect-error quick test
      emojiFormatted.rawEntities[0]?.custom_emoji_id,
      emojiId,
    );
  });
  it("Instance emoji method", () => {
    const initialText = "Check this out ";
    const text = "😀";
    const emojiId = "5123456789123456789";
    const initialFormatted = new FormattedString(initialText);

    const emojiResult = initialFormatted.emoji(text, emojiId);

    assertInstanceOf(emojiResult, FormattedString);
    assertEquals(emojiResult.rawText, `${initialText}${text}`);

    // Test entity properties
    assertEquals(emojiResult.rawEntities.length, 1);
    assertEquals(emojiResult.rawEntities[0]?.type, "custom_emoji");
    assertEquals(emojiResult.rawEntities[0]?.offset, initialText.length);
    assertEquals(emojiResult.rawEntities[0]?.length, text.length);
    assertEquals(
      //@ts-expect-error quick test
      emojiResult.rawEntities[0]?.custom_emoji_id,
      emojiId,
    );
  });
});
