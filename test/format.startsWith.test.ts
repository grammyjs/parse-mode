import { assertEquals, describe, it } from "./deps.test.ts";
import { FormattedString } from "../src/format.ts";

describe("FormattedString - startsWith and endsWith methods", () => {
  it("Static startsWith - basic functionality", () => {
    const source = new FormattedString("Hello World");
    const pattern1 = new FormattedString("Hello");
    const pattern2 = new FormattedString("World");
    const pattern3 = new FormattedString("Hi");

    assertEquals(FormattedString.startsWith(source, pattern1), true);
    assertEquals(FormattedString.startsWith(source, pattern2), false);
    assertEquals(FormattedString.startsWith(source, pattern3), false);
  });

  it("Static startsWith - empty pattern", () => {
    const source = new FormattedString("Hello World");
    const emptyPattern = new FormattedString("");

    assertEquals(FormattedString.startsWith(source, emptyPattern), true);
  });

  it("Static startsWith - empty source", () => {
    const emptySource = new FormattedString("");
    const pattern = new FormattedString("Hello");
    const emptyPattern = new FormattedString("");

    assertEquals(FormattedString.startsWith(emptySource, pattern), false);
    assertEquals(FormattedString.startsWith(emptySource, emptyPattern), true);
  });

  it("Static startsWith - pattern longer than source", () => {
    const source = new FormattedString("Hi");
    const pattern = new FormattedString("Hello World");

    assertEquals(FormattedString.startsWith(source, pattern), false);
  });

  it("Static startsWith - exact match", () => {
    const source = new FormattedString("Hello World");
    const pattern = new FormattedString("Hello World");

    assertEquals(FormattedString.startsWith(source, pattern), true);
  });

  it("Static startsWith - with entities matching", () => {
    const source = FormattedString.bold("Hello").concat(
      new FormattedString(" World"),
    );
    const pattern = FormattedString.bold("Hello");

    assertEquals(FormattedString.startsWith(source, pattern), true);
  });

  it("Static startsWith - with entities not matching", () => {
    const source = FormattedString.bold("Hello World");
    const pattern = new FormattedString("Hello"); // no bold entity

    assertEquals(FormattedString.startsWith(source, pattern), false);
  });

  it("Static startsWith - complex entities matching", () => {
    const boldHello = FormattedString.bold("Hello");
    const space = new FormattedString(" ");
    const italicWorld = FormattedString.italic("World");
    const source = FormattedString.join([boldHello, space, italicWorld]);

    const pattern1 = FormattedString.join([boldHello, space]);
    const pattern2 = FormattedString.join([
      new FormattedString("Hello"),
      space,
    ]);

    assertEquals(FormattedString.startsWith(source, pattern1), true);
    assertEquals(FormattedString.startsWith(source, pattern2), false);
  });

  it("Instance startsWith - basic functionality", () => {
    const source = new FormattedString("Hello World");
    const pattern1 = new FormattedString("Hello");
    const pattern2 = new FormattedString("World");

    assertEquals(source.startsWith(pattern1), true);
    assertEquals(source.startsWith(pattern2), false);
  });
});
