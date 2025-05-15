export function sanitizeKeywords(likeKeywords: string) {
  // 全角スペースを半角スペースに置換
  const convertedSpaces = likeKeywords.replace(/\u3000/g, ' ')

  // スペース（半角・全角）を半角カンマに置き換え
  const commasForSpaces = convertedSpaces.replace(/\s+/g, ',')

  // 全角カンマを半角カンマに置換
  const convertedCommas = commasForSpaces.replace(/、/g, ',')

  // 連続する半角カンマを1つのカンマに置換し、前後の空白を削除
  const sanitizedKeywords = convertedCommas.replace(/,+/g, ',').trim()

  return sanitizedKeywords
}
