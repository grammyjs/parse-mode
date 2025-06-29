import type { MessageEntity, User } from "./deps.deno.ts";

/**
 * Compares two user objects for deep similarity.
 * @param user1 First user object to compare
 * @param user2 Second user object to compare
 * @returns true if the users have the same properties, false otherwise
 */
export function isUserSimilar(user1: User, user2: User): boolean {
  const propertyComparisonMap = new Map<string, unknown>();

  for (const [key, value] of Object.entries(user1)) {
    if (value === undefined) {
      // We shall consider absent properties and undefined as "equal"
      continue;
    }
    propertyComparisonMap.set(key, value);
  }

  for (const [key, value] of Object.entries(user2)) {
    if (value === undefined) {
      continue;
    }
    if (!propertyComparisonMap.has(key)) {
      return false; // user2 has a defined property that user1 does not
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
    return isUserSimilar(entity1.user, entity2.user);
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
  const sortedEntities1 = sortEntities(entities1);
  const sortedEntities2 = sortEntities(entities2);

  for (let i = 0; i < sortedEntities1.length; i++) {
    const entity1 = sortedEntities1[i];
    const entity2 = sortedEntities2[i];
    if (!isEntityEqual(entity1, entity2)) {
      return false;
    }
  }
  return true;
}

/**
 * Helper method to check if two entities can be consolidated
 * @param entity1 First entity
 * @param entity2 Second entity
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

  // Decide who comes first
  const [leftEntity, rightEntity] = entity1.offset > entity2.offset
    ? [entity2, entity1]
    : [entity1, entity2];

  // Check if entities overlap or are adjacent
  const leftEntityEnd = leftEntity.offset + leftEntity.length;
  const rightEntityStart = rightEntity.offset;

  // Adjacent (touching) or overlapping entities can be consolidated
  return rightEntityStart <= leftEntityEnd;
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

  const sortedEntities = sortEntities(entities);
  const consolidatedEntities: MessageEntity[] = [];
  const consolidatingEntities: Map<string, MessageEntity> = new Map();

  for (const sortedEntity of sortedEntities) {
    // Create a key that includes type and type-specific properties
    let key = sortedEntity.type;

    if (sortedEntity.type === "text_link") {
      key += `|${sortedEntity.url}`;
    } else if (sortedEntity.type === "pre") {
      key += `|${sortedEntity.language || ""}`;
    } else if (sortedEntity.type === "custom_emoji") {
      key += `|${sortedEntity.custom_emoji_id}`;
    } else if (sortedEntity.type === "text_mention") {
      // Use user.id as key, nothing we can do about different User object with same id (e.g. username changes over time)
      key += `|${sortedEntity.user.id}`;
    }

    // If no consolidating entity for this key, this is the consolidating entity
    const consolidatingEntity = consolidatingEntities.get(key);
    if (consolidatingEntity === undefined) {
      consolidatingEntities.set(key, sortedEntity);
      continue;
    }

    // If a consolidating entity exist, check if it can be consolidated
    if (canConsolidateEntities(consolidatingEntity, sortedEntity)) {
      // entities were sorted by offset first, so previous entity is always at least less than or equal in offset
      const offset = consolidatingEntity.offset;
      const end = Math.max(
        consolidatingEntity.offset + consolidatingEntity.length,
        sortedEntity.offset + sortedEntity.length,
      );
      const length = end - offset;
      const consolidatedEntity = {
        ...consolidatingEntity,
        offset,
        length,
      };
      consolidatingEntities.set(key, consolidatedEntity);
      continue;
    }

    // If the key match but cannot be consolidated, then replace consolidatingEntity
    consolidatedEntities.push(consolidatingEntity);
    consolidatingEntities.set(key, sortedEntity);
  }

  // Pop everything out of consolidatingEntities
  for (const consolidatingEntity of consolidatingEntities.values()) {
    consolidatedEntities.push(consolidatingEntity);
  }

  // Finally, sort and return
  return sortEntities(consolidatedEntities);
}

/**
 * Sorts an array of MessageEntity objects deterministically.
 * Entities are sorted by offset first, then by length, then by type,
 * and finally by type-specific properties to ensure consistent ordering.
 * @param entities Array of entities to sort
 * @returns New sorted array of entities
 */
/**
 * Compare two entities for deterministic sorting.
 * This comparison function is used by both sortEntities and consolidateEntities
 * to ensure consistent entity ordering across different operations.
 */
function compareEntities(a: MessageEntity, b: MessageEntity): number {
  // Primary sort: by offset (position in text)
  if (a.offset !== b.offset) {
    return a.offset - b.offset;
  }

  // Secondary sort: by length (shorter entities first)
  if (a.length !== b.length) {
    return a.length - b.length;
  }

  // Tertiary sort: by type (alphabetically)
  if (a.type !== b.type) {
    return a.type.localeCompare(b.type);
  }

  // Quaternary sort: by type-specific properties
  if (a.type === "text_link" && b.type === "text_link") {
    return a.url.localeCompare(b.url);
  }

  if (a.type === "pre" && b.type === "pre") {
    return (a.language ?? "").localeCompare(b.language ?? "");
  }

  if (a.type === "custom_emoji" && b.type === "custom_emoji") {
    return a.custom_emoji_id.localeCompare(b.custom_emoji_id);
  }

  if (a.type === "text_mention" && b.type === "text_mention") {
    // Sort by user ID first only
    return a.user.id - b.user.id;
  }

  // For entities of the same type without type-specific properties,
  // they are considered equal in terms of sorting
  return 0;
}

export function sortEntities(
  entities: MessageEntity[],
): MessageEntity[] {
  return [...entities].sort(compareEntities);
}
