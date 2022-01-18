/**
 * Encode a string as base64
 *
 * Credit to https://base64.guru/developers/javascript/examples/polyfill
 */
export function base64(origin: string): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="

  const len = origin.length - 1
  let i = -1
  let encoded = ""

  while (i < len) {
    const code =
      (origin.charCodeAt(++i) << 16) | (origin.charCodeAt(++i) << 8) | origin.charCodeAt(++i)
    encoded +=
      alphabet[(code >>> 18) & 63] +
      alphabet[(code >>> 12) & 63] +
      alphabet[(code >>> 6) & 63] +
      alphabet[code & 63]
  }

  var pads = origin.length % 3
  if (pads > 0) {
    encoded = encoded.slice(0, pads - 3)

    while (encoded.length % 4 !== 0) {
      encoded += "="
    }
  }

  return encoded
}
