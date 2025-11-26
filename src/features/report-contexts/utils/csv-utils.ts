export function generateCsv<T extends Record<string, unknown>>(
  data: T[],
  columns: readonly (keyof T)[],
): string {
  if (data.length === 0) {
    return columns.join(',')
  }

  const header = columns.join(',')

  const rows = data.map((row) => {
    return columns
      .map((column) => {
        const value = row[column]

        if (value === null || value === undefined) {
          return ''
        }

        const stringValue = String(value)

        if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`
        }

        return stringValue
      })
      .join(',')
  })

  return [header, ...rows].join('\n')
}

export function createCsvBlob(csvString: string) {
  return new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename

  document.body.appendChild(link)
  link.click()

  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
