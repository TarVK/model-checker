/**
 * Gets the intersection of two sets
 * @param a The first set to intersect with
 * @param b The second set to intersect with
 * @returns The intersection of the two given sets
 */
export function intersect<T>(a: Set<T>, b: Set<T>): Set<T> {
    return new Set([...a].filter(v => b.has(v)));
}

/**
 * Gets the union of two sets
 * @param a The first set to union with
 * @param b The second set to union with
 * @returns The union of the two given sets
 */
export function union<T>(a: Set<T>, b: Set<T>): Set<T> {
    return new Set([...a, ...b]);
}

/**
 * Checks whether the two given sets are equivalent
 * @param a The first set to check
 * @param b The second set tocompare to
 * @returns Whether the two sets contain exactly the same items
 */
export function equals<T>(a: Set<T>, b: Set<T>): boolean {
    return isSubset(a, b) && a.size == b.size;
}

/**
 * Checks whether set a is a subset of b
 * @param a The potential subset
 * @param b The potential superset
 * @returns Whether a is a subset of b
 */
export function isSubset<T>(a: Set<T>, b: Set<T>): boolean {
    return [...a].every(v => b.has(v));
}
