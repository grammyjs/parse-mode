import { assertEquals, assertInstanceOf, describe, it } from "./deps.test.ts";
import { FormattedString } from "../src/format.ts";
import { HTMLStreamParser } from "../src/stream-html-to-format.ts";

describe("HTMLStreamParser", () => {
  it("maps pre/code language class to pre.language", () => {
    const parser = new HTMLStreamParser();
    const input =
      '<pre><code class="language-python">pre-formatted fixed-width code block written in the Python programming language</code></pre>';

    parser.add(input);
    const formatted = parser.toFormattedString();

    assertInstanceOf(formatted, FormattedString);
    assertEquals(
      formatted.rawText,
      "pre-formatted fixed-width code block written in the Python programming language",
    );
    assertEquals(formatted.rawEntities.length, 1);

    const entity = formatted.rawEntities[0];
    if (!entity || entity.type !== "pre") {
      throw new Error("Expected a pre entity");
    }

    assertEquals(entity.offset, 0);
    assertEquals(entity.length, formatted.rawText.length);
    assertEquals(entity.language, "python");
  });

  it("maps span tg-spoiler class to spoiler entity", () => {
    const parser = new HTMLStreamParser();
    parser.add('<span class="tg-spoiler">spoiler</span>');

    const formatted = parser.toFormattedString();

    assertEquals(formatted.rawText, "spoiler");
    assertEquals(formatted.rawEntities.length, 1);
    assertEquals(formatted.rawEntities[0]?.type, "spoiler");
    assertEquals(formatted.rawEntities[0]?.offset, 0);
    assertEquals(formatted.rawEntities[0]?.length, "spoiler".length);
  });

  it("maps expandable blockquote correctly", () => {
    const parser = new HTMLStreamParser();
    const quoteText =
      "Expandable block quotation started\nExpandable block quotation continued\nExpandable block quotation continued\nHidden by default part of the block quotation started\nExpandable block quotation continued\nThe last line of the block quotation";

    parser.add(`<blockquote expandable>${quoteText}</blockquote>`);
    const formatted = parser.toFormattedString();

    assertEquals(formatted.rawText, quoteText);
    assertEquals(formatted.rawEntities.length, 1);
    assertEquals(formatted.rawEntities[0]?.type, "expandable_blockquote");
    assertEquals(formatted.rawEntities[0]?.offset, 0);
    assertEquals(formatted.rawEntities[0]?.length, quoteText.length);
  });

  it("maps tg-emoji to custom_emoji", () => {
    const parser = new HTMLStreamParser();
    parser.add('<tg-emoji emoji-id="5368324170671202286">🙂</tg-emoji>');

    const formatted = parser.toFormattedString();

    assertEquals(formatted.rawText, "🙂");
    assertEquals(formatted.rawEntities.length, 1);
    const entity = formatted.rawEntities[0];
    if (!entity || entity.type !== "custom_emoji") {
      throw new Error("Expected a custom_emoji entity");
    }
    assertEquals(entity.offset, 0);
    assertEquals(entity.length, "🙂".length);
    assertEquals(entity.custom_emoji_id, "5368324170671202286");
  });

  it("maps links to text_link entities", () => {
    const parser = new HTMLStreamParser();
    parser.add('<a href="https://grammy.dev">grammY</a>');

    const formatted = parser.toFormattedString();

    assertEquals(formatted.rawText, "grammY");
    assertEquals(formatted.rawEntities.length, 1);
    const entity = formatted.rawEntities[0];
    if (!entity || entity.type !== "text_link") {
      throw new Error("Expected a text_link entity");
    }
    assertEquals(entity.offset, 0);
    assertEquals(entity.length, "grammY".length);
    assertEquals(entity.url, "https://grammy.dev");
  });

  it("accepts closing tags with trailing whitespace before >", () => {
    const parser = new HTMLStreamParser();
    parser.add("<b>bold text</b   >");

    const formatted = parser.toFormattedString();

    assertEquals(formatted.rawText, "bold text");
    assertEquals(formatted.rawEntities.length, 1);
    assertEquals(formatted.rawEntities[0]?.type, "bold");
    assertEquals(formatted.rawEntities[0]?.offset, 0);
    assertEquals(formatted.rawEntities[0]?.length, "bold text".length);
  });

  it("accepts opening tags with trailing whitespace before >", () => {
    const parser = new HTMLStreamParser();
    parser.add("<blockquote expandable       >quote</blockquote>");

    const formatted = parser.toFormattedString();

    assertEquals(formatted.rawText, "quote");
    assertEquals(formatted.rawEntities.length, 1);
    assertEquals(formatted.rawEntities[0]?.type, "expandable_blockquote");
    assertEquals(formatted.rawEntities[0]?.offset, 0);
    assertEquals(formatted.rawEntities[0]?.length, "quote".length);
  });

  it("supports streamed chunk boundaries across tags and entities", () => {
    const parser = new HTMLStreamParser();
    parser.add('<span class="tg-');
    parser.add('spoiler">spoiler &');
    parser.add("amp; text</span>");

    const formatted = parser.toFormattedString();

    assertEquals(formatted.rawText, "spoiler & text");
    assertEquals(formatted.rawEntities.length, 1);
    assertEquals(formatted.rawEntities[0]?.type, "spoiler");
    assertEquals(formatted.rawEntities[0]?.offset, 0);
    assertEquals(formatted.rawEntities[0]?.length, "spoiler & text".length);
  });

  it("evaluates contiguous opening brackets as plain text", () => {
    const parser = new HTMLStreamParser();
    parser.add("<<b");
    parser.add(">bold</b>");

    const formatted = parser.toFormattedString();

    assertEquals(formatted.rawText, "<bold");
    assertEquals(formatted.rawEntities.length, 1);
    assertEquals(formatted.rawEntities[0]?.type, "bold");
    assertEquals(formatted.rawEntities[0]?.offset, 1);
    assertEquals(formatted.rawEntities[0]?.length, 4);
  });

  it("flushes partial open tag and restarts on <: <b<b>bold</b>", () => {
    const parser = new HTMLStreamParser();
    parser.add("<b<b>bold</b>");

    const formatted = parser.toFormattedString();

    assertEquals(formatted.rawText, "<bbold");
    assertEquals(formatted.rawEntities.length, 1);
    assertEquals(formatted.rawEntities[0]?.type, "bold");
    assertEquals(formatted.rawEntities[0]?.offset, 2);
    assertEquals(formatted.rawEntities[0]?.length, 4);
  });

  it("flushes partial open tag across stream boundary: <b then <b>bold</b>", () => {
    const parser = new HTMLStreamParser();
    parser.add("<b");
    parser.add("<b>bold</b>");

    const formatted = parser.toFormattedString();

    assertEquals(formatted.rawText, "<bbold");
    assertEquals(formatted.rawEntities.length, 1);
    assertEquals(formatted.rawEntities[0]?.type, "bold");
    assertEquals(formatted.rawEntities[0]?.offset, 2);
    assertEquals(formatted.rawEntities[0]?.length, 4);
  });

  it("flushes partial open tag for different tags: <i<b>bold</b>", () => {
    const parser = new HTMLStreamParser();
    parser.add("<i<b>bold</b>");

    const formatted = parser.toFormattedString();

    assertEquals(formatted.rawText, "<ibold");
    assertEquals(formatted.rawEntities.length, 1);
    assertEquals(formatted.rawEntities[0]?.type, "bold");
    assertEquals(formatted.rawEntities[0]?.offset, 2);
    assertEquals(formatted.rawEntities[0]?.length, 4);
  });

  it("flushes partial close tag and restarts on <: <b>bold</</b>", () => {
    const parser = new HTMLStreamParser();
    parser.add("<b>bold</</b>");

    const formatted = parser.toFormattedString();

    assertEquals(formatted.rawText, "bold</");
    assertEquals(formatted.rawEntities.length, 1);
    assertEquals(formatted.rawEntities[0]?.type, "bold");
    assertEquals(formatted.rawEntities[0]?.offset, 0);
    assertEquals(formatted.rawEntities[0]?.length, 6);
  });

  it("flushes partial close tag mid-name: <b>bold</b<b>more</b>", () => {
    const parser = new HTMLStreamParser();
    parser.add("<b>bold</b<b>more</b>");

    const formatted = parser.toFormattedString();

    assertEquals(formatted.rawText, "bold</bmore");
    assertEquals(formatted.rawEntities.length, 1);
    assertEquals(formatted.rawEntities[0]?.type, "bold");
    assertEquals(formatted.rawEntities[0]?.offset, 7);
    assertEquals(formatted.rawEntities[0]?.length, 4);
  });

  it("toFormattedString is idempotent for unchanged parser state", () => {
    const parser = new HTMLStreamParser();
    parser.add("<i>ok</i>");

    const first = parser.toFormattedString();
    const second = parser.toFormattedString();

    assertEquals(second.rawText, first.rawText);
    assertEquals(second.rawEntities, first.rawEntities);
  });
});
