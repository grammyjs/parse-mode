import { assertEquals, assertInstanceOf, describe, it } from "./deps.test.ts";
import type { MessageEntity } from "../src/deps.deno.ts";
import { FormattedString } from "../src/format.ts";
import {
  HTMLStreamParser,
  isValidCodePoint,
  maxCodePoint,
} from "../src/stream-html-to-format.ts";

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

  it("maps tg-time to date_time with unix attribute", () => {
    const parser = new HTMLStreamParser();
    parser.add('<tg-time unix="1773412200">2026-05-21</tg-time>');

    const formatted = parser.toFormattedString();

    assertEquals(formatted.rawText, "2026-05-21");
    assertEquals(formatted.rawEntities.length, 1);
    const entity = formatted.rawEntities[0] as
      | MessageEntity.DateTimeMessageEntity
      | undefined;
    assertEquals(entity?.type, "date_time");
    assertEquals(entity?.offset, 0);
    assertEquals(entity?.length, "2026-05-21".length);
    assertEquals(entity?.unix_time, 1773412200);
    assertEquals(entity?.date_time_format, "");
  });

  it("maps tg-time to date_time with unix and format attributes", () => {
    const parser = new HTMLStreamParser();
    parser.add(
      '<tg-time unix="1773412200" format="d">2026-05-21</tg-time>',
    );

    const formatted = parser.toFormattedString();

    assertEquals(formatted.rawText, "2026-05-21");
    assertEquals(formatted.rawEntities.length, 1);
    const entity = formatted.rawEntities[0] as
      | MessageEntity.DateTimeMessageEntity
      | undefined;
    assertEquals(entity?.type, "date_time");
    assertEquals(entity?.offset, 0);
    assertEquals(entity?.length, "2026-05-21".length);
    assertEquals(entity?.unix_time, 1773412200);
    assertEquals(entity?.date_time_format, "d");
  });

  it("does not map invalid tg-time (missing unix attribute)", () => {
    const parser = new HTMLStreamParser();
    parser.add("<tg-time>invalid</tg-time>");

    const formatted = parser.toFormattedString();

    assertEquals(formatted.rawText, "<tg-time>invalid</tg-time>");
    assertEquals(formatted.rawEntities.length, 0);
  });

  it("does not map invalid tg-time (non-numeric unix attribute)", () => {
    const parser = new HTMLStreamParser();
    parser.add('<tg-time unix="abc">invalid</tg-time>');

    const formatted = parser.toFormattedString();

    assertEquals(formatted.rawText, '<tg-time unix="abc">invalid</tg-time>');
    assertEquals(formatted.rawEntities.length, 0);
  });

  it("does not map invalid tg-time (partially numeric unix attribute)", () => {
    const parser = new HTMLStreamParser();
    parser.add('<tg-time unix="1773412200abc">invalid</tg-time>');

    const formatted = parser.toFormattedString();

    assertEquals(
      formatted.rawText,
      '<tg-time unix="1773412200abc">invalid</tg-time>',
    );
    assertEquals(formatted.rawEntities.length, 0);
  });

  it("does not map invalid tg-time (scientific notation unix attribute)", () => {
    const parser = new HTMLStreamParser();
    parser.add('<tg-time unix="1e6">invalid</tg-time>');

    const formatted = parser.toFormattedString();

    assertEquals(formatted.rawText, '<tg-time unix="1e6">invalid</tg-time>');
    assertEquals(formatted.rawEntities.length, 0);
  });

  it("does not map invalid tg-time (invalid format grammar)", () => {
    const parser = new HTMLStreamParser();
    parser.add(
      '<tg-time unix="1773412200" format="yyyy-MM-dd">invalid</tg-time>',
    );

    const formatted = parser.toFormattedString();

    assertEquals(
      formatted.rawText,
      '<tg-time unix="1773412200" format="yyyy-MM-dd">invalid</tg-time>',
    );
    assertEquals(formatted.rawEntities.length, 0);
  });

  it("does not map invalid tg-time (extremely large non-finite unix attribute)", () => {
    const parser = new HTMLStreamParser();
    const largeUnix = "9".repeat(310);
    parser.add(`<tg-time unix="${largeUnix}">invalid</tg-time>`);

    const formatted = parser.toFormattedString();

    assertEquals(
      formatted.rawText,
      `<tg-time unix="${largeUnix}">invalid</tg-time>`,
    );
    assertEquals(formatted.rawEntities.length, 0);
  });

  it("toFormattedString is idempotent for unchanged parser state", () => {
    const parser = new HTMLStreamParser();
    parser.add("<i>ok</i>");

    const first = parser.toFormattedString();
    const second = parser.toFormattedString();

    assertEquals(second.rawText, first.rawText);
    assertEquals(second.rawEntities, first.rawEntities);
  });

  it("decodes decimal and hexadecimal numeric entities including astral code points", () => {
    const parser = new HTMLStreamParser();
    parser.add(
      "&#65; &#x3a; &#X3A; &#128512; &#x1f600; &#X1F600; &#x10FFFF;",
    );

    const formatted = parser.toFormattedString();

    assertEquals(
      formatted.rawText,
      `A : : 😀 😀 😀 ${String.fromCodePoint(maxCodePoint)}`,
    );
    assertEquals(formatted.rawEntities.length, 0);
  });

  it("preserves UTF-16 entity offsets and lengths for astral numeric entities", () => {
    const parser = new HTMLStreamParser();
    parser.add("<b>&#128512;</b><i>&#x1F600;ok</i>");

    const formatted = parser.toFormattedString();

    assertEquals(formatted.rawText, "😀😀ok");
    assertEquals(formatted.rawEntities, [
      { type: "bold", offset: 0, length: 2 },
      { type: "italic", offset: 2, length: 4 },
    ]);
  });

  it("supports streamed chunk boundaries across astral numeric entities", () => {
    const parser = new HTMLStreamParser();
    parser.add("&");
    parser.add("#128");
    parser.add("512; &#");
    parser.add("x1F");
    parser.add("600;");

    const formatted = parser.toFormattedString();

    assertEquals(formatted.rawText, "😀 😀");
    assertEquals(formatted.rawEntities.length, 0);
  });

  it("falls back to plaintext for out-of-range, surrogate, and empty numeric entities", () => {
    const parser = new HTMLStreamParser();
    const hugeDecimal = "9".repeat(400);
    parser.add(
      `&#1114112; &#x110000; &#${hugeDecimal}; &#55296; &#xD800; &#xDFFF; &#; &#x; &#X;`,
    );

    const formatted = parser.toFormattedString();

    assertEquals(
      formatted.rawText,
      `&#1114112; &#x110000; &#${hugeDecimal}; &#55296; &#xD800; &#xDFFF; &#; &#x; &#X;`,
    );
    assertEquals(formatted.rawEntities.length, 0);
  });

  it("validates Unicode scalar code points via isValidCodePoint", () => {
    assertEquals(isValidCodePoint(0), true);
    assertEquals(isValidCodePoint(0xd7ff), true);
    assertEquals(isValidCodePoint(0xd800), false);
    assertEquals(isValidCodePoint(0xdfff), false);
    assertEquals(isValidCodePoint(0xe000), true);
    assertEquals(isValidCodePoint(0x1f600), true);
    assertEquals(isValidCodePoint(maxCodePoint), true);
    assertEquals(isValidCodePoint(maxCodePoint + 1), false);
    assertEquals(isValidCodePoint(-1), false);
    assertEquals(isValidCodePoint(1.5), false);
    assertEquals(isValidCodePoint(NaN), false);
    assertEquals(isValidCodePoint(Infinity), false);
  });
});
