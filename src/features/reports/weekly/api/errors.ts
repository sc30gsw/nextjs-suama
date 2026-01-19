export class WeeklyReportServiceError extends Error {
  status = 500

  constructor(message: string = 'Weekly report service error occurred') {
    super(message)
    this.name = 'WeeklyReportServiceError'
  }
}

export class WeeklyReportNotFoundError extends Error {
  status = 404

  constructor(id?: string) {
    super(id ? `Weekly report with id ${id} not found` : 'Weekly report not found')
    this.name = 'WeeklyReportNotFoundError'
  }
}
