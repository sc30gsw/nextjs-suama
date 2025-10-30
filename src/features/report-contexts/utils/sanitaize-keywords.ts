export function sanitizeKeywords(likeKeywords: string) {
  const convertedSpaces = likeKeywords.replace(/\u3000/g, ' ')

  const commasForSpaces = convertedSpaces.replace(/\s+/g, ',')

  const convertedCommas = commasForSpaces.replace(/、/g, ',')

  const sanitizedKeywords = convertedCommas.replace(/,+/g, ',').trim()

  return sanitizedKeywords
}
