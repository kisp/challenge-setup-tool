import { describe, expect, it } from "vitest";
import { isNpxCommandValid, parseNpxCommand } from "./logic";

describe("isNpxCommandValid", () => {
  it("returns false on foo", () => {
    expect(isNpxCommandValid("foo")).toBeFalsy();
  });
  it("returns false on an incomplete command", () => {
    expect(isNpxCommandValid("npx")).toBeFalsy();
    expect(isNpxCommandValid("npx ghcd@latest")).toBeFalsy();
  });
  it("returns false if sessions is not part of the path", () => {
    expect(
      isNpxCommandValid("npx ghcd@latest some/repo/tree/main/dir")
    ).toBeFalsy();
  });
  it("returns true on a complete command", () => {
    expect(
      isNpxCommandValid("npx ghcd@latest some/repo/sessions/path")
    ).toBeTruthy();
    expect(
      isNpxCommandValid("npx ghcd@latest some/repo/sessions/some/dir")
    ).toBeTruthy();
  });
  it("aceepts multiple spaces", () => {
    expect(
      isNpxCommandValid(" npx   ghcd@latest   some/repo/sessions/dir ")
    ).toBeTruthy();
  });
  it("allows digits in the command", () => {
    expect(
      isNpxCommandValid("npx ghcd@latest some/repo/sessions/path/dir123")
    ).toBeTruthy();
  });
});

describe("parseNpxCommand", () => {
  it("parses a valid command successfully", () => {
    expect(
      parseNpxCommand("npx ghcd@latest some/repo/sessions/path")
    ).toBeTruthy();
  });
  it("returns the session path", () => {
    expect(
      parseNpxCommand(
        "npx ghcd@latest some/repo/tree/main/sessions/path/to/session"
      )
    ).toEqual("path/to/session");
  });
});
