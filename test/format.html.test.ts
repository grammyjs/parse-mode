import { assertEquals, describe, it } from "./deps.test.ts";
import { FormattedString } from "../src/format.ts";

describe("FormattedString.fromHtml - Basic HTML tags", () => {
  it("should parse bold text with <b>", () => {
    const formatted = FormattedString.fromHtml("<b>Hello</b>");
    assertEquals(formatted.text, "Hello");
    assertEquals(formatted.entities.length, 1);
    assertEquals(formatted.entities[0].type, "bold");
    assertEquals(formatted.entities[0].offset, 0);
    assertEquals(formatted.entities[0].length, 5);
  });

  it("should parse bold text with <strong>", () => {
    const formatted = FormattedString.fromHtml("<strong>Hello</strong>");
    assertEquals(formatted.text, "Hello");
    assertEquals(formatted.entities.length, 1);
    assertEquals(formatted.entities[0].type, "bold");
    assertEquals(formatted.entities[0].offset, 0);
    assertEquals(formatted.entities[0].length, 5);
  });

  it("should parse italic text with <i>", () => {
    const formatted = FormattedString.fromHtml("<i>World</i>");
    assertEquals(formatted.text, "World");
    assertEquals(formatted.entities.length, 1);
    assertEquals(formatted.entities[0].type, "italic");
    assertEquals(formatted.entities[0].offset, 0);
    assertEquals(formatted.entities[0].length, 5);
  });

  it("should parse italic text with <em>", () => {
    const formatted = FormattedString.fromHtml("<em>World</em>");
    assertEquals(formatted.text, "World");
    assertEquals(formatted.entities.length, 1);
    assertEquals(formatted.entities[0].type, "italic");
    assertEquals(formatted.entities[0].offset, 0);
    assertEquals(formatted.entities[0].length, 5);
  });

  it("should parse underline text with <u>", () => {
    const formatted = FormattedString.fromHtml("<u>Underlined</u>");
    assertEquals(formatted.text, "Underlined");
    assertEquals(formatted.entities.length, 1);
    assertEquals(formatted.entities[0].type, "underline");
    assertEquals(formatted.entities[0].offset, 0);
    assertEquals(formatted.entities[0].length, 10);
  });

  it("should parse underline text with <ins>", () => {
    const formatted = FormattedString.fromHtml("<ins>Underlined</ins>");
    assertEquals(formatted.text, "Underlined");
    assertEquals(formatted.entities.length, 1);
    assertEquals(formatted.entities[0].type, "underline");
    assertEquals(formatted.entities[0].offset, 0);
    assertEquals(formatted.entities[0].length, 10);
  });

  it("should parse strikethrough text with <s>", () => {
    const formatted = FormattedString.fromHtml("<s>Strike</s>");
    assertEquals(formatted.text, "Strike");
    assertEquals(formatted.entities.length, 1);
    assertEquals(formatted.entities[0].type, "strikethrough");
    assertEquals(formatted.entities[0].offset, 0);
    assertEquals(formatted.entities[0].length, 6);
  });

  it("should parse strikethrough text with <strike>", () => {
    const formatted = FormattedString.fromHtml("<strike>Strike</strike>");
    assertEquals(formatted.text, "Strike");
    assertEquals(formatted.entities.length, 1);
    assertEquals(formatted.entities[0].type, "strikethrough");
    assertEquals(formatted.entities[0].offset, 0);
    assertEquals(formatted.entities[0].length, 6);
  });

  it("should parse strikethrough text with <del>", () => {
    const formatted = FormattedString.fromHtml("<del>Strike</del>");
    assertEquals(formatted.text, "Strike");
    assertEquals(formatted.entities.length, 1);
    assertEquals(formatted.entities[0].type, "strikethrough");
    assertEquals(formatted.entities[0].offset, 0);
    assertEquals(formatted.entities[0].length, 6);
  });

  it("should parse code text with <code>", () => {
    const formatted = FormattedString.fromHtml("<code>code</code>");
    assertEquals(formatted.text, "code");
    assertEquals(formatted.entities.length, 1);
    assertEquals(formatted.entities[0].type, "code");
    assertEquals(formatted.entities[0].offset, 0);
    assertEquals(formatted.entities[0].length, 4);
  });

  it("should parse pre text with <pre>", () => {
    const formatted = FormattedString.fromHtml("<pre>code block</pre>");
    assertEquals(formatted.text, "code block");
    assertEquals(formatted.entities.length, 1);
    assertEquals(formatted.entities[0].type, "pre");
    assertEquals(formatted.entities[0].offset, 0);
    assertEquals(formatted.entities[0].length, 10);
  });

  it("should parse pre text with language attribute", () => {
    const formatted = FormattedString.fromHtml(
      '<pre language="python">code block</pre>',
    );
    assertEquals(formatted.text, "code block");
    assertEquals(formatted.entities.length, 1);
    assertEquals(formatted.entities[0].type, "pre");
    assertEquals(formatted.entities[0].offset, 0);
    assertEquals(formatted.entities[0].length, 10);
    //@ts-expect-error quick test
    assertEquals(formatted.entities[0].language, "python");
  });

  it("should parse link with <a href>", () => {
    const formatted = FormattedString.fromHtml(
      '<a href="https://example.com">link</a>',
    );
    assertEquals(formatted.text, "link");
    assertEquals(formatted.entities.length, 1);
    assertEquals(formatted.entities[0].type, "text_link");
    assertEquals(formatted.entities[0].offset, 0);
    assertEquals(formatted.entities[0].length, 4);
    //@ts-expect-error quick test
    assertEquals(formatted.entities[0].url, "https://example.com");
  });

  it("should parse spoiler with <tg-spoiler>", () => {
    const formatted = FormattedString.fromHtml(
      "<tg-spoiler>secret</tg-spoiler>",
    );
    assertEquals(formatted.text, "secret");
    assertEquals(formatted.entities.length, 1);
    assertEquals(formatted.entities[0].type, "spoiler");
    assertEquals(formatted.entities[0].offset, 0);
    assertEquals(formatted.entities[0].length, 6);
  });

  it('should parse spoiler with <span class="tg-spoiler">', () => {
    const formatted = FormattedString.fromHtml(
      '<span class="tg-spoiler">secret</span>',
    );
    assertEquals(formatted.text, "secret");
    assertEquals(formatted.entities.length, 1);
    assertEquals(formatted.entities[0].type, "spoiler");
    assertEquals(formatted.entities[0].offset, 0);
    assertEquals(formatted.entities[0].length, 6);
  });

  it("should parse blockquote with <blockquote>", () => {
    const formatted = FormattedString.fromHtml(
      "<blockquote>quote</blockquote>",
    );
    assertEquals(formatted.text, "quote");
    assertEquals(formatted.entities.length, 1);
    assertEquals(formatted.entities[0].type, "blockquote");
    assertEquals(formatted.entities[0].offset, 0);
    assertEquals(formatted.entities[0].length, 5);
  });

  it("should parse custom emoji with <tg-emoji>", () => {
    const formatted = FormattedString.fromHtml(
      '<tg-emoji emoji-id="12345">👍</tg-emoji>',
    );
    assertEquals(formatted.text, "👍");
    assertEquals(formatted.entities.length, 1);
    assertEquals(formatted.entities[0].type, "custom_emoji");
    assertEquals(formatted.entities[0].offset, 0);
    assertEquals(formatted.entities[0].length, 2);
    //@ts-expect-error quick test
    assertEquals(formatted.entities[0].custom_emoji_id, "12345");
  });
});

describe("FormattedString.fromHtml - Combined formatting", () => {
  it("should parse multiple adjacent tags", () => {
    const formatted = FormattedString.fromHtml("<b>Hello</b> <i>World</i>");
    assertEquals(formatted.text, "Hello World");
    assertEquals(formatted.entities.length, 2);
    assertEquals(formatted.entities[0].type, "bold");
    assertEquals(formatted.entities[0].offset, 0);
    assertEquals(formatted.entities[0].length, 5);
    assertEquals(formatted.entities[1].type, "italic");
    assertEquals(formatted.entities[1].offset, 6);
    assertEquals(formatted.entities[1].length, 5);
  });

  it("should parse nested tags", () => {
    const formatted = FormattedString.fromHtml("<b>Bold <i>and italic</i></b>");
    assertEquals(formatted.text, "Bold and italic");
    assertEquals(formatted.entities.length, 2);
    assertEquals(formatted.entities[0].type, "bold");
    assertEquals(formatted.entities[0].offset, 0);
    assertEquals(formatted.entities[0].length, 15);
    assertEquals(formatted.entities[1].type, "italic");
    assertEquals(formatted.entities[1].offset, 5);
    assertEquals(formatted.entities[1].length, 10);
  });

  it("should parse text with multiple formatting", () => {
    const formatted = FormattedString.fromHtml(
      "<b>Bold</b>, <i>italic</i>, and <u>underline</u>",
    );
    assertEquals(formatted.text, "Bold, italic, and underline");
    assertEquals(formatted.entities.length, 3);
    assertEquals(formatted.entities[0].type, "bold");
    assertEquals(formatted.entities[0].offset, 0);
    assertEquals(formatted.entities[0].length, 4);
    assertEquals(formatted.entities[1].type, "italic");
    assertEquals(formatted.entities[1].offset, 6);
    assertEquals(formatted.entities[1].length, 6);
    assertEquals(formatted.entities[2].type, "underline");
    assertEquals(formatted.entities[2].offset, 18);
    assertEquals(formatted.entities[2].length, 9);
  });

  it("should parse complex nested formatting", () => {
    const formatted = FormattedString.fromHtml(
      "<b>Bold <i>bold-italic <u>bold-italic-underline</u></i></b>",
    );
    assertEquals(formatted.text, "Bold bold-italic bold-italic-underline");
    assertEquals(formatted.entities.length, 3);
    assertEquals(formatted.entities[0].type, "bold");
    assertEquals(formatted.entities[0].offset, 0);
    assertEquals(formatted.entities[0].length, 38);
    assertEquals(formatted.entities[1].type, "italic");
    assertEquals(formatted.entities[1].offset, 5);
    assertEquals(formatted.entities[1].length, 33);
    assertEquals(formatted.entities[2].type, "underline");
    assertEquals(formatted.entities[2].offset, 17);
    assertEquals(formatted.entities[2].length, 21);
  });
});

describe("FormattedString.fromHtml - HTML entities", () => {
  it("should decode &lt; entity", () => {
    const formatted = FormattedString.fromHtml("&lt;tag&gt;");
    assertEquals(formatted.text, "<tag>");
    assertEquals(formatted.entities.length, 0);
  });

  it("should decode &amp; entity", () => {
    const formatted = FormattedString.fromHtml("A &amp; B");
    assertEquals(formatted.text, "A & B");
    assertEquals(formatted.entities.length, 0);
  });

  it("should decode &quot; entity", () => {
    const formatted = FormattedString.fromHtml("Say &quot;hello&quot;");
    assertEquals(formatted.text, 'Say "hello"');
    assertEquals(formatted.entities.length, 0);
  });

  it("should handle HTML entities in formatted text", () => {
    const formatted = FormattedString.fromHtml("<b>&lt;bold&gt;</b>");
    assertEquals(formatted.text, "<bold>");
    assertEquals(formatted.entities.length, 1);
    assertEquals(formatted.entities[0].type, "bold");
    assertEquals(formatted.entities[0].offset, 0);
    assertEquals(formatted.entities[0].length, 6);
  });
});

describe("FormattedString.fromHtml - Plain text", () => {
  it("should handle plain text without tags", () => {
    const formatted = FormattedString.fromHtml("Hello World");
    assertEquals(formatted.text, "Hello World");
    assertEquals(formatted.entities.length, 0);
  });

  it("should handle empty string", () => {
    const formatted = FormattedString.fromHtml("");
    assertEquals(formatted.text, "");
    assertEquals(formatted.entities.length, 0);
  });

  it("should handle text with mixed content", () => {
    const formatted = FormattedString.fromHtml(
      "Start <b>bold</b> middle <i>italic</i> end",
    );
    assertEquals(formatted.text, "Start bold middle italic end");
    assertEquals(formatted.entities.length, 2);
    assertEquals(formatted.entities[0].type, "bold");
    assertEquals(formatted.entities[0].offset, 6);
    assertEquals(formatted.entities[0].length, 4);
    assertEquals(formatted.entities[1].type, "italic");
    assertEquals(formatted.entities[1].offset, 18);
    assertEquals(formatted.entities[1].length, 6);
  });
});

describe("FormattedString.fromHtml - Edge cases", () => {
  it("should treat unknown tags as plain text", () => {
    const formatted = FormattedString.fromHtml(
      "<unknown>Hello</unknown> World",
    );
    assertEquals(formatted.text, "<unknown>Hello</unknown> World");
    assertEquals(formatted.entities.length, 0);
  });

  it("should accept opening tags", () => {
    const formatted = FormattedString.fromHtml("<b>Hello");
    assertEquals(formatted.text, "Hello");
    assertEquals(formatted.entities.length, 1);
    assertEquals(formatted.entities[0].type, "bold");
    assertEquals(formatted.entities[0].offset, 0);
    assertEquals(formatted.entities[0].length, 5);
  });

  it("should accept unmatched closing tags", () => {
    const formatted = FormattedString.fromHtml("Hello</b>World");
    assertEquals(formatted.text, "HelloWorld");
    assertEquals(formatted.entities.length, 1);
    assertEquals(formatted.entities[0].type, "bold");
    assertEquals(formatted.entities[0].offset, 5);
    assertEquals(formatted.entities[0].length, 5);
  });

  it("should handle malformed tags", () => {
    const formatted = FormattedString.fromHtml("< b>Hello</b>");
    assertEquals(formatted.text, "< b>Hello");
    assertEquals(formatted.entities.length, 0);
  });
});

describe("FormattedString - fromHtml instance method", () => {
  it("should combine existing FormattedString with parsed HTML", () => {
    const initial = new FormattedString("Hello ");
    const combined = initial.fromHtml("<b>world</b>!");

    assertEquals(combined.text, "Hello world!");
    assertEquals(combined.entities.length, 1);
    assertEquals(combined.entities[0].type, "bold");
    assertEquals(combined.entities[0].offset, 6);
    assertEquals(combined.entities[0].length, 5);
  });

  it("should preserve existing entities when appending HTML", () => {
    const initial = FormattedString.bold("Hello");
    const combined = initial.fromHtml(" <i>world</i>");

    assertEquals(combined.text, "Hello world");
    assertEquals(combined.entities.length, 2);
    assertEquals(combined.entities[0].type, "bold");
    assertEquals(combined.entities[0].offset, 0);
    assertEquals(combined.entities[0].length, 5);
    assertEquals(combined.entities[1].type, "italic");
    assertEquals(combined.entities[1].offset, 6);
    assertEquals(combined.entities[1].length, 5);
  });

  it("should handle multiple HTML appends", () => {
    const initial = new FormattedString("Start ");
    const step1 = initial.fromHtml("<b>bold</b> ");
    const step2 = step1.fromHtml("<i>italic</i>");

    assertEquals(step2.text, "Start bold italic");
    assertEquals(step2.entities.length, 2);
    assertEquals(step2.entities[0].type, "bold");
    assertEquals(step2.entities[0].offset, 6);
    assertEquals(step2.entities[0].length, 4);
    assertEquals(step2.entities[1].type, "italic");
    assertEquals(step2.entities[1].offset, 11);
    assertEquals(step2.entities[1].length, 6);
  });

  it("should work with complex HTML", () => {
    const initial = new FormattedString("Prefix: ");
    const combined = initial.fromHtml(
      '<a href="https://example.com">Link</a> with <code>code</code>',
    );

    assertEquals(combined.text, "Prefix: Link with code");
    assertEquals(combined.entities.length, 2);
    assertEquals(combined.entities[0].type, "text_link");
    assertEquals(combined.entities[0].offset, 8);
    assertEquals(combined.entities[0].length, 4);
    assertEquals(combined.entities[1].type, "code");
    assertEquals(combined.entities[1].offset, 18);
    assertEquals(combined.entities[1].length, 4);
  });

  it("should handle empty HTML string", () => {
    const initial = new FormattedString("Hello");
    const combined = initial.fromHtml("");

    assertEquals(combined.text, "Hello");
    assertEquals(combined.entities.length, 0);
  });

  it("should handle plain text HTML", () => {
    const initial = new FormattedString("Hello ");
    const combined = initial.fromHtml("world");

    assertEquals(combined.text, "Hello world");
    assertEquals(combined.entities.length, 0);
  });

  it("should work with nested HTML tags", () => {
    const initial = new FormattedString("Text: ");
    const combined = initial.fromHtml("<b>Bold <i>and italic</i></b>");

    assertEquals(combined.text, "Text: Bold and italic");
    assertEquals(combined.entities.length, 2);
    assertEquals(combined.entities[0].type, "bold");
    assertEquals(combined.entities[0].offset, 6);
    assertEquals(combined.entities[0].length, 15);
    assertEquals(combined.entities[1].type, "italic");
    assertEquals(combined.entities[1].offset, 11);
    assertEquals(combined.entities[1].length, 10);
  });

  it("should chain with other instance methods", () => {
    const result = new FormattedString("Start ")
      .fromHtml("<b>bold</b> ")
      .italic("italic");

    assertEquals(result.text, "Start bold italic");
    assertEquals(result.entities.length, 2);
    assertEquals(result.entities[0].type, "bold");
    assertEquals(result.entities[0].offset, 6);
    assertEquals(result.entities[0].length, 4);
    assertEquals(result.entities[1].type, "italic");
    assertEquals(result.entities[1].offset, 11);
    assertEquals(result.entities[1].length, 6);
  });
});
