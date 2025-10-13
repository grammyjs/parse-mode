import { assertEquals, describe, it } from "./deps.test.ts";
import { b, fmt, FormattedString } from "../src/format.ts";

describe("FormattedString - fromHtml method", () => {
  it("Static fromHtml - basic bold", () => {
    const result = FormattedString.fromHtml("<b>Hello</b> World");
    assertEquals(result.rawText, "Hello World");
    assertEquals(result.rawEntities.length, 1);
    assertEquals(result.rawEntities[0].type, "bold");
    assertEquals(result.rawEntities[0].offset, 0);
    assertEquals(result.rawEntities[0].length, 5);
  });

  it("Static fromHtml - multiple formats", () => {
    const result = FormattedString.fromHtml(
      "<b>Bold</b> <i>Italic</i> <u>Underline</u>",
    );
    assertEquals(result.rawText, "Bold Italic Underline");
    assertEquals(result.rawEntities.length, 3);
    assertEquals(result.rawEntities[0].type, "bold");
    assertEquals(result.rawEntities[1].type, "italic");
    assertEquals(result.rawEntities[2].type, "underline");
  });

  it("Static fromHtml - nested formats", () => {
    const result = FormattedString.fromHtml("<b>Bold <i>and italic</i></b>");
    assertEquals(result.rawText, "Bold and italic");
    assertEquals(result.rawEntities.length, 2);
    // Both entities should exist with proper offsets
    const boldEntity = result.rawEntities.find((e) => e.type === "bold");
    const italicEntity = result.rawEntities.find((e) => e.type === "italic");
    assertEquals(boldEntity?.offset, 0);
    assertEquals(boldEntity?.length, 15);
    assertEquals(italicEntity?.offset, 5);
    assertEquals(italicEntity?.length, 10);
  });

  it("Static fromHtml - link with href", () => {
    const result = FormattedString.fromHtml(
      '<a href="https://example.com">Click here</a>',
    );
    assertEquals(result.rawText, "Click here");
    assertEquals(result.rawEntities.length, 1);
    assertEquals(result.rawEntities[0].type, "text_link");
    assertEquals(
      (result.rawEntities[0] as { url: string }).url,
      "https://example.com",
    );
  });

  it("Static fromHtml - inline code", () => {
    const result = FormattedString.fromHtml("<code>inline code</code>");
    assertEquals(result.rawText, "inline code");
    assertEquals(result.rawEntities.length, 1);
    assertEquals(result.rawEntities[0].type, "code");
  });

  it("Static fromHtml - pre with language", () => {
    const result = FormattedString.fromHtml(
      '<pre language="python">print("hello")</pre>',
    );
    assertEquals(result.rawText, 'print("hello")');
    assertEquals(result.rawEntities.length, 1);
    assertEquals(result.rawEntities[0].type, "pre");
    assertEquals(
      (result.rawEntities[0] as { language: string }).language,
      "python",
    );
  });

  it("Static fromHtml - pre without language", () => {
    const result = FormattedString.fromHtml("<pre>code block</pre>");
    assertEquals(result.rawText, "code block");
    assertEquals(result.rawEntities.length, 1);
    assertEquals(result.rawEntities[0].type, "pre");
    assertEquals((result.rawEntities[0] as { language: string }).language, "");
  });

  it("Static fromHtml - HTML entities", () => {
    const result = FormattedString.fromHtml(
      "&lt;b&gt; &amp; &quot;test&quot; &apos;",
    );
    assertEquals(result.rawText, '<b> & "test" \'');
  });

  it("Static fromHtml - numeric HTML entities", () => {
    const result = FormattedString.fromHtml("&#60;&#62; &#x3C;&#x3E;");
    assertEquals(result.rawText, "<> <>");
  });

  it("Static fromHtml - spoiler with tg-spoiler tag", () => {
    const result = FormattedString.fromHtml(
      "<tg-spoiler>Secret text</tg-spoiler>",
    );
    assertEquals(result.rawText, "Secret text");
    assertEquals(result.rawEntities.length, 1);
    assertEquals(result.rawEntities[0].type, "spoiler");
  });

  it("Static fromHtml - spoiler with span class", () => {
    const result = FormattedString.fromHtml(
      '<span class="tg-spoiler">Hidden</span>',
    );
    assertEquals(result.rawText, "Hidden");
    assertEquals(result.rawEntities.length, 1);
    assertEquals(result.rawEntities[0].type, "spoiler");
  });

  it("Static fromHtml - strikethrough variants", () => {
    const result1 = FormattedString.fromHtml("<s>strike</s>");
    const result2 = FormattedString.fromHtml("<strike>strike</strike>");
    const result3 = FormattedString.fromHtml("<del>strike</del>");

    assertEquals(result1.rawEntities[0].type, "strikethrough");
    assertEquals(result2.rawEntities[0].type, "strikethrough");
    assertEquals(result3.rawEntities[0].type, "strikethrough");
  });

  it("Static fromHtml - strong and em", () => {
    const result = FormattedString.fromHtml(
      "<strong>Strong</strong> <em>Emphasis</em>",
    );
    assertEquals(result.rawText, "Strong Emphasis");
    assertEquals(result.rawEntities.length, 2);
    assertEquals(result.rawEntities[0].type, "bold");
    assertEquals(result.rawEntities[1].type, "italic");
  });

  it("Static fromHtml - blockquote", () => {
    const result = FormattedString.fromHtml("<blockquote>Quote</blockquote>");
    assertEquals(result.rawText, "Quote");
    assertEquals(result.rawEntities.length, 1);
    assertEquals(result.rawEntities[0].type, "blockquote");
  });

  it("Static fromHtml - expandable blockquote", () => {
    const result = FormattedString.fromHtml(
      "<blockquote expandable>Expandable quote</blockquote>",
    );
    assertEquals(result.rawText, "Expandable quote");
    assertEquals(result.rawEntities.length, 1);
    assertEquals(result.rawEntities[0].type, "expandable_blockquote");
  });

  it("Static fromHtml - custom emoji", () => {
    const result = FormattedString.fromHtml(
      '<tg-emoji emoji-id="5368324170671202286">👍</tg-emoji>',
    );
    assertEquals(result.rawText, "👍");
    assertEquals(result.rawEntities.length, 1);
    assertEquals(result.rawEntities[0].type, "custom_emoji");
    assertEquals(
      (result.rawEntities[0] as { custom_emoji_id: string }).custom_emoji_id,
      "5368324170671202286",
    );
  });

  it("Static fromHtml - complex mixed formatting", () => {
    const result = FormattedString.fromHtml(
      '<b>Bold</b> with <a href="https://example.com">link</a> and <code>code</code>',
    );
    assertEquals(result.rawText, "Bold with link and code");
    assertEquals(result.rawEntities.length, 3);

    const boldEntity = result.rawEntities.find((e) => e.type === "bold");
    const linkEntity = result.rawEntities.find((e) => e.type === "text_link");
    const codeEntity = result.rawEntities.find((e) => e.type === "code");

    assertEquals(boldEntity?.offset, 0);
    assertEquals(boldEntity?.length, 4);
    assertEquals(linkEntity?.offset, 10);
    assertEquals(linkEntity?.length, 4);
    assertEquals(codeEntity?.offset, 19);
    assertEquals(codeEntity?.length, 4);
  });

  it("Static fromHtml - empty string", () => {
    const result = FormattedString.fromHtml("");
    assertEquals(result.rawText, "");
    assertEquals(result.rawEntities.length, 0);
  });

  it("Static fromHtml - plain text without tags", () => {
    const result = FormattedString.fromHtml("Just plain text");
    assertEquals(result.rawText, "Just plain text");
    assertEquals(result.rawEntities.length, 0);
  });

  it("Static fromHtml - unclosed tags", () => {
    const result = FormattedString.fromHtml("<b>Bold without close");
    assertEquals(result.rawText, "Bold without close");
    assertEquals(result.rawEntities.length, 1);
    assertEquals(result.rawEntities[0].type, "bold");
    assertEquals(result.rawEntities[0].length, 18);
  });

  it("Static fromHtml - mismatched closing tags", () => {
    const result = FormattedString.fromHtml("<b>Bold</i>");
    // Mismatched closing tag </i> is treated as literal text
    assertEquals(result.rawText, "Bold</i>");
    assertEquals(result.rawEntities.length, 1);
    assertEquals(result.rawEntities[0].type, "bold");
    // Bold tag remains open and covers entire text
    assertEquals(result.rawEntities[0].length, 8);
  });

  it("Static fromHtml - unknown tags treated as literal", () => {
    const result = FormattedString.fromHtml("<unknown>Text</unknown>");
    assertEquals(result.rawText, "<unknown>Text</unknown>");
  });

  it("Static fromHtml - attributes with single quotes", () => {
    const result = FormattedString.fromHtml(
      "<a href='https://example.com'>Link</a>",
    );
    assertEquals(result.rawText, "Link");
    assertEquals(
      (result.rawEntities[0] as { url: string }).url,
      "https://example.com",
    );
  });

  it("Static fromHtml - attributes without quotes", () => {
    const result = FormattedString.fromHtml(
      "<blockquote expandable>Text</blockquote>",
    );
    assertEquals(result.rawText, "Text");
    assertEquals(result.rawEntities[0].type, "expandable_blockquote");
  });

  it("Instance fromHtml - append to existing", () => {
    const base = new FormattedString("Prefix: ");
    const result = base.fromHtml("<b>Bold</b>");
    assertEquals(result.rawText, "Prefix: Bold");
    assertEquals(result.rawEntities.length, 1);
    assertEquals(result.rawEntities[0].offset, 8);
    assertEquals(result.rawEntities[0].length, 4);
  });

  it("fromHtml - integration with fmt", () => {
    const htmlPart = FormattedString.fromHtml("<i>italic HTML</i>");
    const combined = fmt`${b}Bold tag${b} and ${htmlPart}`;
    assertEquals(combined.rawText, "Bold tag and italic HTML");
    assertEquals(combined.rawEntities.length, 2);

    const boldEntity = combined.rawEntities.find((e) => e.type === "bold");
    const italicEntity = combined.rawEntities.find((e) => e.type === "italic");

    assertEquals(boldEntity?.offset, 0);
    assertEquals(boldEntity?.length, 8);
    assertEquals(italicEntity?.offset, 13);
    assertEquals(italicEntity?.length, 11);
  });

  it("fromHtml - with whitespace in attributes", () => {
    const result = FormattedString.fromHtml(
      '<a  href = "https://example.com" >Link</a>',
    );
    assertEquals(result.rawText, "Link");
    assertEquals(
      (result.rawEntities[0] as { url: string }).url,
      "https://example.com",
    );
  });

  it("fromHtml - multiple nested levels", () => {
    const result = FormattedString.fromHtml(
      "<b><i><u>Deeply nested</u></i></b>",
    );
    assertEquals(result.rawText, "Deeply nested");
    assertEquals(result.rawEntities.length, 3);
  });
});
