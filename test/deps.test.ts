// Simple local assertion functions for testing
export function assertEquals<T>(actual: T, expected: T, msg?: string): void {
  if (actual !== expected) {
    throw new Error(msg || `Expected ${expected}, but got ${actual}`);
  }
}

export function assertInstanceOf<T>(actual: unknown, expectedType: new (...args: any[]) => T, msg?: string): void {
  if (!(actual instanceof expectedType)) {
    throw new Error(msg || `Expected instance of ${expectedType.name}, but got ${typeof actual}`);
  }
}
