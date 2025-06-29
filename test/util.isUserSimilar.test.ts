import { assertEquals, describe, it } from "./deps.test.ts";
import { isUserSimilar } from "../src/util.ts";
import type { User } from "../src/deps.deno.ts";

describe("isUserEqual", () => {
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

  it("null and undefined handling", () => {
    const user1 = {
      id: 123,
      is_bot: false,
      first_name: "John",
      last_name: null,
      username: undefined,
    } as unknown as User;
    const user2: User = {
      id: 123,
      is_bot: false,
      first_name: "John",
    };

    // null and undefined properties should be considered equal to absent properties
    assertEquals(isUserSimilar(user1, user2), true);
  });

  it("undefined vs null equivalence", () => {
    const user1 = {
      id: 123,
      is_bot: false,
      first_name: "John",
      last_name: null,
    } as unknown as User;
    const user2: User = {
      id: 123,
      is_bot: false,
      first_name: "John",
      last_name: undefined,
    };

    // null and undefined should be considered equal
    assertEquals(isUserSimilar(user1, user2), true);
  });

  it("extra properties with null/undefined", () => {
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
      username: null,
      language_code: undefined,
    } as unknown as User;

    // Extra null/undefined properties should not affect equality
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

    // user2 has a non-null property that user1 doesn't have
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

    // Different non-null properties should make users unequal
    assertEquals(isUserSimilar(user1, user2), false);
  });

  it("empty object equivalence", () => {
    const user1: User = { id: 123, is_bot: false, first_name: "Test" };
    const user2: User = { id: 123, is_bot: false, first_name: "Test" };

    assertEquals(isUserSimilar(user1, user2), true);
  });

  it("complex scenario with mixed null/undefined", () => {
    const user1 = {
      id: 123,
      is_bot: false,
      first_name: "John",
      last_name: null,
      username: "johndoe",
      language_code: undefined,
    } as unknown as User;
    const user2: User = {
      id: 123,
      is_bot: false,
      first_name: "John",
      username: "johndoe",
    };

    // Should be equal despite null/undefined differences
    assertEquals(isUserSimilar(user1, user2), true);
  });

  it("boolean properties", () => {
    const user1: User = {
      id: 123,
      is_bot: false,
      first_name: "John",
    };
    const user2: User = {
      id: 123,
      is_bot: false,
      first_name: "John",
    };

    assertEquals(isUserSimilar(user1, user2), true);

    const user3: User = {
      id: 123,
      is_bot: true,
      first_name: "John",
    };

    assertEquals(isUserSimilar(user1, user3), false);
  });
});