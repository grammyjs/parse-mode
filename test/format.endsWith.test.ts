import { assertEquals, describe, it } from "./deps.test.ts";
import { FormattedString } from "../src/format.ts";

describe("FormattedString - endsWith methods", () => {
  it("Static endsWith - basic functionality", () => {
    const source = new FormattedString("Hello World");
    const pattern1 = new FormattedString("World");
    const pattern2 = new FormattedString("Hello");
    const pattern3 = new FormattedString("Earth");

    assertEquals(FormattedString.endsWith(source, pattern1), true);
    assertEquals(FormattedString.endsWith(source, pattern2), false);
    assertEquals(FormattedString.endsWith(source, pattern3), false);
  });

  it("Static endsWith - empty pattern", () => {
    const source = new FormattedString("Hello World");
    const emptyPattern = new FormattedString("");

    assertEquals(FormattedString.endsWith(source, emptyPattern), true);
  });

  it("Static endsWith - empty source", () => {
    const emptySource = new FormattedString("");
    const pattern = new FormattedString("World");
    const emptyPattern = new FormattedString("");

    assertEquals(FormattedString.endsWith(emptySource, pattern), false);
    assertEquals(FormattedString.endsWith(emptySource, emptyPattern), true);
  });

  it("Static endsWith - pattern longer than source", () => {
    const source = new FormattedString("Hi");
    const pattern = new FormattedString("Hello World");

    assertEquals(FormattedString.endsWith(source, pattern), false);
  });

  it("Static endsWith - exact match", () => {
    const source = new FormattedString("Hello World");
    const pattern = new FormattedString("Hello World");

    assertEquals(FormattedString.endsWith(source, pattern), true);
  });

  it("Static endsWith - with entities matching", () => {
    const source = new FormattedString("Hello ").concat(
      FormattedString.italic("World"),
    );
    const pattern = FormattedString.italic("World");

    assertEquals(FormattedString.endsWith(source, pattern), true);
  });

  it("Static endsWith - with entities not matching", () => {
    const source = FormattedString.italic("Hello World");
    const pattern = new FormattedString("World"); // no italic entity

    assertEquals(FormattedString.endsWith(source, pattern), false);
  });

  it("Static endsWith - complex entities matching", () => {
    const plainStart = new FormattedString("Start");
    const space = new FormattedString(" ");
    const boldHello = FormattedString.bold("Hello");
    const italicWorld = FormattedString.italic("World");
    const source = FormattedString.join([
      plainStart,
      space,
      boldHello,
      space,
      italicWorld,
    ]);

    const pattern1 = FormattedString.join([boldHello, space, italicWorld]);
    const pattern2 = new FormattedString("World");

    assertEquals(FormattedString.endsWith(source, pattern1), true);
    assertEquals(FormattedString.endsWith(source, pattern2), false);
  });

  it("Instance endsWith - basic functionality", () => {
    const source = new FormattedString("Hello World");
    const pattern1 = new FormattedString("World");
    const pattern2 = new FormattedString("Hello");

    assertEquals(source.endsWith(pattern1), true);
    assertEquals(source.endsWith(pattern2), false);
  });
});
