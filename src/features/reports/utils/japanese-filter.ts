const KATAKANA_TO_HIRAGANA_REGEX = /[\u30A1-\u30F6]/g
const HIRAGANA_MIN_CODE = 0x3041
const HIRAGANA_MAX_CODE = 0x3096
const KATAKANA_TO_HIRAGANA_OFFSET = 0x60

export function normalizeJapaneseText(text: string) {
  if (!text) {
    return ''
  }

  let normalized = text.normalize('NFKC')

  normalized = normalized.replace(KATAKANA_TO_HIRAGANA_REGEX, (char) => {
    const code = char.charCodeAt(0)
    const hiraganaCode = code - KATAKANA_TO_HIRAGANA_OFFSET
    if (hiraganaCode >= HIRAGANA_MIN_CODE && hiraganaCode <= HIRAGANA_MAX_CODE) {
      return String.fromCharCode(hiraganaCode)
    }
    return char
  })

  normalized = normalized.toLowerCase()

  return normalized
}

export function matchesJapaneseFilter(text: string, query: string) {
  if (!query) {
    return true
  }

  const normalizedText = normalizeJapaneseText(text)
  const normalizedQuery = normalizeJapaneseText(query)

  return normalizedText.includes(normalizedQuery)
}
