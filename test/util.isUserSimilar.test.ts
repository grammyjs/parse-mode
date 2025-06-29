import { assertEquals, describe, it } from "./deps.test.ts";
import { isUserSimilar } from "../src/util.ts";
import type { User } from "../src/deps.deno.ts";

describe("isUserSimilar", () => {
  it("identical users", () => {
    const user1: User = {
      id: 123,
      is_bot: false,
      first_name: "John",
      last_name: "Doe",
      username: "johndoe",
    };
    const user2: User = {
      id: 123,
      is_bot: false,
      first_name: "John",
      last_name: "Doe",
      username: "johndoe",
    };

    assertEquals(isUserSimilar(user1, user2), true);
  });

  it("different users", () => {
    const user1: User = {
      id: 123,
      is_bot: false,
      first_name: "John",
    };
    const user2: User = {
      id: 456,
      is_bot: false,
      first_name: "Jane",
    };

    assertEquals(isUserSimilar(user1, user2), false);
  });

  it("same properties but different values", () => {
    const user1: User = {
      id: 123,
      is_bot: false,
      first_name: "John",
    };
    const user2: User = {
      id: 123,
      is_bot: true,
      first_name: "John",
    };

    assertEquals(isUserSimilar(user1, user2), false);
  });

  it("extra properties with undefined", () => {
    const user1: User = {
      id: 123,
      is_bot: false,
      first_name: "John",
      last_name: "Doe",
    };
    const user2 = {
      id: 123,
      is_bot: false,
      first_name: "John",
      last_name: "Doe",
      language_code: undefined,
    };

    // Extra undefined properties should not affect equality
    assertEquals(isUserSimilar(user1, user2), true);
  });

  it("missing vs present property", () => {
    const user1: User = {
      id: 123,
      is_bot: false,
      first_name: "John",
    };
    const user2: User = {
      id: 123,
      is_bot: false,
      first_name: "John",
      username: "johndoe",
    };

    // user2 has a property that user1 doesn't have
    assertEquals(isUserSimilar(user1, user2), false);
  });

  it("different property sets", () => {
    const user1: User = {
      id: 123,
      is_bot: false,
      first_name: "John",
      username: "johndoe",
    };
    const user2: User = {
      id: 123,
      is_bot: false,
      first_name: "John",
      last_name: "Doe",
    };

    // Different set of properties should make users dissimilar
    assertEquals(isUserSimilar(user1, user2), false);
  });
});
