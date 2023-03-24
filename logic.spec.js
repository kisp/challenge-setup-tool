import { describe, expect, it } from "vitest";
import { isNpxCommandValid, sessionPath, generateShellCommands } from "./logic";

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

describe("sessionPath", () => {
  it("parses a valid command successfully", () => {
    expect(sessionPath("npx ghcd@latest some/repo/sessions/path")).toBeTruthy();
  });
  it("returns the session path", () => {
    expect(
      sessionPath(
        "npx ghcd@latest some/repo/tree/main/sessions/path/to/session"
      )
    ).toEqual("path/to/session");
  });
});

describe("generateShellCommands", () => {
  it("returns the commands as it should", () => {
    const command =
      "npx ghcd@latest some/repo/tree/main/sessions/path/to/session";
    expect(generateShellCommands(command)).toEqual([
      "git switch main",
      "mkdir -p path/to",
      "npx ghcd@latest some/repo/tree/main/sessions/path/to/session path/to/session",
    ]);
  });
});
