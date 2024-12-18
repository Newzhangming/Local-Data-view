import { describe, expect, test } from "bun:test";

import { getRandom, getSkip, getTake } from "./digital";

describe("getTake tests", () => {
  test("test 1 should be number", () => {
    expect(getTake(1)).toBe(1);
  });

  test('test "1" number should be number', () => {
    expect(getTake("1")).toBe(1);
  });

  test('test "a" number should be number', () => {
    expect(getTake("a")).toBe(10);
  });

  test('test "a1" number should be number', () => {
    expect(getTake("a1")).toBe(10);
  });

  test('test "3a" number should be number', () => {
    expect(getTake("3a")).toBe(3);
  });

  test('test "" number should be number', () => {
    expect(getTake("")).toBe(10);
  });

  test('test "" number should be number', () => {
    expect(getTake("")).toBe(10);
  });
});

describe("getSkip tests", () => {
  test("test 1 should be number", () => {
    expect(getSkip(1, 3)).toBe(0);
  });

  test("test 3 should be number", () => {
    expect(getSkip(3, 3)).toBe(6);
  });

  test('test "1" number should be number', () => {
    expect(getSkip("1", 3)).toBe(0);
  });

  test('test "a" number should be number', () => {
    expect(getSkip("a", 3)).toBe(27);
  });

  test('test "a1" number should be number', () => {
    expect(getSkip("a1", 3)).toBe(27);
  });

  test('test "" number should be number', () => {
    expect(getSkip("", 3)).toBe(27);
  });
});

describe("getRandom tests", () => {
  test("test 1 should be number", () => {
    expect(getRandom(0, 2)).toBeGreaterThanOrEqual(0);
    expect(getRandom(0, 2)).toBeLessThanOrEqual(2);

    expect(getRandom(1, 10)).toBeGreaterThan(0);
    expect(getRandom(1, 10)).toBeLessThan(11);

    expect(getRandom(10, 100)).toBeGreaterThan(9);
    expect(getRandom(10, 100)).toBeLessThan(101);

    expect(getRandom(100, 1000)).toBeGreaterThan(99);
    expect(getRandom(100, 1000)).toBeLessThan(1001);

    expect(getRandom(1000, 10000)).toBeGreaterThan(999);
    expect(getRandom(1000, 10000)).toBeLessThan(10001);
  });
});
