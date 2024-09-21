import { expect, test } from "bun:test";
import justify from "./PDP";
test("always fail", () => {
  expect(justify("assuming some policies")).toBe(false);
});
