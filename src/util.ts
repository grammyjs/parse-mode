import type { MessageEntity, User } from "./deps.deno.ts";

/**
 * Compares two user objects for deep equality.
 * @param user1 First user object to compare
 * @param user2 Second user object to compare
 * @returns true if the users have the same properties, false otherwise
 */
export function isUserEqual(user1: User, user2: User): boolean {
  const propertyComparisonMap = new Map<string, unknown>();

  for (const [key, value] of Object.entries(user1)) {
    if (value == undefined) {
      // We shall consider absent properties, null, and undefined as "equal"
      continue;
    }
    propertyComparisonMap.set(key, value);
  }

  for (const [key, value] of Object.entries(user2)) {
    if (value == undefined) {
      continue;
    }
    if (!propertyComparisonMap.has(key)) {
      return false; // user2 has a non-nil property that user1 does not
    }
    if (propertyComparisonMap.get(key) !== value) {
      return false;
    }
    // Remove the property from the map to ensure all properties match
    propertyComparisonMap.delete(key);
  }

  return propertyComparisonMap.size === 0; // All properties matched
}

/**
 * Checks if two entities are similar without requiring length and offset to be equal.
 * This method compares entity types and type-specific properties but ignores position and size.
 * @param entity1 First entity to compare
 * @param entity2 Second entity to compare
 * @returns true if the entities are similar (same type and properties), false otherwise
 */
export function isEntitySimilar(
  entity1: MessageEntity,
  entity2: MessageEntity,
) {
  // Must have the same type
  if (entity1.type !== entity2.type) {
    return false;
  }

  // Compare type-specific properties based on entity type
  if (entity1.type === "text_link" && entity2.type === "text_link") {
    return entity1.url === entity2.url;
  }

  if (entity1.type === "pre" && entity2.type === "pre") {
    return entity1.language === entity2.language;
  }

  if (entity1.type === "custom_emoji" && entity2.type === "custom_emoji") {
    return entity1.custom_emoji_id === entity2.custom_emoji_id;
  }

  if (entity1.type === "text_mention" && entity2.type === "text_mention") {
    return isUserEqual(entity1.user, entity2.user);
  }

  // For entities without type-specific properties, having the same type means they are similar
  return true;
}

/**
 * Checks if two entities are equal, including their offset and length properties.
 * This method performs a complete comparison of all entity properties.
 * @param entity1 First entity to compare
 * @param entity2 Second entity to compare
 * @returns true if the entities are completely equal, false otherwise
 */
export function isEntityEqual(
  entity1: MessageEntity,
  entity2: MessageEntity,
) {
  // First check if they are similar (type and type-specific properties)
  if (!isEntitySimilar(entity1, entity2)) {
    return false;
  }

  // Then check offset and length
  return entity1.offset === entity2.offset && entity1.length === entity2.length;
}

/**
 * Helper method to compare two arrays of message entities for exact equality
 * @param entities1 First array of entities
 * @param entities2 Second array of entities
 * @returns true if the entities are exactly equal, false otherwise
 */
export function isEntitiesEqual(
  entities1: MessageEntity[],
  entities2: MessageEntity[],
) {
  if (entities1.length !== entities2.length) {
    return false;
  }

  for (let i = 0; i < entities1.length; i++) {
    const entity1 = entities1[i];
    const entity2 = entities2[i];
    if (!isEntityEqual(entity1, entity2)) {
      return false;
    }
  }
  return true;
}

/**
 * Helper method to check if two entities can be consolidated
 * @param entity1 First entity
 * @param entity2 Second entity (should have offset >= entity1.offset)
 * @returns true if entities can be consolidated, false otherwise
 */
export function canConsolidateEntities(
  entity1: MessageEntity,
  entity2: MessageEntity,
) {
  // Must be similar entities
  if (!isEntitySimilar(entity1, entity2)) {
    return false;
  }

  // Check if entities overlap or are adjacent
  const entity1End = entity1.offset + entity1.length;
  const entity2Start = entity2.offset;

  // Adjacent (touching) or overlapping entities can be consolidated
  return entity2Start <= entity1End;
}

/**
 * Consolidates overlapping or adjacent entities of the same type
 * @param entities Array of entities to consolidate
 * @returns New array with consolidated entities
 */
export function consolidateEntities(
  entities: MessageEntity[],
): MessageEntity[] {
  if (entities.length <= 1) {
    return entities;
  }

  // Group entities by type and type-specific properties
  const entityGroups = new Map<string, MessageEntity[]>();

  for (const entity of entities) {
    // Create a key that includes type and type-specific properties
    let key = entity.type;

    if (entity.type === "text_link") {
      key += `|${entity.url}`;
    } else if (entity.type === "pre") {
      key += `|${entity.language || ""}`;
    } else if (entity.type === "custom_emoji") {
      key += `|${entity.custom_emoji_id}`;
    } else if (entity.type === "text_mention") {
      // Create a unique key for the user object
      const userKey = JSON.stringify(entity.user);
      key += `|${userKey}`;
    }

    if (!entityGroups.has(key)) {
      entityGroups.set(key, []);
    }
    entityGroups.get(key)!.push({ ...entity });
  }

  const consolidated: MessageEntity[] = [];

  // Process each group separately
  for (const group of entityGroups.values()) {
    if (group.length === 1) {
      consolidated.push(group[0]);
      continue;
    }

    // Sort entities in the group by offset
    group.sort((a, b) => a.offset - b.offset);

    let current = group[0];

    for (let i = 1; i < group.length; i++) {
      const next = group[i];

      // Check if entities overlap or are adjacent
      const currentEnd = current.offset + current.length;
      const nextStart = next.offset;

      if (nextStart <= currentEnd) {
        // Merge the entities by extending the current entity
        const nextEnd = next.offset + next.length;
        current.length = Math.max(currentEnd, nextEnd) - current.offset;
      } else {
        // Gap between entities, add current to result and start new consolidation
        consolidated.push(current);
        current = next;
      }
    }

    // Add the last entity from this group
    consolidated.push(current);
  }

  // Sort the final result by offset
  return consolidated.sort((a, b) => a.offset - b.offset);
}
