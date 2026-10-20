/**
 * Bunny.net Stream for members-only videos (specification 6.1, ND-37): token-protected playback so a
 * direct video address cannot be reused without the membership check.
 *
 * NOT WIRED UP YET (client decision, 2026-10-20): the model and the admin form know the provider, but
 * publishing a Bunny video is refused and this module reports "not configured". When the Bunny library
 * exists, fill in the environment below and implement `bunnyEmbedUrl` with the signed token
 * (https://docs.bunny.net/docs/stream-embed-token-authentication): sha256(securityKey + videoId + expires)
 * passed as `?token=…&expires=…` on https://iframe.mediadelivery.net/embed/<libraryId>/<videoId>.
 */

/** BUNNY_STREAM_LIBRARY_ID and BUNNY_STREAM_TOKEN_KEY (the library's "Token authentication key"). */
export function isBunnyConfigured(): boolean {
  return false // Boolean(process.env.BUNNY_STREAM_LIBRARY_ID && process.env.BUNNY_STREAM_TOKEN_KEY)
}

/** A short-lived, signed embed address for an active member. Throws until Bunny is wired up. */
export function bunnyEmbedUrl(videoId: string): string {
  throw new Error(`A Bunny.net lejátszás még nincs bekötve (videó: ${videoId}).`)
}
