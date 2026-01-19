export class DailyReportServiceError extends Error {
  status = 500

  constructor(message: string = 'Daily report service error occurred') {
    super(message)
    this.name = 'DailyReportServiceError'
  }
}

export class DailyReportNotFoundError extends Error {
  status = 404

  constructor(id?: string) {
    super(id ? `Daily report with id ${id} not found` : 'Daily report not found')
    this.name = 'DailyReportNotFoundError'
  }
}
