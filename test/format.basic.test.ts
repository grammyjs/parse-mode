import { assertEquals, assertInstanceOf, describe, it } from "./deps.test.ts";
import { FormattedString } from "../src/format.ts";
import type { MessageEntity } from "../src/deps.deno.ts";

describe("FormattedString - Basic functionality", () => {
  it("Constructor", () => {
    const text = "Hello World";
    const entities: MessageEntity[] = [
      { type: "bold" as const, offset: 0, length: 5 },
    ];

    const formatted = new FormattedString(text, entities);

    assertEquals(formatted.rawText, text);
    assertEquals(formatted.rawEntities, entities);
  });

  it("Text and caption getters", () => {
    const text = "Hello World";
    const entities: MessageEntity[] = [
      { type: "bold" as const, offset: 0, length: 5 },
    ];

    const formatted = new FormattedString(text, entities);

    assertEquals(formatted.text, text);
    assertEquals(formatted.caption, text);
    assertEquals(formatted.entities, entities);
    assertEquals(formatted.caption_entities, entities);
  });

  it("toString method", () => {
    const text = "Hello World";
    const entities: MessageEntity[] = [
      { type: "bold" as const, offset: 0, length: 5 },
    ];

    const formatted = new FormattedString(text, entities);

    assertEquals(formatted.toString(), text);
  });
});