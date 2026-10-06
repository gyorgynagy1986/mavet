import { describe, expect, it } from "vitest"
import { PHOTO_MAX_BYTES, PHOTO_MESSAGES, photoFileError } from "./photo"

describe("profile photo rule", () => {
  it("accepts JPEG, PNG and WebP up to the size limit", () => {
    expect(photoFileError({ type: "image/jpeg", size: 1024 })).toBeNull()
    expect(photoFileError({ type: "image/png", size: PHOTO_MAX_BYTES })).toBeNull()
    expect(photoFileError({ type: "image/webp", size: 1 })).toBeNull()
  })

  it("rejects a missing or empty file", () => {
    expect(photoFileError(null)).toBe(PHOTO_MESSAGES.missing)
    expect(photoFileError({ type: "image/jpeg", size: 0 })).toBe(PHOTO_MESSAGES.missing)
  })

  it("rejects other file types", () => {
    expect(photoFileError({ type: "image/gif", size: 10 })).toBe(PHOTO_MESSAGES.type)
    expect(photoFileError({ type: "application/pdf", size: 10 })).toBe(PHOTO_MESSAGES.type)
  })

  it("rejects files over the limit", () => {
    expect(photoFileError({ type: "image/jpeg", size: PHOTO_MAX_BYTES + 1 })).toBe(PHOTO_MESSAGES.size)
  })
})
