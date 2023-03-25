import { describe, expect, it } from "vitest"
import {
  isNpxCommandValid,
  sessionPath,
  fullSessionPath,
  generateShellCommands,
} from "./logic"

describe("isNpxCommandValid", () => {
  it("returns false on foo", () => {
    expect(isNpxCommandValid("foo")).toBeFalsy()
  })

  it("returns false on an incomplete command", () => {
    expect(isNpxCommandValid("npx")).toBeFalsy()
    expect(isNpxCommandValid("npx ghcd@latest")).toBeFalsy()
  })

  it("returns false if sessions is not part of the path", () => {
    expect(
      isNpxCommandValid("npx ghcd@latest some/repo/tree/main/dir")
    ).toBeFalsy()
  })

  it("returns true on a complete command", () => {
    expect(
      isNpxCommandValid("npx ghcd@latest some/repo/sessions/path")
    ).toBeTruthy()
    expect(
      isNpxCommandValid("npx ghcd@latest some/repo/sessions/some/dir")
    ).toBeTruthy()
  })

  it("aceepts multiple spaces", () => {
    expect(
      isNpxCommandValid(" npx   ghcd@latest   some/repo/sessions/dir ")
    ).toBeTruthy()
  })

  it("allows digits in the command", () => {
    expect(
      isNpxCommandValid("npx ghcd@latest some/repo/sessions/path/dir123")
    ).toBeTruthy()
  })
})

describe("sessionPath", () => {
  it("returns the session path", () => {
    expect(
      sessionPath(
        "npx ghcd@latest some/repo/tree/main/sessions/path/to/session"
      )
    ).toEqual("path/to/session")
  })

  it("returns falsy given an invalid command", () => {
    expect(sessionPath("foo")).toBeFalsy()
  })
})

describe("fullSessionPath", () => {
  it("returns the full session path", () => {
    expect(
      fullSessionPath(
        "npx ghcd@latest some/repo/tree/main/sessions/path/to/session"
      )
    ).toEqual("some/repo/tree/main/sessions/path/to/session")
  })

  it("returns falsy given an invalid command", () => {
    expect(fullSessionPath("foo")).toBeFalsy()
  })
})

describe("generateShellCommands", () => {
  it("returns the commands as it should for 2 dirs", () => {
    const command = "npx ghcd@latest some/repo/tree/main/sessions/my/session"
    const date = new Date("2023-03-25T04:50:00.802Z")
    expect(generateShellCommands(command, date)).toEqual([
      "git switch main",
      "git pull",
      "mkdir -p my",
      "npx ghcd@latest some/repo/tree/main/sessions/my/session my/session",
      "git add my/session",
      "git commit -m 'Init Challenges/2023 03 25/my/session'",
      "git push",
      "git switch -c challenges/2023-03-25/my/session",
      "git push -u origin challenges/2023-03-25/my/session",
    ])
  })

  it("returns the commands as it should for 3 dirs", () => {
    const command =
      "npx ghcd@latest some/repo/tree/main/sessions/path/to/session"
    const date = new Date("2023-03-25T04:50:00.802Z")
    expect(generateShellCommands(command, date)).toEqual([
      "git switch main",
      "git pull",
      "mkdir -p path/to",
      "npx ghcd@latest some/repo/tree/main/sessions/path/to/session path/to/session",
      "git add path/to/session",
      "git commit -m 'Init Challenges/2023 03 25/path/to/session'",
      "git push",
      "git switch -c challenges/2023-03-25/path/to/session",
      "git push -u origin challenges/2023-03-25/path/to/session",
    ])
  })
})
